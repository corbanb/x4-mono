import { describe, test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

// Resolve repo root from this file's location:
// __tests__/ → src/ → api/ → apps/ → x4-mono/
const repoRoot = join(new URL('.', import.meta.url).pathname, '../../../..');

// Mirror the expression used in apps/api/src/index.ts line 5:
//   port: Number(process.env.PORT || env.PORT_API)
// This helper lets us test the resolution logic without importing index.ts,
// which would trigger env.ts's eager validation requiring real env vars.
const resolvePort = (railwayPort: string | undefined, configPort: number): number =>
  Number(railwayPort || configPort);

// ─── Port Resolution Logic ────────────────────────────────────────────────────

describe('resolvePort — mirrors index.ts port expression', () => {
  test('PORT undefined → falls back to PORT_API (3002)', () => {
    expect(resolvePort(undefined, 3002)).toBe(3002);
  });

  test('PORT is a valid string "3098" → uses 3098 (Railway production path)', () => {
    expect(resolvePort('3098', 3002)).toBe(3098);
  });

  test('PORT is empty string "" → falls back to PORT_API (falsy guard)', () => {
    expect(resolvePort('', 3002)).toBe(3002);
  });

  test('PORT is "0" → resolves to 0 ("0" is a truthy string, so || does not fall back)', () => {
    // JavaScript: "0" is truthy, so `"0" || 3002` short-circuits to "0",
    // and Number("0") === 0. This is a known footgun — port 0 is invalid in
    // practice but the runtime expression does not guard against it.
    expect(resolvePort('0', 3002)).toBe(0);
  });

  test('PORT_API default of 3002 is used when PORT is absent', () => {
    const DEFAULT_PORT_API = 3002;
    expect(resolvePort(undefined, DEFAULT_PORT_API)).toBe(3002);
  });

  test('PORT_API override of 4000 is respected when PORT is absent', () => {
    expect(resolvePort(undefined, 4000)).toBe(4000);
  });
});

// ─── .env.example Structure ───────────────────────────────────────────────────

describe('.env.example — port variables', () => {
  const envExample = readFileSync(join(repoRoot, '.env.example'), 'utf-8');

  test('contains PORT_API=3002', () => {
    expect(envExample).toContain('PORT_API=3002');
  });

  test('contains PORT_WEB=3000', () => {
    expect(envExample).toContain('PORT_WEB=3000');
  });

  test('contains PORT_MARKETING=3001', () => {
    expect(envExample).toContain('PORT_MARKETING=3001');
  });

  test('contains PORT_DOCS=3003', () => {
    expect(envExample).toContain('PORT_DOCS=3003');
  });

  test('contains PORT_STORYBOOK=6006', () => {
    expect(envExample).toContain('PORT_STORYBOOK=6006');
  });

  test('does NOT contain a bare PORT= line (old var removed)', () => {
    // Match a line that is exactly "PORT=..." but not "PORT_API=..." etc.
    const hasBarePort = /^PORT=[^\n]*/m.test(envExample);
    expect(hasBarePort).toBe(false);
  });
});

// ─── turbo.json globalEnv Guard ───────────────────────────────────────────────

describe('turbo.json — globalEnv includes all PORT_* vars', () => {
  const turboJson = JSON.parse(readFileSync(join(repoRoot, 'turbo.json'), 'utf-8')) as {
    globalEnv?: string[];
  };
  const globalEnv: string[] = turboJson.globalEnv ?? [];

  const required = [
    'PORT_WEB',
    'PORT_API',
    'PORT_MARKETING',
    'PORT_DOCS',
    'PORT_STORYBOOK',
  ] as const;

  for (const varName of required) {
    test(`globalEnv includes ${varName}`, () => {
      expect(globalEnv).toContain(varName);
    });
  }
});
