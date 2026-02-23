import { describe, expect, test } from 'bun:test';
import {
  STRIP_PATHS,
  TEXT_REPLACE_EXTENSIONS,
  TEMPLATE_SCOPE,
  TEMPLATE_NAME,
  TEMPLATE_BUNDLE_PREFIX,
  TEMPLATE_REPO,
  PLATFORMS,
  NPM_RESERVED_NAMES,
} from '../src/constants.js';

describe('STRIP_PATHS', () => {
  test('includes critical non-template files', () => {
    expect(STRIP_PATHS).toContain('CLAUDE.md');
    expect(STRIP_PATHS).toContain('create-x4');
    expect(STRIP_PATHS).toContain('wiki');
    expect(STRIP_PATHS).toContain('.claude');
    expect(STRIP_PATHS).toContain('.claude-old');
    expect(STRIP_PATHS).toContain('.vercel');
  });

  test('includes lockfiles and build artifacts', () => {
    expect(STRIP_PATHS).toContain('bun.lock');
    expect(STRIP_PATHS).toContain('bun.lockb');
    expect(STRIP_PATHS).toContain('node_modules');
    expect(STRIP_PATHS).toContain('.turbo');
    expect(STRIP_PATHS).toContain('coverage');
  });

  test('includes env files and git', () => {
    expect(STRIP_PATHS).toContain('.env.local');
    expect(STRIP_PATHS).toContain('.env');
    expect(STRIP_PATHS).toContain('.git');
  });

  test('does not include template app dirs', () => {
    for (const p of STRIP_PATHS) {
      expect(p).not.toMatch(/^apps\/(api|web|mobile|desktop|marketing|docs)$/);
    }
  });

  test('does not include template package dirs', () => {
    for (const p of STRIP_PATHS) {
      expect(p).not.toMatch(/^packages\/(shared|database|auth|ai-integrations)$/);
    }
  });
});

describe('TEXT_REPLACE_EXTENSIONS', () => {
  test('includes all expected extensions', () => {
    const expected = ['ts', 'tsx', 'md', 'mdx', 'mjs', 'yml', 'yaml', 'json', 'js', 'jsx', 'css'];
    for (const ext of expected) {
      expect(TEXT_REPLACE_EXTENSIONS).toContain(ext);
    }
  });

  test('has exact expected count', () => {
    expect(TEXT_REPLACE_EXTENSIONS.length).toBe(11);
  });
});

describe('template constants', () => {
  test('TEMPLATE_SCOPE is @x4', () => {
    expect(TEMPLATE_SCOPE).toBe('@x4');
  });

  test('TEMPLATE_NAME is x4-mono', () => {
    expect(TEMPLATE_NAME).toBe('x4-mono');
  });

  test('TEMPLATE_BUNDLE_PREFIX is com.x4', () => {
    expect(TEMPLATE_BUNDLE_PREFIX).toBe('com.x4');
  });

  test('TEMPLATE_REPO is a valid github repo path', () => {
    expect(TEMPLATE_REPO).toMatch(/^[\w-]+\/[\w-]+$/);
    expect(TEMPLATE_REPO).toBe('corbanb/x4-mono');
  });
});

describe('PLATFORMS', () => {
  test('has all 5 platform keys', () => {
    const keys = Object.keys(PLATFORMS);
    expect(keys).toContain('mobile');
    expect(keys).toContain('desktop');
    expect(keys).toContain('marketing');
    expect(keys).toContain('docs');
    expect(keys).toContain('ai');
    expect(keys.length).toBe(5);
  });

  test('each platform has dirs array', () => {
    for (const [, config] of Object.entries(PLATFORMS)) {
      expect(Array.isArray(config.dirs)).toBe(true);
      expect(config.dirs.length).toBeGreaterThan(0);
    }
  });

  test('each platform has workflows array', () => {
    for (const [key, config] of Object.entries(PLATFORMS)) {
      if (key !== 'ai') {
        expect(Array.isArray(config.workflows)).toBe(true);
        expect(config.workflows!.length).toBeGreaterThan(0);
      }
    }
  });

  test('mobile has authExports and authFiles', () => {
    expect(PLATFORMS.mobile.authExports).toBeDefined();
    expect(PLATFORMS.mobile.authFiles).toBeDefined();
  });

  test('ai has sharedDirs, sharedExports, envVars, apiRouterImport, webPages', () => {
    expect(PLATFORMS.ai.sharedDirs).toBeDefined();
    expect(PLATFORMS.ai.sharedExports).toBeDefined();
    expect(PLATFORMS.ai.envVars).toBeDefined();
    expect(PLATFORMS.ai.apiRouterImport).toBe('ai');
    expect(PLATFORMS.ai.webPages).toBeDefined();
  });
});

describe('NPM_RESERVED_NAMES', () => {
  test('contains known reserved names', () => {
    expect(NPM_RESERVED_NAMES.has('node_modules')).toBe(true);
    expect(NPM_RESERVED_NAMES.has('favicon.ico')).toBe(true);
    expect(NPM_RESERVED_NAMES.has('package.json')).toBe(true);
    expect(NPM_RESERVED_NAMES.has('package-lock.json')).toBe(true);
  });

  test('does not contain valid project names', () => {
    expect(NPM_RESERVED_NAMES.has('my-app')).toBe(false);
    expect(NPM_RESERVED_NAMES.has('cool-project')).toBe(false);
  });

  test('is a Set', () => {
    expect(NPM_RESERVED_NAMES).toBeInstanceOf(Set);
  });
});
