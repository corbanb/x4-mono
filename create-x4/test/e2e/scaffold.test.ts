import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { rmSync } from 'node:fs';
import fg from 'fast-glob';
import { stripNonTemplateFiles } from '../../src/strip.js';
import { transformTemplate } from '../../src/transform.js';
import { filterPlatforms } from '../../src/filter.js';

let tempDir: string;

/**
 * Create a realistic template structure matching x4-mono.
 * This simulates what giget would produce after downloading.
 */
function createRealisticTemplate(): void {
  const dirs = [
    'apps/api/src/routers',
    'apps/api/src/lib',
    'apps/web/src/app/(dashboard)/ai',
    'apps/web/src/components',
    'apps/mobile-main/assets',
    'apps/desktop/src',
    'apps/marketing/src/components/hero',
    'apps/docs/content',
    'packages/shared/types',
    'packages/shared/utils',
    'packages/shared/ai-types',
    'packages/database/src',
    'packages/auth/src',
    'packages/ai-integrations/src',
    '.github/workflows',
    'wiki/completed',
    '.claude/commands',
    'create-x4/src',
  ];
  for (const d of dirs) {
    mkdirSync(join(tempDir, d), { recursive: true });
  }

  // Root package.json
  writeFileSync(
    join(tempDir, 'package.json'),
    JSON.stringify({
      name: 'x4-mono',
      workspaces: ['packages/*', 'apps/*'],
      dependencies: {},
    }),
  );

  // Apps
  writeFileSync(
    join(tempDir, 'apps/api/package.json'),
    JSON.stringify({
      name: '@x4/api',
      dependencies: {
        '@x4/shared': 'workspace:*',
        '@x4/database': 'workspace:*',
        '@x4/auth': 'workspace:*',
        '@x4/ai-integrations': 'workspace:*',
        hono: '^4.0.0',
      },
    }),
  );

  writeFileSync(
    join(tempDir, 'apps/api/src/routers/index.ts'),
    `import { router } from "../trpc";
import { usersRouter } from "./users";
import { aiRouter } from "./ai";
export const appRouter = router({ users: usersRouter, ai: aiRouter });
export type AppRouter = typeof appRouter;
`,
  );

  writeFileSync(join(tempDir, 'apps/api/src/routers/ai.ts'), 'export const aiRouter = {};');

  writeFileSync(
    join(tempDir, 'apps/web/package.json'),
    JSON.stringify({
      name: '@x4/web',
      dependencies: { '@x4/shared': 'workspace:*', '@x4/auth': 'workspace:*' },
    }),
  );

  writeFileSync(
    join(tempDir, 'apps/web/src/components/Layout.tsx'),
    `import { trpc } from "@x4/shared/api-client";\n`,
  );

  writeFileSync(
    join(tempDir, 'apps/mobile-main/package.json'),
    JSON.stringify({
      name: '@x4/mobile-main',
      dependencies: { '@x4/shared': 'workspace:*' },
    }),
  );

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

  writeFileSync(
    join(tempDir, 'apps/desktop/package.json'),
    JSON.stringify({
      name: '@x4/desktop',
      dependencies: { '@x4/shared': 'workspace:*' },
    }),
  );

  writeFileSync(
    join(tempDir, 'apps/desktop/electron-builder.yml'),
    'appId: com.x4.desktop\nproductName: x4\n',
  );

  writeFileSync(
    join(tempDir, 'apps/marketing/package.json'),
    JSON.stringify({ name: '@x4/marketing' }),
  );

  writeFileSync(
    join(tempDir, 'apps/marketing/src/components/hero/HeroContent.tsx'),
    `<code>bunx create-x4 my-app</code>\n<p>x4-mono boilerplate</p>`,
  );

  writeFileSync(join(tempDir, 'apps/docs/package.json'), JSON.stringify({ name: '@x4/docs' }));

  // Packages
  writeFileSync(
    join(tempDir, 'packages/shared/package.json'),
    JSON.stringify({
      name: '@x4/shared',
      exports: {
        './types': './types/index.ts',
        './utils': './utils/index.ts',
        './ai': './ai-types/index.ts',
      },
      scripts: { lint: 'eslint src/ types/ utils/ ai-types/' },
    }),
  );

  writeFileSync(
    join(tempDir, 'packages/database/package.json'),
    JSON.stringify({ name: '@x4/database' }),
  );

  writeFileSync(
    join(tempDir, 'packages/auth/package.json'),
    JSON.stringify({
      name: '@x4/auth',
      exports: {
        '.': './src/index.ts',
        './client': './src/client.ts',
        './client/native': './src/client.native.ts',
      },
      dependencies: { '@x4/database': 'workspace:*' },
    }),
  );

  writeFileSync(join(tempDir, 'packages/auth/src/client.native.ts'), 'export {};');

  writeFileSync(
    join(tempDir, 'packages/ai-integrations/package.json'),
    JSON.stringify({
      name: '@x4/ai-integrations',
      dependencies: { '@x4/shared': 'workspace:*' },
    }),
  );

  writeFileSync(
    join(tempDir, 'packages/ai-integrations/src/index.ts'),
    `import type { AiConfig } from "@x4/shared/ai";`,
  );

  // Workflow files
  for (const wf of [
    'ci.yml',
    'deploy-mobile-main.yml',
    'deploy-desktop.yml',
    'deploy-marketing.yml',
    'deploy-docs.yml',
  ]) {
    writeFileSync(join(tempDir, '.github/workflows', wf), `name: ${wf}\n`);
  }

  // turbo.json
  writeFileSync(
    join(tempDir, 'turbo.json'),
    JSON.stringify({
      globalEnv: [
        'DATABASE_URL',
        'MARKETING_URL',
        'DOCS_URL',
        'ANTHROPIC_API_KEY',
        'OPENAI_API_KEY',
      ],
      tasks: { build: {}, 'openapi:generate': {} },
    }),
  );

  // Non-template files (should be stripped)
  writeFileSync(join(tempDir, 'CLAUDE.md'), '# Instructions');
  writeFileSync(join(tempDir, '.claude/commands/test.md'), 'cmd');
  writeFileSync(join(tempDir, 'wiki/completed/prd-001.md'), 'PRD');
  writeFileSync(join(tempDir, 'create-x4/src/index.ts'), 'cli code');

  // .env.example
  writeFileSync(
    join(tempDir, '.env.example'),
    'DATABASE_URL=\nANTHROPIC_API_KEY=\nOPENAI_API_KEY=\nMARKETING_URL=\nDOCS_URL=\n',
  );

  // README
  writeFileSync(join(tempDir, 'README.md'), '# x4-mono\nThe x4-mono boilerplate.\n');
}

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'create-x4-e2e-'));
  createRealisticTemplate();
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe('E2E: full scaffold pipeline', () => {
  test('strip + transform produces zero @x4/ remnants', async () => {
    // Strip
    stripNonTemplateFiles({ targetDir: tempDir, verbose: false });

    // Transform
    await transformTemplate({
      targetDir: tempDir,
      projectName: 'acme-app',
      scope: '@acme',
      bundleId: 'com.acmeapp',
      mobileName: 'main',
      verbose: false,
    });

    // Verify no @x4/ remnants in any text file
    const files = await fg('**/*.{ts,tsx,json,md,yml,yaml}', {
      cwd: tempDir,
      ignore: ['**/node_modules/**'],
      absolute: true,
    });

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const relPath = file.replace(tempDir + '/', '');
      expect(content).not.toContain('@x4/');
      // x4-mono should also be replaced (except inside generated content)
      if (!relPath.includes('node_modules')) {
        expect(content).not.toContain('x4-mono');
      }
    }
  });

  test('strip removes non-template directories', () => {
    stripNonTemplateFiles({ targetDir: tempDir, verbose: false });

    expect(existsSync(join(tempDir, 'CLAUDE.md'))).toBe(false);
    expect(existsSync(join(tempDir, '.claude'))).toBe(false);
    expect(existsSync(join(tempDir, 'wiki'))).toBe(false);
    expect(existsSync(join(tempDir, 'create-x4'))).toBe(false);
    // Template files should still exist
    expect(existsSync(join(tempDir, 'apps/api/package.json'))).toBe(true);
    expect(existsSync(join(tempDir, 'README.md'))).toBe(true);
  });

  test('strip + transform + filter --no-ai removes all AI traces', async () => {
    stripNonTemplateFiles({ targetDir: tempDir, verbose: false });

    await transformTemplate({
      targetDir: tempDir,
      projectName: 'my-proj',
      scope: '@proj',
      bundleId: 'com.myproj',
      mobileName: 'main',
      verbose: false,
    });

    filterPlatforms({
      targetDir: tempDir,
      excludePlatforms: ['ai'],
      scope: '@proj',
      mobileName: 'main',
      verbose: false,
    });

    // AI package should be gone
    expect(existsSync(join(tempDir, 'packages/ai-integrations'))).toBe(false);
    expect(existsSync(join(tempDir, 'packages/shared/ai-types'))).toBe(false);

    // API should not reference AI
    const routerIndex = readFileSync(join(tempDir, 'apps/api/src/routers/index.ts'), 'utf-8');
    expect(routerIndex).not.toContain('aiRouter');

    // API package.json should not have ai-integrations dep
    const apiPkg = JSON.parse(readFileSync(join(tempDir, 'apps/api/package.json'), 'utf-8'));
    expect(apiPkg.dependencies['@proj/ai-integrations']).toBeUndefined();

    // turbo.json should not have AI env vars
    const turbo = JSON.parse(readFileSync(join(tempDir, 'turbo.json'), 'utf-8'));
    expect(turbo.globalEnv).not.toContain('ANTHROPIC_API_KEY');
  });

  test('strip + transform + filter --no-mobile --no-desktop', async () => {
    stripNonTemplateFiles({ targetDir: tempDir, verbose: false });

    await transformTemplate({
      targetDir: tempDir,
      projectName: 'web-only',
      scope: '@web-only',
      bundleId: 'com.webonly',
      mobileName: 'main',
      verbose: false,
    });

    filterPlatforms({
      targetDir: tempDir,
      excludePlatforms: ['mobile', 'desktop'],
      scope: '@web-only',
      mobileName: 'main',
      verbose: false,
    });

    expect(existsSync(join(tempDir, 'apps/mobile-main'))).toBe(false);
    expect(existsSync(join(tempDir, 'apps/desktop'))).toBe(false);
    expect(existsSync(join(tempDir, 'apps/web'))).toBe(true);
    expect(existsSync(join(tempDir, 'apps/api'))).toBe(true);

    // Auth should not have native export
    const authPkg = JSON.parse(readFileSync(join(tempDir, 'packages/auth/package.json'), 'utf-8'));
    expect(authPkg.exports['./client/native']).toBeUndefined();
    expect(authPkg.exports['./client']).toBeDefined();
  });

  test('all package.json files are valid JSON after transform', async () => {
    stripNonTemplateFiles({ targetDir: tempDir, verbose: false });

    await transformTemplate({
      targetDir: tempDir,
      projectName: 'test-proj',
      scope: '@test-proj',
      bundleId: 'com.testproj',
      mobileName: 'main',
      verbose: false,
    });

    const files = await fg('**/package.json', {
      cwd: tempDir,
      ignore: ['**/node_modules/**'],
      absolute: true,
    });

    for (const file of files) {
      const raw = readFileSync(file, 'utf-8');
      expect(() => JSON.parse(raw)).not.toThrow();
    }
  });
});
