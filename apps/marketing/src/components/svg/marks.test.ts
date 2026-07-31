import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'bun:test';
import { STROKE } from './grid';

const MARKS = readFileSync(new URL('./marks.tsx', import.meta.url), 'utf8');

/**
 * Source-text tripwires, in the style of the grid.test.ts checks: they pin the
 * Task 4 decision that a mark draws rather than appearing, which cannot be
 * asserted from the module surface alone.
 */
describe('marks', () => {
  test('never paints a fill — a fill cannot draw', () => {
    // SVG paints fill regardless of stroke-dasharray, so any fill in this file
    // would appear at t=0 while its outline was still drawing. Solid marks are
    // produced by fillPath instead.
    expect(MARKS).not.toMatch(/\bfill\s*[=:]/);
  });

  test('every mark accepts draw timing', () => {
    // Tick, Node, Terminal, Junction. A mark that cannot be delayed cannot fire
    // as the draw front passes it, which is the whole point of the decision.
    expect(MARKS.match(/extends MarkTiming/g)).toHaveLength(4);
  });

  test('the serpentine fill overlaps by at least 2x at every breakpoint', () => {
    // Rendered coverage is (hairline x --x4-stroke-scale) / pitch, and the scale
    // multiplier is >= 1 everywhere, so pitch <= hairline / 2 keeps the square
    // solid rather than banded.
    const pitch = Number(/const FILL_PITCH = ([\d.]+)/.exec(MARKS)?.[1]);
    expect(pitch).toBeGreaterThan(0);
    expect(STROKE.hairline / pitch).toBeGreaterThanOrEqual(2);
  });
});
