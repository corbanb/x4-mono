import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { mkdtempSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { rmSync } from 'node:fs';
import {
  findMonorepoRoot,
  readMonorepoConfig,
  validateAppName,
  findNextPort,
} from '../src/commands/add.js';

let tempDir: string;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'create-x4-add-'));
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe('findMonorepoRoot', () => {
  test('finds root with turbo.json and packages/', () => {
    writeFileSync(join(tempDir, 'turbo.json'), '{}');
    mkdirSync(join(tempDir, 'packages'), { recursive: true });
    mkdirSync(join(tempDir, 'apps/web/src'), { recursive: true });

    // Starting from a nested dir should find root
    const result = findMonorepoRoot(join(tempDir, 'apps/web/src'));
    expect(result).toBe(tempDir);
  });

  test('returns null if no monorepo root found', () => {
    mkdirSync(join(tempDir, 'some/nested/dir'), { recursive: true });
    const result = findMonorepoRoot(join(tempDir, 'some/nested/dir'));
    expect(result).toBeNull();
  });

  test('finds root from root dir itself', () => {
    writeFileSync(join(tempDir, 'turbo.json'), '{}');
    mkdirSync(join(tempDir, 'packages'), { recursive: true });

    const result = findMonorepoRoot(tempDir);
    expect(result).toBe(tempDir);
  });
});

describe('readMonorepoConfig', () => {
  test('extracts scope and projectName from root package.json', () => {
    writeFileSync(join(tempDir, 'turbo.json'), '{}');
    mkdirSync(join(tempDir, 'packages'), { recursive: true });
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({ name: 'my-app' }));

    const config = readMonorepoConfig(tempDir);
    expect(config.scope).toBe('@my-app');
    expect(config.projectName).toBe('my-app');
  });

  test('extracts bundleId from existing mobile app.json', () => {
    writeFileSync(join(tempDir, 'turbo.json'), '{}');
    mkdirSync(join(tempDir, 'packages'), { recursive: true });
    mkdirSync(join(tempDir, 'apps/mobile-main'), { recursive: true });
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({ name: 'my-app' }));
    writeFileSync(
      join(tempDir, 'apps/mobile-main/app.json'),
      JSON.stringify({
        expo: {
          ios: { bundleIdentifier: 'com.myapp.mobile.main' },
        },
      }),
    );

    const config = readMonorepoConfig(tempDir);
    expect(config.bundleId).toBe('com.myapp');
  });

  test('returns null bundleId if no mobile app found', () => {
    writeFileSync(join(tempDir, 'turbo.json'), '{}');
    mkdirSync(join(tempDir, 'packages'), { recursive: true });
    mkdirSync(join(tempDir, 'apps'), { recursive: true });
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({ name: 'my-app' }));

    const config = readMonorepoConfig(tempDir);
    expect(config.bundleId).toBeNull();
  });
});

describe('validateAppName', () => {
  test('accepts valid kebab-case names', () => {
    const result = validateAppName('admin', join(tempDir, 'apps/mobile-admin'));
    expect(result.valid).toBe(true);
  });

  test('rejects uppercase names', () => {
    const result = validateAppName('Admin', join(tempDir, 'apps/mobile-Admin'));
    expect(result.valid).toBe(false);
  });

  test('rejects names starting with numbers', () => {
    const result = validateAppName('123app', join(tempDir, 'apps/mobile-123app'));
    expect(result.valid).toBe(false);
  });

  test('rejects if target directory exists', () => {
    const target = join(tempDir, 'apps/mobile-admin');
    mkdirSync(target, { recursive: true });
    const result = validateAppName('admin', target);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain('already exists');
    }
  });
});

describe('findNextPort', () => {
  test('returns base port if no apps exist', () => {
    const port = findNextPort(join(tempDir, 'apps'));
    expect(port).toBe(3004);
  });

  test('returns next available port', () => {
    mkdirSync(join(tempDir, 'apps/web'), { recursive: true });
    mkdirSync(join(tempDir, 'apps/marketing'), { recursive: true });
    mkdirSync(join(tempDir, 'apps/docs'), { recursive: true });

    writeFileSync(
      join(tempDir, 'apps/web/package.json'),
      JSON.stringify({ scripts: { dev: 'next dev --port 3000' } }),
    );
    writeFileSync(
      join(tempDir, 'apps/marketing/package.json'),
      JSON.stringify({ scripts: { dev: 'next dev --port 3001' } }),
    );
    writeFileSync(
      join(tempDir, 'apps/docs/package.json'),
      JSON.stringify({ scripts: { dev: 'next dev --port 3003' } }),
    );

    const port = findNextPort(join(tempDir, 'apps'));
    expect(port).toBe(3004);
  });

  test('skips used ports', () => {
    mkdirSync(join(tempDir, 'apps/portal'), { recursive: true });
    writeFileSync(
      join(tempDir, 'apps/portal/package.json'),
      JSON.stringify({ scripts: { dev: 'next dev --port 3004' } }),
    );

    const port = findNextPort(join(tempDir, 'apps'));
    expect(port).toBe(3005);
  });

  test('handles missing scripts gracefully', () => {
    mkdirSync(join(tempDir, 'apps/api'), { recursive: true });
    writeFileSync(join(tempDir, 'apps/api/package.json'), JSON.stringify({ name: '@x4/api' }));

    const port = findNextPort(join(tempDir, 'apps'));
    expect(port).toBe(3004);
  });
});
