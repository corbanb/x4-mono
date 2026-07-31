import { describe, expect, test } from 'bun:test';
import { KickstartFlow } from './KickstartFlow';
import { Diagram } from '../svg/Diagram';
import { DrawPath } from '../svg/DrawPath';

/**
 * Same technique as Axis.test.ts: the surface is a plain function returning an
 * element tree, so what it emits is checked by calling it and walking the
 * result. No DOM, no renderer, no new dependency. KickstartFlow is callable at
 * all because it holds no hooks — the axis owns every piece of motion on the
 * surface.
 *
 * `Diagram` uses hooks, so it is recorded and descended into rather than
 * invoked. `Axis`, `Tick`, `Node` and `Terminal` are pure and are rendered for
 * real, which is what puts actual paths and classNames in front of the
 * assertions.
 *
 * Every expected number here is enumerated by hand from the stated geometry —
 * 960 across six stations is a pitch of 192, so stations sit at 8, 200, 392,
 * 584, 776, 968 over a canvas of 8 + 960 + 32 = 1000, giving 0.8%, 20%, 39.2%,
 * 58.4%, 77.6%, 96.8%. Nothing below calls `axisMetrics`; a test that recomputes
 * the implementation's arithmetic agrees with it by construction.
 */

type ElementLike = { type: unknown; props: Record<string, unknown> };

const isElement = (v: unknown): v is ElementLike =>
  typeof v === 'object' && v !== null && 'type' in v && 'props' in v;

const FRAGMENT = Symbol.for('react.fragment');

interface Emitted {
  /** 'DrawPath', 'Diagram', a component's name, or the tag of a host element. */
  kind: string;
  props: Record<string, unknown>;
}

function emitted(node: unknown, depth = 0): Emitted[] {
  if (node === null || node === undefined || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap((n) => emitted(n, depth));
  if (!isElement(node)) return [];
  if (node.type === DrawPath) return [{ kind: 'DrawPath', props: node.props }];
  // Recorded, never called: Diagram is the one hook-using component in the tree.
  if (node.type === Diagram) {
    return [{ kind: 'Diagram', props: node.props }, ...emitted(node.props.children, depth + 1)];
  }
  if (node.type === FRAGMENT) return emitted(node.props.children, depth + 1);
  if (typeof node.type === 'function' && depth < 12) {
    const component = node.type as { name?: string } & ((p: Record<string, unknown>) => unknown);
    return [
      { kind: component.name || 'anonymous', props: node.props },
      ...emitted(component(node.props), depth + 1),
    ];
  }
  return [
    { kind: typeof node.type === 'string' ? node.type : String(node.type), props: node.props },
    ...emitted(node.props.children, depth + 1),
  ];
}

const TREE = emitted(KickstartFlow());

function styleOf(node: Emitted): Record<string, unknown> {
  const style = node.props.style;
  return typeof style === 'object' && style !== null ? (style as Record<string, unknown>) : {};
}

function classOf(node: Emitted): string {
  return typeof node.props.className === 'string' ? node.props.className : '';
}

/** The text of each <p> inside one label block, in order. */
function linesOf(node: Emitted): string[] {
  return emitted(node.props.children)
    .filter((e) => e.kind === 'p')
    .map((e) => String(e.props.children));
}

const AXES = TREE.filter((n) => n.kind === 'Axis');
const PATHS = TREE.filter((n) => n.kind === 'DrawPath');
/** Horizontal labels carry a `left`; the rotated ones carry a `top`. */
const H_LABELS = TREE.filter((n) => 'left' in styleOf(n));
const V_LABELS = TREE.filter((n) => 'top' in styleOf(n));

describe('KickstartFlow labels register to the axis', () => {
  test('positions the six horizontal labels on the stations, not on an even grid', () => {
    // An even six-column distribution would be 0 / 20 / 40 / 60 / 80 / 100.
    // Stations are inset by one pad and the canvas grows past the last one for
    // the terminal, so four of the six differ — and the last differs from the
    // no-terminal value of 99.18% too, which is what pins that `terminal` was
    // passed to the metrics as well as to the Axis.
    expect(H_LABELS.map((n) => styleOf(n).left)).toEqual([
      '0.8000%',
      '20.0000%',
      '39.2000%',
      '58.4000%',
      '77.6000%',
      '96.8000%',
    ]);
  });

  test('positions the six rotated labels on the stations of the shorter axis', () => {
    // 560 across six stations is a pitch of 112, over a canvas of
    // 8 + 560 + 32 = 600: stations at 8, 120, 232, 344, 456, 568.
    expect(V_LABELS.map((n) => styleOf(n).top)).toEqual([
      '1.3333%',
      '20.0000%',
      '38.6667%',
      '57.3333%',
      '76.0000%',
      '94.6667%',
    ]);
  });

  test('gives the rotated label column the height the axis actually authored', () => {
    // 600, not the units(70) = 560 that was asked for.
    expect(TREE.filter((n) => 'height' in styleOf(n)).map((n) => styleOf(n).height)).toEqual([600]);
  });

  test('names the stations in axis order, numbered', () => {
    const names = ['Vision', 'Brainstorm', 'Prioritize', 'UI Design', 'Batch PRDs', 'Summary'];
    const numbers = ['01', '02', '03', '04', '05', '06'];
    for (const labels of [H_LABELS, V_LABELS]) {
      expect(labels.map((n) => linesOf(n)[0])).toEqual(numbers);
      expect(labels.map((n) => linesOf(n)[1])).toEqual(names);
    }
  });

  test('emits one label per station, in both orientations', () => {
    expect(AXES.map((a) => a.props.count)).toEqual([6, 6]);
    expect(H_LABELS).toHaveLength(6);
    expect(V_LABELS).toHaveLength(6);
  });
});

describe('KickstartFlow label columns fit their container', () => {
  test('sizes every label column at one station pitch', () => {
    // 192 / 1000.
    expect(H_LABELS.map((n) => styleOf(n).width)).toEqual(Array(6).fill('19.2000%'));
  });

  test('reserves exactly enough trailing room for the last column', () => {
    // The last station is at 96.8% and a column is 19.2% wide, so a full-width
    // axis would run 16% past the edge. Shortening the row by r and requiring
    // (0.968 + 0.192)(1 - r) = 1 gives r = 0.16 / 1.16 = 4/29 = 13.7931%.
    const [padding] = TREE.filter((n) => 'paddingRight' in styleOf(n)).map(
      (n) => styleOf(n).paddingRight,
    );
    expect(padding).toBe('13.7931%');

    // And the invariant that number exists to satisfy, read back off the values
    // actually emitted: the last column ends flush with the container edge —
    // not past it (which is a horizontal scrollbar at md) and not short of it.
    const last = parseFloat(String(styleOf(H_LABELS[5]).left)) / 100;
    const column = parseFloat(String(styleOf(H_LABELS[5]).width)) / 100;
    const reserve = parseFloat(String(padding)) / 100;
    expect((last + column) * (1 - reserve)).toBeCloseTo(1, 5);
  });
});

describe('KickstartFlow treats the six steps as equivalent', () => {
  test('styles every station label identically, and none of them in the accent', () => {
    for (const labels of [H_LABELS, V_LABELS]) {
      const classes = new Set(labels.map(classOf));
      expect(classes.size).toBe(1);
      for (const c of classes) expect(c).not.toMatch(/violet/);
    }
  });

  test('leaves every station hollow', () => {
    // A filled station would emit a serpentine alongside its outline. Solid
    // reads as "complete", which is a claim this surface does not make.
    for (const axis of AXES) expect(axis.props.filled).toBeUndefined();
  });

  test('draws both axes in a grey', () => {
    for (const axis of AXES) expect(axis.props.className).toBe('text-muted-foreground');
  });
});

describe('KickstartFlow accent', () => {
  test('accents the terminal and nothing else inside the diagrams', () => {
    // Per axis: spine + 6 ticks + 6 station outlines = 13 unaccented paths, plus
    // the terminal's outline and the serpentine that inks it = 15. Two axes.
    expect(PATHS).toHaveLength(30);
    const accented = PATHS.filter((p) => typeof p.props.className === 'string');
    expect(accented).toHaveLength(4);
    for (const p of accented) expect(p.props.className).toBe('text-violet-glow');
  });

  test('terminates both axes, so the accent survives the rotation', () => {
    expect(AXES.map((a) => a.props.orientation)).toEqual(['horizontal', 'vertical']);
    for (const axis of AXES) expect(axis.props.terminal).toBe(true);
  });

  test('accents exactly one of the three planning cells', () => {
    const cells = TREE.filter((n) => n.kind === 'div' && classOf(n).startsWith('border p-6'));
    expect(cells).toHaveLength(3);
    expect(cells.filter((c) => classOf(c).includes('violet'))).toHaveLength(1);
  });
});

describe('KickstartFlow renders no colour of its own', () => {
  test('emits no hex literal in any class or style value', () => {
    for (const node of TREE) {
      const values = [classOf(node), ...Object.values(styleOf(node)).map(String)];
      for (const v of values) expect(v).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    }
  });

  test('emits no rounded corner anywhere', () => {
    // The cards this replaced were rounded-2xl with rounded-full numerals;
    // radius 0 is a rule of the design layer, not a styling preference.
    for (const node of TREE) expect(classOf(node)).not.toMatch(/rounded/);
  });

  test('sizes the axis only through props, never through a class', () => {
    // A sizing class passed through className beats the h-auto a fluid Axis
    // sets, letterboxes the artwork, and silently invalidates every fraction
    // above. className is for colour.
    for (const axis of AXES) {
      expect(String(axis.props.className)).not.toMatch(/\b[wh]-|\bmax-|\baspect-/);
      // units(8), so the ticks come out units(2) rather than units(1).
      expect(axis.props.thickness).toBe(64);
    }
  });
});
