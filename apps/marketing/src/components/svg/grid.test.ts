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

  test('stroke attrs omit non-scaling-stroke', () => {
    // Deliberate: non-scaling-stroke breaks stroke-dasharray path drawing in both
    // Chromium and WebKit at any viewBox scale below 1 — the drawn length is
    // evaluated in device px from a user-space magnitude, so a scaled-down
    // diagram renders solid instead of drawing. See the STROKE_ATTRS comment.
    expect(STROKE_ATTRS).not.toHaveProperty('vectorEffect');
  });
});
