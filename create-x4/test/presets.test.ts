import { describe, expect, test } from 'bun:test';
import { PRESETS, PRESET_NAMES, type Preset } from '../src/presets.js';
import { PLATFORMS, type Platform } from '../src/constants.js';

const allPlatforms = Object.keys(PLATFORMS) as Platform[];

describe('PRESETS', () => {
  test('has 4 presets', () => {
    expect(Object.keys(PRESETS).length).toBe(4);
  });

  test('has expected preset keys', () => {
    expect(PRESETS['full-stack']).toBeDefined();
    expect(PRESETS.saas).toBeDefined();
    expect(PRESETS.landing).toBeDefined();
    expect(PRESETS['api-only']).toBeDefined();
  });

  test('each preset has name, description, and exclude array', () => {
    for (const [key, preset] of Object.entries(PRESETS)) {
      expect(typeof preset.name).toBe('string');
      expect(preset.name.length).toBeGreaterThan(0);
      expect(typeof preset.description).toBe('string');
      expect(preset.description.length).toBeGreaterThan(0);
      expect(Array.isArray(preset.exclude)).toBe(true);
    }
  });

  test('full-stack excludes nothing', () => {
    expect(PRESETS['full-stack'].exclude).toEqual([]);
  });

  test('saas excludes mobile, desktop, marketing, docs', () => {
    expect(PRESETS.saas.exclude).toContain('mobile');
    expect(PRESETS.saas.exclude).toContain('desktop');
    expect(PRESETS.saas.exclude).toContain('marketing');
    expect(PRESETS.saas.exclude).toContain('docs');
    expect(PRESETS.saas.exclude).not.toContain('ai');
  });

  test('landing excludes mobile, desktop, docs, ai', () => {
    expect(PRESETS.landing.exclude).toContain('mobile');
    expect(PRESETS.landing.exclude).toContain('desktop');
    expect(PRESETS.landing.exclude).toContain('docs');
    expect(PRESETS.landing.exclude).toContain('ai');
    expect(PRESETS.landing.exclude).not.toContain('marketing');
  });

  test('api-only excludes everything except web + api', () => {
    expect(PRESETS['api-only'].exclude).toContain('mobile');
    expect(PRESETS['api-only'].exclude).toContain('desktop');
    expect(PRESETS['api-only'].exclude).toContain('marketing');
    expect(PRESETS['api-only'].exclude).toContain('docs');
    expect(PRESETS['api-only'].exclude).toContain('ai');
    expect(PRESETS['api-only'].exclude.length).toBe(5);
  });

  test('all exclude values are valid Platform types', () => {
    for (const preset of Object.values(PRESETS)) {
      for (const excluded of preset.exclude) {
        expect(allPlatforms).toContain(excluded);
      }
    }
  });
});

describe('PRESET_NAMES', () => {
  test('matches Object.keys(PRESETS)', () => {
    expect(PRESET_NAMES).toEqual(Object.keys(PRESETS));
  });

  test('has 4 entries', () => {
    expect(PRESET_NAMES.length).toBe(4);
  });
});
