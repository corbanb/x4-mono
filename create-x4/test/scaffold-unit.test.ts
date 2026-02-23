import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test';
import { mkdtempSync, writeFileSync, mkdirSync, existsSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// Mock ONLY external deps — no internal source module mocking
// Mock giget to populate template instead of downloading from GitHub
const mockGigetDownload = mock(
  async (_source: string, _opts: { dir: string; force: boolean }) => {},
);

mock.module('giget', () => ({
  downloadTemplate: mockGigetDownload,
}));

// Shared @clack/prompts mock — see test/helpers/mock-clack.ts
import './helpers/mock-clack.js';

const { scaffold } = await import('../src/scaffold.js');

let tempDir: string;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'create-x4-scaffold-unit-'));
  mockGigetDownload.mockClear();
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

/**
 * Helper: make giget mock create a minimal template directory.
 * This simulates what giget would produce after downloading from GitHub.
 */
function setupGigetMock() {
  mockGigetDownload.mockImplementation(async (_source: string, opts: { dir: string }) => {
    const dir = opts.dir;
    mkdirSync(dir, { recursive: true });
    // Root
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'x4-mono' }, null, 2));
    writeFileSync(
      join(dir, 'turbo.json'),
      JSON.stringify({ globalEnv: ['DATABASE_URL'], tasks: { build: {} } }),
    );
    writeFileSync(join(dir, 'CLAUDE.md'), '# Instructions');
    writeFileSync(join(dir, 'README.md'), '# x4-mono readme');
    mkdirSync(join(dir, 'wiki'), { recursive: true });
    mkdirSync(join(dir, '.claude'), { recursive: true });
    // API
    mkdirSync(join(dir, 'apps/api/src/routers'), { recursive: true });
    writeFileSync(
      join(dir, 'apps/api/package.json'),
      JSON.stringify({ name: '@x4/api', dependencies: { '@x4/shared': 'workspace:*' } }),
    );
    writeFileSync(join(dir, 'apps/api/src/routers/index.ts'), 'export const appRouter = {};');
    // Web
    mkdirSync(join(dir, 'apps/web/src'), { recursive: true });
    writeFileSync(
      join(dir, 'apps/web/package.json'),
      JSON.stringify({ name: '@x4/web', dependencies: { '@x4/shared': 'workspace:*' } }),
    );
    // Shared
    mkdirSync(join(dir, 'packages/shared'), { recursive: true });
    writeFileSync(
      join(dir, 'packages/shared/package.json'),
      JSON.stringify({ name: '@x4/shared' }),
    );
  });
}

function baseConfig(overrides?: Record<string, unknown>) {
  return {
    projectName: 'test-proj',
    scope: '@test',
    bundleId: 'com.test',
    mobileName: 'main',
    excludePlatforms: [] as string[],
    pm: 'bun' as const,
    git: false,
    install: false,
    branch: 'main',
    verbose: false,
    cwd: tempDir,
    ...overrides,
  };
}

describe('scaffold', () => {
  test('calls giget with correct source URL and options', async () => {
    setupGigetMock();
    await scaffold(baseConfig());

    expect(mockGigetDownload).toHaveBeenCalledTimes(1);
    const [source, opts] = mockGigetDownload.mock.calls[0];
    expect(source).toBe('github:corbanb/x4-mono#main');
    expect(opts.dir).toBe(join(tempDir, 'test-proj'));
    expect(opts.force).toBe(true);
  });

  test('uses custom branch in giget source', async () => {
    setupGigetMock();
    await scaffold(baseConfig({ branch: 'feat/new' }));

    const [source] = mockGigetDownload.mock.calls[0];
    expect(source).toBe('github:corbanb/x4-mono#feat/new');
  });

  test('strips non-template files (CLAUDE.md, wiki, .claude)', async () => {
    setupGigetMock();
    await scaffold(baseConfig());

    const targetDir = join(tempDir, 'test-proj');
    expect(existsSync(join(targetDir, 'CLAUDE.md'))).toBe(false);
    expect(existsSync(join(targetDir, 'wiki'))).toBe(false);
    expect(existsSync(join(targetDir, '.claude'))).toBe(false);
  });

  test('transforms @x4 scope to custom scope', async () => {
    setupGigetMock();
    await scaffold(baseConfig({ scope: '@acme' }));

    const targetDir = join(tempDir, 'test-proj');
    const rootPkg = JSON.parse(readFileSync(join(targetDir, 'package.json'), 'utf-8'));
    expect(rootPkg.name).toBe('test-proj');

    const apiPkg = JSON.parse(readFileSync(join(targetDir, 'apps/api/package.json'), 'utf-8'));
    expect(apiPkg.name).toBe('@acme/api');
    expect(apiPkg.dependencies['@acme/shared']).toBe('workspace:*');
  });

  test('preserves template app directories', async () => {
    setupGigetMock();
    await scaffold(baseConfig());

    const targetDir = join(tempDir, 'test-proj');
    expect(existsSync(join(targetDir, 'apps/api'))).toBe(true);
    expect(existsSync(join(targetDir, 'apps/web'))).toBe(true);
    expect(existsSync(join(targetDir, 'packages/shared'))).toBe(true);
  });

  test('cleans up targetDir on download failure', async () => {
    mockGigetDownload.mockImplementation(async (_source: string, opts: { dir: string }) => {
      mkdirSync(opts.dir, { recursive: true });
      writeFileSync(join(opts.dir, 'partial-file'), 'data');
      throw new Error('download failed');
    });

    try {
      await scaffold(baseConfig());
      expect.unreachable('Should have thrown');
    } catch (err) {
      // downloadTemplate_ wraps errors after 3 retries
      expect((err as Error).message).toContain('download failed');
    }

    expect(existsSync(join(tempDir, 'test-proj'))).toBe(false);
  });

  test('does not filter when excludePlatforms is empty', async () => {
    setupGigetMock();
    // Add mobile dir to the giget mock
    mockGigetDownload.mockImplementation(async (_source: string, opts: { dir: string }) => {
      const dir = opts.dir;
      mkdirSync(join(dir, 'apps/mobile-main'), { recursive: true });
      mkdirSync(join(dir, 'apps/api/src'), { recursive: true });
      writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'x4-mono' }));
      writeFileSync(join(dir, 'apps/api/package.json'), JSON.stringify({ name: '@x4/api' }));
      writeFileSync(
        join(dir, 'apps/mobile-main/package.json'),
        JSON.stringify({ name: '@x4/mobile-main' }),
      );
    });

    await scaffold(baseConfig({ excludePlatforms: [] }));

    const targetDir = join(tempDir, 'test-proj');
    expect(existsSync(join(targetDir, 'apps/mobile-main'))).toBe(true);
  });
});
