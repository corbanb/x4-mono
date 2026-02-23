import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { rmSync } from 'node:fs';
import { MOBILE_APP_TEMPLATE } from '../src/templates/mobile-app.js';
import { WEB_APP_TEMPLATE } from '../src/templates/web-app.js';
import { applyTemplate } from '../src/templates/apply.js';

let tempDir: string;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'create-x4-templates-'));
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe('MOBILE_APP_TEMPLATE', () => {
  test('has expected files', () => {
    const paths = MOBILE_APP_TEMPLATE.map((f) => f.path);
    expect(paths).toContain('package.json');
    expect(paths).toContain('app.json');
    expect(paths).toContain('tsconfig.json');
    expect(paths).toContain('eas.json');
    expect(paths).toContain('.env.example');
    expect(paths).toContain('src/lib/api.ts');
    expect(paths).toContain('src/lib/trpc-provider.tsx');
    expect(paths).toContain('app/_layout.tsx');
    expect(paths).toContain('app/index.tsx');
    expect(paths).toContain('app/login.tsx');
    expect(paths).toContain('app/signup.tsx');
    expect(paths).toContain('app/(authenticated)/_layout.tsx');
    expect(paths).toContain('app/(authenticated)/index.tsx');
  });

  test('all files have non-empty content', () => {
    for (const file of MOBILE_APP_TEMPLATE) {
      expect(file.content.length).toBeGreaterThan(0);
    }
  });
});

describe('WEB_APP_TEMPLATE', () => {
  test('has expected files', () => {
    const paths = WEB_APP_TEMPLATE.map((f) => f.path);
    expect(paths).toContain('package.json');
    expect(paths).toContain('next.config.ts');
    expect(paths).toContain('tsconfig.json');
    expect(paths).toContain('postcss.config.js');
    expect(paths).toContain('src/styles/globals.css');
    expect(paths).toContain('src/lib/trpc-provider.tsx');
    expect(paths).toContain('src/app/layout.tsx');
    expect(paths).toContain('src/app/page.tsx');
    expect(paths).toContain('src/app/(auth)/layout.tsx');
    expect(paths).toContain('src/app/(auth)/login/page.tsx');
    expect(paths).toContain('src/app/(auth)/signup/page.tsx');
    expect(paths).toContain('src/app/(dashboard)/layout.tsx');
    expect(paths).toContain('src/app/(dashboard)/page.tsx');
    expect(paths).toContain('src/middleware.ts');
    expect(paths).toContain('.env.example');
  });

  test('all files have non-empty content', () => {
    for (const file of WEB_APP_TEMPLATE) {
      expect(file.content.length).toBeGreaterThan(0);
    }
  });
});

describe('applyTemplate', () => {
  test('replaces all placeholders correctly', () => {
    applyTemplate({
      template: MOBILE_APP_TEMPLATE,
      targetDir: tempDir,
      replacements: {
        __SCOPE__: '@myapp',
        __PROJECT_NAME__: 'myapp',
        __MOBILE_NAME__: 'admin',
        __MOBILE_NAME_CLEAN__: 'Admin',
        __BUNDLE_ID__: 'com.myapp.mobile.admin',
      },
    });

    // Check files exist
    expect(existsSync(join(tempDir, 'package.json'))).toBe(true);
    expect(existsSync(join(tempDir, 'app.json'))).toBe(true);
    expect(existsSync(join(tempDir, 'app/_layout.tsx'))).toBe(true);

    // Check package.json replacements
    const pkg = JSON.parse(readFileSync(join(tempDir, 'package.json'), 'utf-8'));
    expect(pkg.name).toBe('@myapp/mobile-admin');
    expect(pkg.dependencies['@myapp/shared']).toBe('workspace:*');

    // Check app.json replacements
    const appJson = JSON.parse(readFileSync(join(tempDir, 'app.json'), 'utf-8'));
    expect(appJson.expo.slug).toBe('myapp-mobile-admin');
    expect(appJson.expo.ios.bundleIdentifier).toBe('com.myapp.mobile.admin');
  });

  test('no unreplaced __*__ tokens after apply for mobile', () => {
    applyTemplate({
      template: MOBILE_APP_TEMPLATE,
      targetDir: tempDir,
      replacements: {
        __SCOPE__: '@test',
        __PROJECT_NAME__: 'test',
        __MOBILE_NAME__: 'main',
        __MOBILE_NAME_CLEAN__: 'Main',
        __BUNDLE_ID__: 'com.test.mobile.main',
      },
    });

    for (const file of MOBILE_APP_TEMPLATE) {
      const content = readFileSync(join(tempDir, file.path), 'utf-8');
      const unreplaced = content.match(/__[A-Z_]+__/g);
      expect(unreplaced).toBeNull();
    }
  });

  test('no unreplaced __*__ tokens after apply for web', () => {
    applyTemplate({
      template: WEB_APP_TEMPLATE,
      targetDir: tempDir,
      replacements: {
        __SCOPE__: '@test',
        __PROJECT_NAME__: 'test',
        __WEB_NAME__: 'portal',
        __PORT__: '3004',
      },
    });

    for (const file of WEB_APP_TEMPLATE) {
      const content = readFileSync(join(tempDir, file.path), 'utf-8');
      const unreplaced = content.match(/__[A-Z_]+__/g);
      expect(unreplaced).toBeNull();
    }
  });

  test('web template uses correct port', () => {
    applyTemplate({
      template: WEB_APP_TEMPLATE,
      targetDir: tempDir,
      replacements: {
        __SCOPE__: '@test',
        __PROJECT_NAME__: 'test',
        __WEB_NAME__: 'admin',
        __PORT__: '3005',
      },
    });

    const pkg = JSON.parse(readFileSync(join(tempDir, 'package.json'), 'utf-8'));
    expect(pkg.scripts.dev).toContain('3005');
    expect(pkg.scripts.start).toContain('3005');
  });
});
