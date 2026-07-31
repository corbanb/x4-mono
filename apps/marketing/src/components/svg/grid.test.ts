import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'bun:test';
import {
  snap,
  units,
  viewBox,
  stationOffsets,
  axisMetrics,
  axisThickness,
  UNIT,
  STROKE,
  STROKE_ATTRS,
} from './grid';

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

/**
 * This is the contract a surface aligns its HTML labels against, so it is worth
 * more than the Axis component's own geometry tests: a surface reads these
 * numbers and never sees the SVG. Every expectation is enumerated by hand.
 */
describe('axisMetrics', () => {
  test('pads both ends and reports the station coordinates', () => {
    const m = axisMetrics(units(120), 6);
    // 960 across six stations is 192, starting one unit in.
    expect(m.start).toBe(8);
    expect(m.pitch).toBe(192);
    expect(m.span).toBe(960);
    expect(m.stations).toEqual([8, 200, 392, 584, 776, 968]);
    expect(m.extent).toBe(976);
  });

  test('snaps the PITCH, so spacing is uniform and every station is on the grid', () => {
    // The two geometries the pilot surfaces asked for, both of which staggered
    // when the SPAN was snapped instead: 576/6 gave 112/120/112/120/112 and
    // 768/8 gave 112/104/112/112/112/104/112.
    const six = axisMetrics(units(72), 6);
    expect(six.pitch).toBe(112);
    expect(six.stations).toEqual([8, 120, 232, 344, 456, 568]);

    const eight = axisMetrics(units(96), 8);
    expect(eight.pitch).toBe(112);
    expect(eight.stations).toEqual([8, 120, 232, 344, 456, 568, 680, 792]);

    for (const m of [six, eight]) {
      const gaps = m.stations.slice(1).map((s, i) => s - m.stations[i]);
      expect(new Set(gaps).size).toBe(1);
      for (const s of m.stations) expect(s % UNIT).toBe(0);
    }
  });

  test('the adjusted span drifts from the requested length in either direction', () => {
    // Shrinks: 576 / 5 = 115.2, snapped to 112, so the span is 560.
    expect(axisMetrics(units(72), 6).span).toBe(560);
    // Grows: 768 / 7 = 109.7, snapped UP to 112, so the span is 784.
    expect(axisMetrics(units(96), 8).span).toBe(784);
    // And a length that already divides onto the grid is untouched.
    expect(axisMetrics(units(120), 6).span).toBe(960);
    expect(axisMetrics(units(56), 8).span).toBe(448);
  });

  test('a terminal lengthens the canvas without moving a single station', () => {
    const plain = axisMetrics(units(120), 6);
    const withTerminal = axisMetrics(units(120), 6, true);

    expect(withTerminal.stations).toEqual(plain.stations);
    expect(withTerminal.extent).toBe(1000);
    expect(withTerminal.terminalAt).toBe(984);
    expect(plain.terminalAt).toBeNull();
    expect(plain.terminalFraction).toBeNull();
  });

  test('fractions are container-space, so the terminal changes every one of them', () => {
    // This is the trap the helper exists to close: a fluid axis fills its
    // container, so a station's container position is its coordinate over the
    // WHOLE canvas — and the terminal grows the canvas. The last station is
    // 968/976 without one and 968/1000 with one, ~24px apart at 1000px.
    const plain = axisMetrics(units(120), 6);
    const withTerminal = axisMetrics(units(120), 6, true);

    expect(plain.fractions[0]).toBeCloseTo(0.008197, 6);
    expect(plain.fractions.at(-1)).toBeCloseTo(0.991803, 6);
    expect(withTerminal.fractions[0]).toBeCloseTo(0.008, 6);
    expect(withTerminal.fractions.at(-1)).toBeCloseTo(0.968, 6);
    expect(withTerminal.terminalFraction).toBeCloseTo(0.984, 6);

    plain.fractions.forEach((f, i) => expect(f).not.toBe(withTerminal.fractions[i]));
  });

  test('brings an off-grid length onto the grid', () => {
    const m = axisMetrics(100, 3);
    // 100 across three stations is a pitch of 50, snapped to 48, so the span is
    // 96, the stations are 8, 56, 104 and the canvas is 8 + 96 + 8.
    expect(m.pitch).toBe(48);
    expect(m.span).toBe(96);
    expect(m.stations).toEqual([8, 56, 104]);
    expect(m.extent).toBe(112);
  });

  test('the last station always lands on the far end of the span', () => {
    for (const length of [100, 101, 107, 448, 960]) {
      const m = axisMetrics(length, 4);
      expect(m.stations.at(-1)).toBe(m.start + m.span);
    }
  });

  test('floors the pitch at one unit, so stations never stack on each other', () => {
    // 10 across 6 stations is a gap of 2, which snaps to ZERO — every station
    // would land on 8, the span would be 0, and every fraction would be 0.5.
    const m = axisMetrics(10, 6);
    expect(m.pitch).toBe(8);
    expect(m.stations).toEqual([8, 16, 24, 32, 40, 48]);
    expect(m.span).toBe(40);
    expect(m.extent).toBe(56);
    // Distinct positions, which an all-zero pitch would not give.
    expect(new Set(m.stations).size).toBe(6);
    expect(new Set(m.fractions).size).toBe(6);
  });

  test('every station is grid-aligned and evenly spaced, whatever the length', () => {
    for (let length = 1; length <= 1200; length += 7) {
      for (const count of [2, 3, 5, 6, 8, 11]) {
        const m = axisMetrics(length, count);
        const gaps = m.stations.slice(1).map((s, i) => s - m.stations[i]);
        expect(new Set(gaps).size).toBe(1);
        // A zero pitch passes the uniformity check above — every gap is equally
        // zero — so the floor has to be asserted separately.
        expect(m.pitch).toBeGreaterThanOrEqual(UNIT);
        expect(gaps[0]).toBeGreaterThanOrEqual(UNIT);
        for (const s of m.stations) expect(s % UNIT).toBe(0);
      }
    }
  });

  test('handles a degenerate station count without inventing geometry', () => {
    expect(axisMetrics(units(120), 0).stations).toEqual([]);
    expect(axisMetrics(units(120), 1).stations).toEqual([8]);
    // Below two stations there is no pitch to snap, so the length is snapped
    // directly and the canvas is still the full length: a one-station axis is
    // still an axis.
    expect(axisMetrics(units(120), 1).pitch).toBe(0);
    expect(axisMetrics(units(120), 1).span).toBe(960);
    expect(axisMetrics(units(120), 1).extent).toBe(976);
    expect(axisMetrics(100, 0).span).toBe(104);
  });
});

describe('axisThickness', () => {
  test('leaves a legal cross-axis extent untouched', () => {
    expect(axisThickness(units(6))).toBe(48);
    expect(axisThickness(units(8))).toBe(64);
    expect(axisThickness(units(12))).toBe(96);
  });

  test('raises anything below six units', () => {
    // Below six units an Axis has no room left for ticks, so its stations lose
    // their marks entirely.
    for (const bad of [-100, 0, 1, units(2), units(4), units(5)]) {
      expect(axisThickness(bad)).toBe(48);
    }
  });

  test('rounds to an even unit count so the midpoint stays on the grid', () => {
    // The legal values are 48, 64, 80, 96 ... every one of which halves onto the
    // 8-grid. Rounding the extent rather than snapping its midpoint is what
    // keeps the axis centred.
    expect(axisThickness(units(7))).toBe(64);
    expect(axisThickness(units(9))).toBe(80);
    expect(axisThickness(50)).toBe(48);
    expect(axisThickness(60)).toBe(64);
  });

  test('every legal result halves onto the grid and leaves room for a tick', () => {
    for (let n = 0; n <= 40; n += 1) {
      const box = axisThickness(units(n));
      expect(box % 16).toBe(0);
      expect((box / 2) % UNIT).toBe(0);
      // cross - one unit of gap - one unit of margin, which must stay >= a unit.
      expect(box / 2 - 16).toBeGreaterThanOrEqual(8);
    }
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
