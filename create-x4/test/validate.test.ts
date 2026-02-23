import { describe, expect, test } from 'bun:test';
import {
  validateProjectName,
  validateScope,
  validateBundleId,
  deriveScope,
  deriveBundleId,
} from '../src/validate.js';

describe('validateProjectName', () => {
  test('accepts valid kebab-case names', () => {
    expect(validateProjectName('my-app').valid).toBe(true);
    expect(validateProjectName('app').valid).toBe(true);
    expect(validateProjectName('my-cool-project').valid).toBe(true);
    expect(validateProjectName('app123').valid).toBe(true);
    expect(validateProjectName('a1-b2-c3').valid).toBe(true);
  });

  test('rejects empty name', () => {
    const result = validateProjectName('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
  });

  test('rejects names starting with uppercase', () => {
    const result = validateProjectName('MyApp');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('kebab-case');
  });

  test('rejects names with underscores', () => {
    const result = validateProjectName('my_app');
    expect(result.valid).toBe(false);
  });

  test('rejects names starting with a number', () => {
    const result = validateProjectName('1app');
    expect(result.valid).toBe(false);
  });

  test('rejects names starting with a hyphen', () => {
    const result = validateProjectName('-app');
    expect(result.valid).toBe(false);
  });

  test('rejects reserved names', () => {
    const result = validateProjectName('node_modules');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('reserved');
  });

  test('rejects names longer than 214 characters', () => {
    const result = validateProjectName('a'.repeat(215));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('214');
  });

  test('rejects names with spaces', () => {
    const result = validateProjectName('my app');
    expect(result.valid).toBe(false);
  });

  test('rejects names with dots', () => {
    const result = validateProjectName('my.app');
    expect(result.valid).toBe(false);
  });
});

describe('validateScope', () => {
  test('accepts valid scopes', () => {
    expect(validateScope('@my-app').valid).toBe(true);
    expect(validateScope('@acme').valid).toBe(true);
    expect(validateScope('@org-name').valid).toBe(true);
    expect(validateScope('@a1').valid).toBe(true);
  });

  test('rejects scope without @', () => {
    const result = validateScope('my-app');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('@');
  });

  test('rejects uppercase scope', () => {
    const result = validateScope('@MyApp');
    expect(result.valid).toBe(false);
  });

  test('rejects scope with special chars', () => {
    const result = validateScope('@my.app');
    expect(result.valid).toBe(false);
  });
});

describe('validateBundleId', () => {
  test('accepts valid bundle IDs', () => {
    expect(validateBundleId('com.myapp').valid).toBe(true);
    expect(validateBundleId('com.acme.app').valid).toBe(true);
    expect(validateBundleId('io.github.user').valid).toBe(true);
  });

  test('rejects single segment', () => {
    const result = validateBundleId('myapp');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('reverse-domain');
  });

  test('rejects uppercase', () => {
    const result = validateBundleId('com.MyApp');
    expect(result.valid).toBe(false);
  });

  test('rejects starting with number', () => {
    const result = validateBundleId('1com.app');
    expect(result.valid).toBe(false);
  });

  test('rejects segment starting with number', () => {
    const result = validateBundleId('com.1app');
    expect(result.valid).toBe(false);
  });
});

describe('deriveScope', () => {
  test('derives scope from project name', () => {
    expect(deriveScope('my-app')).toBe('@my-app');
    expect(deriveScope('cool-project')).toBe('@cool-project');
  });
});

describe('deriveBundleId', () => {
  test('derives bundle ID from project name, stripping hyphens', () => {
    expect(deriveBundleId('my-app')).toBe('com.myapp');
    expect(deriveBundleId('cool-project')).toBe('com.coolproject');
    expect(deriveBundleId('app')).toBe('com.app');
  });
});
