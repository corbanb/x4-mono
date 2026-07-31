import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'bun:test';
import { snap, units, viewBox, stationOffsets, UNIT, STROKE, STROKE_ATTRS } from './grid';

describe('snap', () => {
  test('leaves multiples of UNIT untouched', () => {
    expect(snap(0)).toBe(0);
    expect(snap(8)).toBe(8);
    expect(snap(960)).toBe(960);
  });

  test('rounds to the nearest UNIT', () => {
    expect(snap(11)).toBe(8);
    expect(snap(13)).toBe(16);
  });

  test('rounds halfway values up', () => {
    expect(snap(12)).toBe(16);
  });

  test('handles negative coordinates', () => {
    expect(snap(-11)).toBe(-8);
  });
});

describe('units', () => {
  test('multiplies by UNIT', () => {
    expect(units(0)).toBe(0);
    expect(units(3)).toBe(24);
  });
});

describe('viewBox', () => {
  test('emits a snapped viewBox string anchored at the origin', () => {
    expect(viewBox(960, 240)).toBe('0 0 960 240');
  });

  test('snaps non-grid dimensions', () => {
    expect(viewBox(957, 237)).toBe('0 0 960 240');
  });
});

describe('stationOffsets', () => {
  test('returns an empty array for no stations', () => {
    expect(stationOffsets(0)).toEqual([]);
  });

  test('places a lone station at the start', () => {
    expect(stationOffsets(1)).toEqual([0]);
  });

  test('spans endpoint to endpoint', () => {
    expect(stationOffsets(2)).toEqual([0, 1]);
    expect(stationOffsets(3)).toEqual([0, 0.5, 1]);
  });

  test('spaces six stations evenly', () => {
    const offsets = stationOffsets(6);
    expect(offsets).toHaveLength(6);
    expect(offsets[0]).toBe(0);
    expect(offsets[5]).toBe(1);
    expect(offsets[1]).toBeCloseTo(0.2);
  });
});

describe('constants', () => {
  test('UNIT is the 8px base grid', () => {
    expect(UNIT).toBe(8);
  });

  test('exposes exactly two stroke weights', () => {
    expect(Object.keys(STROKE).sort()).toEqual(['hairline', 'primary']);
    expect(STROKE.hairline).toBe(1);
    expect(STROKE.primary).toBe(1.5);
  });

  test('stroke attrs enforce the Swiss cap and join', () => {
    expect(STROKE_ATTRS.strokeLinecap).toBe('butt');
    expect(STROKE_ATTRS.strokeLinejoin).toBe('miter');
    expect(STROKE_ATTRS.fill).toBe('none');
  });

  test('stroke attrs carry exactly these keys and no others', () => {
    // The absence of vectorEffect is the load-bearing part: non-scaling-stroke
    // breaks stroke-dasharray path drawing in both Chromium and WebKit at any
    // viewBox scale below 1 — the drawn length is evaluated in device px from a
    // user-space magnitude, so a scaled-down diagram renders solid instead of
    // drawing. Asserting the whole key set rather than that one absence also
    // catches any other attribute quietly joining the spread.
    expect(Object.keys(STROKE_ATTRS).sort()).toEqual(['fill', 'strokeLinecap', 'strokeLinejoin']);
  });
});

/**
 * These read source files as text rather than rendering anything: the stroke
 * scale is the replacement for the vector-effect that had to be removed, and it
 * spans a CSS file and a component with no runtime link between them. Deleting
 * either half leaves the app type-checking, linting and passing every other
 * test while silently reverting the fix — and Tasks 4-5 are explicitly invited
 * to tune these values, so a typo is a live risk. No jsdom, no renderer.
 */
describe('stroke scale compensation', () => {
  const globalsCss = readFileSync(`${import.meta.dir}/../../styles/globals.css`, 'utf8');
  const diagramSource = readFileSync(`${import.meta.dir}/Diagram.tsx`, 'utf8');

  test('globals.css scales every stroke weight through --x4-stroke-scale', () => {
    for (const weight of Object.values(STROKE)) {
      const literal = String(weight).replace('.', '\\.');
      expect(globalsCss).toMatch(
        new RegExp(
          `\\[stroke-width='${literal}'\\][^{]*\\{[^}]*stroke-width:\\s*calc\\(\\s*${literal}px\\s*\\*\\s*var\\(\\s*--x4-stroke-scale`,
        ),
      );
    }
  });

  test('globals.css defaults the scale in the var() fallback', () => {
    // Not in a [data-x4-diagram] rule: an attribute selector ties with a utility
    // class on specificity and this file loads after Tailwind, so such a rule
    // silently beats the breakpoint utilities and pins every diagram to 1.
    expect(globalsCss).toMatch(/var\(\s*--x4-stroke-scale\s*,\s*1\s*\)/);
    expect(globalsCss).not.toMatch(/\[data-x4-diagram\]\s*\{[^}]*--x4-stroke-scale\s*:/);
  });

  test('Diagram sets a stroke scale at every breakpoint', () => {
    const declared = [...diagramSource.matchAll(/(?:(\w+):)?\[--x4-stroke-scale:([\d.]+)\]/g)].map(
      ([, breakpoint, value]) => ({ breakpoint: breakpoint ?? 'base', value: Number(value) }),
    );

    expect(new Set(declared.map((d) => d.breakpoint))).toEqual(new Set(['base', 'sm', 'md']));
    expect(declared.every((d) => Number.isFinite(d.value) && d.value >= 1)).toBe(true);

    const widest = (breakpoint: string) =>
      Math.max(...declared.filter((d) => d.breakpoint === breakpoint).map((d) => d.value));

    // Narrower viewports need more correction, never less.
    expect(widest('base')).toBeGreaterThanOrEqual(widest('sm'));
    expect(widest('sm')).toBeGreaterThanOrEqual(widest('md'));

    // Anti-inversion bound. Uncompensated, the primary reaches ~0.922 CSS px at
    // the top of the base range (639px), and the desktop maximum is ~1.5. A base
    // multiplier above 1.5 / 0.922 makes mobile strokes HEAVIER than desktop and
    // lighter as the window widens past 640 — which reads as a rendering bug.
    expect(widest('base')).toBeLessThanOrEqual(1.63);
  });
});
