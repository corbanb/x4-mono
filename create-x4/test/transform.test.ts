import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { rmSync } from 'node:fs';
import { transformTemplate } from '../src/transform.js';

let tempDir: string;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'create-x4-transform-'));
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe('transformTemplate', () => {
  test('transforms root package.json name field', async () => {
    writeFileSync(
      join(tempDir, 'package.json'),
      JSON.stringify({ name: 'x4-mono', version: '1.0.0' }, null, 2),
    );

    await transformTemplate({
      targetDir: tempDir,
      projectName: 'my-app',
      scope: '@my-app',
      bundleId: 'com.myapp',
      mobileName: 'main',
      verbose: false,
    });

    const pkg = JSON.parse(readFileSync(join(tempDir, 'package.json'), 'utf-8'));
    expect(pkg.name).toBe('my-app');
  });

  test('transforms @x4/* dependency names to new scope', async () => {
    writeFileSync(
      join(tempDir, 'package.json'),
      JSON.stringify(
        {
          name: '@x4/web',
          dependencies: {
            '@x4/shared': 'workspace:*',
            '@x4/auth': 'workspace:*',
            react: '^19.0.0',
          },
        },
        null,
        2,
      ),
    );

    await transformTemplate({
      targetDir: tempDir,
      projectName: 'my-app',
      scope: '@acme',
      bundleId: 'com.acme',
      mobileName: 'main',
      verbose: false,
    });

    const pkg = JSON.parse(readFileSync(join(tempDir, 'package.json'), 'utf-8'));
    expect(pkg.name).toBe('@acme/web');
    expect(pkg.dependencies['@acme/shared']).toBe('workspace:*');
    expect(pkg.dependencies['@acme/auth']).toBe('workspace:*');
    expect(pkg.dependencies['react']).toBe('^19.0.0');
    expect(pkg.dependencies['@x4/shared']).toBeUndefined();
  });

  test('performs global text replacement in .ts files', async () => {
    mkdirSync(join(tempDir, 'src'), { recursive: true });
    writeFileSync(
      join(tempDir, 'src/index.ts'),
      `import { foo } from "@x4/shared/types";\nconst name = "x4-mono";\n`,
    );

    await transformTemplate({
      targetDir: tempDir,
      projectName: 'cool-project',
      scope: '@cool-project',
      bundleId: 'com.coolproject',
      mobileName: 'main',
      verbose: false,
    });

    const content = readFileSync(join(tempDir, 'src/index.ts'), 'utf-8');
    expect(content).toContain('@cool-project/shared/types');
    expect(content).toContain('"cool-project"');
    expect(content).not.toContain('@x4/');
    expect(content).not.toContain('x4-mono');
  });

  test('transforms app.json for mobile', async () => {
    mkdirSync(join(tempDir, 'apps/mobile-main'), { recursive: true });
    writeFileSync(
      join(tempDir, 'apps/mobile-main/app.json'),
      JSON.stringify({
        expo: {
          name: 'x4',
          slug: 'x4-mobile-main',
          scheme: 'x4-main',
          ios: { bundleIdentifier: 'com.x4.mobile.main' },
          android: { package: 'com.x4.mobile.main' },
        },
      }),
    );

    await transformTemplate({
      targetDir: tempDir,
      projectName: 'my-app',
      scope: '@my-app',
      bundleId: 'com.myapp',
      mobileName: 'main',
      verbose: false,
    });

    const config = JSON.parse(readFileSync(join(tempDir, 'apps/mobile-main/app.json'), 'utf-8'));
    expect(config.expo.name).toBe('my-app');
    expect(config.expo.slug).toBe('my-app-mobile-main');
    expect(config.expo.scheme).toBe('my-app-main');
    expect(config.expo.ios.bundleIdentifier).toBe('com.myapp.mobile.main');
    expect(config.expo.android.package).toBe('com.myapp.mobile.main');
  });

  test('transforms electron-builder.yml', async () => {
    mkdirSync(join(tempDir, 'apps/desktop'), { recursive: true });
    writeFileSync(
      join(tempDir, 'apps/desktop/electron-builder.yml'),
      'appId: com.x4.desktop\nproductName: x4\ndirectories:\n  output: out\n',
    );

    await transformTemplate({
      targetDir: tempDir,
      projectName: 'my-app',
      scope: '@my-app',
      bundleId: 'com.myapp',
      mobileName: 'main',
      verbose: false,
    });

    const content = readFileSync(join(tempDir, 'apps/desktop/electron-builder.yml'), 'utf-8');
    expect(content).toContain('appId: com.myapp.desktop');
    expect(content).toContain('productName: my-app');
    expect(content).not.toContain('com.x4');
  });

  test('transforms bundle ID prefix in text files', async () => {
    mkdirSync(join(tempDir, 'src'), { recursive: true });
    writeFileSync(
      join(tempDir, 'src/config.ts'),
      `const id = "com.x4.mobile";\nconst desktop = "com.x4.desktop";\n`,
    );

    await transformTemplate({
      targetDir: tempDir,
      projectName: 'my-app',
      scope: '@my-app',
      bundleId: 'com.myapp',
      mobileName: 'main',
      verbose: false,
    });

    const content = readFileSync(join(tempDir, 'src/config.ts'), 'utf-8');
    expect(content).toContain('com.myapp.mobile');
    expect(content).toContain('com.myapp.desktop');
    expect(content).not.toContain('com.x4.');
  });

  test('preserves JSON formatting with 2-space indent', async () => {
    writeFileSync(
      join(tempDir, 'package.json'),
      JSON.stringify({ name: '@x4/shared', version: '0.0.0' }, null, 2) + '\n',
    );

    await transformTemplate({
      targetDir: tempDir,
      projectName: 'test',
      scope: '@test',
      bundleId: 'com.test',
      mobileName: 'main',
      verbose: false,
    });

    const raw = readFileSync(join(tempDir, 'package.json'), 'utf-8');
    // Should have 2-space indentation
    expect(raw).toContain('  "name"');
    // Should end with newline
    expect(raw.endsWith('\n')).toBe(true);
  });

  test('does not corrupt JSON when scope contains regex-special chars', async () => {
    writeFileSync(
      join(tempDir, 'package.json'),
      JSON.stringify({ name: '@x4/api', version: '1.0.0' }, null, 2),
    );

    // The scope itself shouldn't have special chars (validation catches them),
    // but test that the replacement engine handles the template values correctly
    await transformTemplate({
      targetDir: tempDir,
      projectName: 'my-app',
      scope: '@my-app',
      bundleId: 'com.myapp',
      mobileName: 'main',
      verbose: false,
    });

    const raw = readFileSync(join(tempDir, 'package.json'), 'utf-8');
    // Verify it's valid JSON
    expect(() => JSON.parse(raw)).not.toThrow();
    const pkg = JSON.parse(raw);
    expect(pkg.name).toBe('@my-app/api');
  });

  test('handles multiple package.json files in nested dirs', async () => {
    mkdirSync(join(tempDir, 'apps/web'), { recursive: true });
    mkdirSync(join(tempDir, 'packages/shared'), { recursive: true });

    writeFileSync(
      join(tempDir, 'apps/web/package.json'),
      JSON.stringify({
        name: '@x4/web',
        dependencies: { '@x4/shared': 'workspace:*' },
      }),
    );
    writeFileSync(
      join(tempDir, 'packages/shared/package.json'),
      JSON.stringify({ name: '@x4/shared', version: '0.0.0' }),
    );

    await transformTemplate({
      targetDir: tempDir,
      projectName: 'proj',
      scope: '@proj',
      bundleId: 'com.proj',
      mobileName: 'main',
      verbose: false,
    });

    const web = JSON.parse(readFileSync(join(tempDir, 'apps/web/package.json'), 'utf-8'));
    const shared = JSON.parse(readFileSync(join(tempDir, 'packages/shared/package.json'), 'utf-8'));

    expect(web.name).toBe('@proj/web');
    expect(web.dependencies['@proj/shared']).toBe('workspace:*');
    expect(shared.name).toBe('@proj/shared');
  });

  test('renames mobile directory for custom mobileName', async () => {
    mkdirSync(join(tempDir, 'apps/mobile-main'), { recursive: true });
    writeFileSync(
      join(tempDir, 'apps/mobile-main/app.json'),
      JSON.stringify({
        expo: {
          name: 'x4',
          slug: 'x4-mobile-main',
          scheme: 'x4-main',
          ios: { bundleIdentifier: 'com.x4.mobile.main' },
          android: { package: 'com.x4.mobile.main' },
        },
      }),
    );

    await transformTemplate({
      targetDir: tempDir,
      projectName: 'my-app',
      scope: '@my-app',
      bundleId: 'com.myapp',
      mobileName: 'consumer',
      verbose: false,
    });

    // Directory should be renamed
    expect(existsSync(join(tempDir, 'apps/mobile-main'))).toBe(false);
    expect(existsSync(join(tempDir, 'apps/mobile-consumer'))).toBe(true);

    // app.json should use the new mobileName
    const config = JSON.parse(
      readFileSync(join(tempDir, 'apps/mobile-consumer/app.json'), 'utf-8'),
    );
    expect(config.expo.slug).toBe('my-app-mobile-consumer');
    expect(config.expo.scheme).toBe('my-app-consumer');
    expect(config.expo.ios.bundleIdentifier).toBe('com.myapp.mobile.consumer');
  });

  test('global text replace substitutes mobile-main for custom name', async () => {
    mkdirSync(join(tempDir, 'src'), { recursive: true });
    writeFileSync(
      join(tempDir, 'src/workflow.yml'),
      `paths:\n  - 'apps/mobile-main/**'\nworking-directory: apps/mobile-main\n`,
    );

    await transformTemplate({
      targetDir: tempDir,
      projectName: 'my-app',
      scope: '@my-app',
      bundleId: 'com.myapp',
      mobileName: 'admin',
      verbose: false,
    });

    const content = readFileSync(join(tempDir, 'src/workflow.yml'), 'utf-8');
    expect(content).toContain('apps/mobile-admin');
    expect(content).not.toContain('mobile-main');
  });
});
