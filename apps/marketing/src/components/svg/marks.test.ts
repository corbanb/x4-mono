import { describe, expect, test } from 'bun:test';
import { STROKE, units } from './grid';
import { DrawPath } from './DrawPath';
import { Junction, Node, Terminal, Tick, fillPath } from './marks';

/**
 * These assert behaviour, not source text.
 *
 * `fillPath` is a pure (x, y, size) => string, so its geometry is checked by
 * parsing the path data it actually emits. The components are plain functions
 * returning React elements, so what a mark renders is checked by calling it and
 * walking the returned tree — no DOM, no renderer, no new dependency.
 *
 * The run counts below are enumerated by hand rather than recomputed from
 * `size / FILL_PITCH + 1`. A test that mirrors the implementation's arithmetic
 * agrees with the implementation by construction and catches nothing.
 */

interface Cmd {
  cmd: string;
  args: number[];
}

function parsePath(d: string): Cmd[] {
  return [...d.matchAll(/([A-Za-z])([^A-Za-z]*)/g)].map((m) => {
    const raw = m[2].trim();
    return { cmd: m[1].toUpperCase(), args: raw ? raw.split(/[\s,]+/).map(Number) : [] };
  });
}

const argsOf = (d: string, cmd: string): number[] =>
  parsePath(d)
    .filter((c) => c.cmd === cmd)
    .map((c) => c.args[0]);

type ElementLike = { type: unknown; props: Record<string, unknown> };

const isElement = (v: unknown): v is ElementLike =>
  typeof v === 'object' && v !== null && 'type' in v && 'props' in v;

const FRAGMENT = Symbol.for('react.fragment');

interface Emitted {
  /** 'DrawPath', or the tag/name of whatever else the mark reached for. */
  kind: string;
  props: Record<string, unknown>;
}

/** Flatten what a mark renders down to the leaves it actually paints with. */
function emitted(node: unknown, depth = 0): Emitted[] {
  if (node === null || node === undefined || typeof node === 'boolean') return [];
  if (Array.isArray(node)) return node.flatMap((n) => emitted(n, depth));
  if (!isElement(node)) return [];
  if (node.type === DrawPath) return [{ kind: 'DrawPath', props: node.props }];
  if (node.type === FRAGMENT) return emitted(node.props.children, depth + 1);
  if (typeof node.type === 'function' && depth < 8) {
    const render = node.type as (props: Record<string, unknown>) => unknown;
    return emitted(render(node.props), depth + 1);
  }
  return [
    { kind: typeof node.type === 'string' ? node.type : String(node.type), props: node.props },
  ];
}

describe('fillPath', () => {
  test('is one unbroken subpath', () => {
    const cmds = parsePath(fillPath(0, 0, 8));
    expect(cmds.filter((c) => c.cmd === 'M')).toHaveLength(1);
    expect(cmds[0].args).toEqual([-4, -4]);
    expect(cmds.some((c) => c.cmd === 'Z')).toBe(false);
  });

  test('emits one run per half-unit of height', () => {
    // An 8px square stepped by half a unit has runs at y = -4, -3.5 ... 4: 17 of
    // them. A 12px square, at y = -6 ... 6: 25. Counted, not derived.
    expect(argsOf(fillPath(0, 0, 8), 'H')).toHaveLength(17);
    expect(argsOf(fillPath(0, 0, 12), 'H')).toHaveLength(25);
  });

  test('steps by a uniform pitch that keeps coverage at 2x or better', () => {
    // The anti-banding invariant, read off the emitted geometry rather than off
    // the FILL_PITCH constant — the constant can be right while the step that
    // uses it is wrong. Rendered coverage is
    // (hairline x --x4-stroke-scale) / pitch, and the multiplier is >= 1
    // everywhere (pinned in grid.test.ts), so pitch <= hairline / 2 is the floor.
    const steps = argsOf(fillPath(0, 0, 8), 'V').map((v, i, all) =>
      Number((v - (i === 0 ? -4 : all[i - 1])).toFixed(6)),
    );
    expect(steps.length).toBeGreaterThan(0);
    expect(new Set(steps).size).toBe(1);
    expect(STROKE.hairline / steps[0]).toBeGreaterThanOrEqual(2);
  });

  test('the last run lands on the bottom edge', () => {
    expect(argsOf(fillPath(0, 0, 8), 'V').at(-1)).toBe(4);
    expect(argsOf(fillPath(0, 0, 12), 'V').at(-1)).toBe(6);
  });

  test('every run spans exactly left to right, alternating', () => {
    const hs = argsOf(fillPath(0, 0, 8), 'H');
    expect(new Set(hs)).toEqual(new Set([-4, 4]));
    hs.forEach((h, i) => expect(h).toBe(i % 2 === 0 ? 4 : -4));
  });

  test('is centered on its anchor', () => {
    const d = fillPath(80, 40, 8);
    expect(parsePath(d)[0].args).toEqual([76, 36]);
    expect(new Set(argsOf(d, 'H'))).toEqual(new Set([76, 84]));
    expect(argsOf(d, 'V').at(-1)).toBe(44);
  });
});

describe('marks', () => {
  const cases: Array<[string, () => unknown]> = [
    ['Tick', () => Tick({ x: 0, y: 0, orientation: 'horizontal', delay: 0.42 })],
    ['Tick (vertical)', () => Tick({ x: 0, y: 0, orientation: 'vertical', delay: 0.42 })],
    ['hollow Node', () => Node({ x: 0, y: 0, delay: 0.42 })],
    ['solid Node', () => Node({ x: 0, y: 0, filled: true, delay: 0.42 })],
    ['Terminal', () => Terminal({ x: 0, y: 0, delay: 0.42 })],
    ['Junction', () => Junction({ x: 0, y: 0, delay: 0.42 })],
  ];

  for (const [name, build] of cases) {
    test(`${name} draws every part of itself and never paints a fill`, () => {
      const parts = emitted(build());
      expect(parts.length).toBeGreaterThan(0);
      // A fill is painted regardless of stroke-dasharray, so it would appear at
      // t=0 while its outline was still drawing. Nothing in this vocabulary may
      // reach for one — which also means nothing may reach past DrawPath.
      expect(new Set(parts.map((p) => p.kind))).toEqual(new Set(['DrawPath']));
      for (const part of parts) {
        expect(part.props).not.toHaveProperty('fill');
        expect(typeof part.props.d).toBe('string');
        // A mark that drops its delay cannot fire as the draw front passes it.
        expect(part.props.delay).toBe(0.42);
      }
    });
  }

  test('filled adds the serpentine, hollow does not', () => {
    expect(emitted(Node({ x: 0, y: 0 }))).toHaveLength(1);
    const solid = emitted(Node({ x: 0, y: 0, filled: true }));
    expect(solid).toHaveLength(2);
    expect(solid[1].props.d).toBe(fillPath(0, 0, units(1)));
  });

  test('Terminal is always solid — the one accent cannot render hollow', () => {
    const parts = emitted(Terminal({ x: 0, y: 0 }));
    expect(parts).toHaveLength(2);
    expect(parts[1].props.d).toBe(fillPath(0, 0, units(1.5)));
  });
});
