import { describe, expect, test } from 'bun:test';
import { Axis } from './Axis';
import { Diagram } from './Diagram';
import { DrawPath } from './DrawPath';
import { units } from './grid';

/**
 * Same technique as marks.test.ts: Axis is a plain function returning an element
 * tree, so what it emits is checked by calling it and walking the result. No
 * DOM, no renderer, no new dependency.
 *
 * One difference. `Diagram` calls useRef/useInView/useContext, so invoking it
 * outside a renderer throws — the walker records it and descends into its
 * children instead of rendering it. Tick, Node and Terminal hold no state and
 * are rendered for real, which is what puts actual `d` strings in front of the
 * assertions.
 *
 * Every expected number below is enumerated by hand from the stated geometry —
 * 960 across six stations is 192, so they sit at 8, 200, 392 ... — never
 * recomputed with the expressions Axis uses. A test that reuses the
 * implementation's arithmetic agrees with it by construction.
 */

type ElementLike = { type: unknown; props: Record<string, unknown> };

const isElement = (v: unknown): v is ElementLike =>
  typeof v === 'object' && v !== null && 'type' in v && 'props' in v;

const FRAGMENT = Symbol.for('react.fragment');

interface Emitted {
  /** 'DrawPath', 'Diagram', or the tag of whatever else was reached for. */
  kind: string;
  props: Record<string, unknown>;
}

function emitted(node: unknown, depth = 0): Emitted[] {
  if (node === null || node === undefined || typeof node === 'boolean') return [];
  if (Array.isArray(node)) return node.flatMap((n) => emitted(n, depth));
  if (!isElement(node)) return [];
  if (node.type === DrawPath) return [{ kind: 'DrawPath', props: node.props }];
  // Recorded, never called: Diagram is a hook-using component.
  if (node.type === Diagram) {
    return [{ kind: 'Diagram', props: node.props }, ...emitted(node.props.children, depth + 1)];
  }
  if (node.type === FRAGMENT) return emitted(node.props.children, depth + 1);
  if (typeof node.type === 'function' && depth < 8) {
    const render = node.type as (props: Record<string, unknown>) => unknown;
    return emitted(render(node.props), depth + 1);
  }
  // A host element or anything else unexpected: recorded AND descended into, so
  // a raw <rect> sneaking in still shows up in the emitted kinds.
  return [
    { kind: typeof node.type === 'string' ? node.type : String(node.type), props: node.props },
    ...emitted(node.props.children, depth + 1),
  ];
}

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

interface Path {
  d: string;
  delay: number;
  duration: number | undefined;
  weight: string | undefined;
  className: string | undefined;
  cmds: Cmd[];
}

interface Rendered {
  diagram: Record<string, unknown>;
  paths: Path[];
}

function render(props: Parameters<typeof Axis>[0]): Rendered {
  const parts = emitted(Axis(props));
  const kinds = new Set(parts.map((p) => p.kind));
  // Nothing may be painted outside the sanctioned wrapper and primitive.
  expect(kinds).toEqual(new Set(['Diagram', 'DrawPath']));

  const diagram = parts.find((p) => p.kind === 'Diagram');
  if (!diagram) throw new Error('no Diagram');

  return {
    diagram: diagram.props,
    paths: parts
      .filter((p) => p.kind === 'DrawPath')
      .map((p) => {
        const d = String(p.props.d);
        return {
          d,
          delay: typeof p.props.delay === 'number' ? p.props.delay : 0,
          duration: typeof p.props.duration === 'number' ? p.props.duration : undefined,
          weight: typeof p.props.weight === 'string' ? p.props.weight : undefined,
          className: typeof p.props.className === 'string' ? p.props.className : undefined,
          cmds: parsePath(d),
        };
      }),
  };
}

/** A closed square outline: `M x y H x2 V y2 H x Z`. */
const isSquare = (p: Path) => p.cmds.at(-1)?.cmd === 'Z';
/**
 * A tick: one move and one axis-aligned run, nothing else. The `L` test matters
 * — the spine is also two commands, and without it the spine reads as a tick.
 */
const isTick = (p: Path) => p.cmds.length === 2 && (p.cmds[1].cmd === 'V' || p.cmds[1].cmd === 'H');
/** The serpentine that inks a solid mark: open, many runs. */
const isFill = (p: Path) => p.cmds.length > 2 && !isSquare(p) && p.cmds[0].cmd === 'M';

/** Centre of a square outline, read back off its emitted corners. */
function squareCentre(p: Path): [number, number] {
  const [x1, y1] = p.cmds[0].args;
  const x2 = p.cmds[1].args[0];
  const y2 = p.cmds[2].args[0];
  return [(x1 + x2) / 2, (y1 + y2) / 2];
}

/** The two endpoints a tick spans, on whichever axis it runs along. */
function tickSpan(p: Path): { axis: 'x' | 'y'; from: number; to: number } {
  const [x, y] = p.cmds[0].args;
  const run = p.cmds[1];
  return run.cmd === 'V'
    ? { axis: 'y', from: y, to: run.args[0] }
    : { axis: 'x', from: x, to: run.args[0] };
}

const HORIZONTAL = { orientation: 'horizontal', length: units(120), count: 6 } as const;
const VERTICAL = { orientation: 'vertical', length: units(56), count: 8 } as const;

describe('Axis stations', () => {
  test('spaces six stations 192 apart along a 960 axis', () => {
    const { paths } = render({ ...HORIZONTAL });
    // 960 / 5 = 192, starting one unit in from the edge.
    expect(paths.filter(isSquare).map(squareCentre)).toEqual([
      [8, 24],
      [200, 24],
      [392, 24],
      [584, 24],
      [776, 24],
      [968, 24],
    ]);
  });

  test('PAD insets the end stations so neither clips the canvas edge', () => {
    const { diagram, paths } = render({ ...HORIZONTAL });
    const centres = paths.filter(isSquare).map(squareCentre);
    const first = centres[0];
    const last = centres.at(-1);

    // Without PAD these would be 0 and 976 — dead on the edges, where a default
    // node (size 8) loses half of itself.
    expect(first[0]).toBe(8);
    expect(last?.[0]).toBe(968);
    // 8 - 4 and 968 + 4: the whole node sits inside 0..976.
    expect(diagram.width).toBe(976);
    expect(first[0] - 4).toBeGreaterThan(0);
    expect((last?.[0] ?? 0) + 4).toBeLessThan(976);
  });

  test('snaps interior stations onto the grid when the spacing is not a grid multiple', () => {
    // 480 across 8 stations is 68.571 — off-grid at every interior station.
    const { paths } = render({ orientation: 'vertical', length: units(60), count: 8 });
    const ys = paths.filter(isSquare).map((p) => squareCentre(p)[1]);
    expect(ys).toEqual([8, 80, 144, 216, 280, 352, 416, 488]);
    for (const y of ys) expect(y % 8).toBe(0);
  });

  test('fills exactly the stations named, and reads an omitted entry as hollow', () => {
    const { paths } = render({
      orientation: 'horizontal',
      length: units(120),
      count: 3,
      filled: [true, false, true],
    });
    // A solid mark is outline + serpentine; a hollow one is outline alone.
    expect(paths.filter(isSquare)).toHaveLength(3);
    const fillCentres = paths.filter(isFill).map((p) => p.cmds[0].args);
    // 960 / 2 = 480, so stations sit at 8, 488, 968. Fills belong to the outer two.
    expect(fillCentres).toEqual([
      [4, 20],
      [964, 20],
    ]);
  });

  test('an entirely omitted filled array leaves every station hollow', () => {
    const { paths } = render({ ...HORIZONTAL });
    expect(paths.filter(isFill)).toHaveLength(0);
  });
});

describe('Axis timing', () => {
  test('delays follow position along the axis, not array index', () => {
    const { paths } = render({ ...HORIZONTAL });
    const delays = paths.filter(isSquare).map((p) => p.delay);
    // Six stations over a 0.8s draw: 0, 0.16, 0.32, 0.48, 0.64, 0.8.
    [0, 0.16, 0.32, 0.48, 0.64, 0.8].forEach((expected, i) =>
      expect(delays[i]).toBeCloseTo(expected, 6),
    );
  });

  test('three stations land at the start, the midpoint and the end of the draw', () => {
    const { paths } = render({ orientation: 'horizontal', length: units(120), count: 3 });
    const delays = paths.filter(isSquare).map((p) => p.delay);
    [0, 0.4, 0.8].forEach((expected, i) => expect(delays[i]).toBeCloseTo(expected, 6));
  });

  test('every station fires while the spine is still drawing, the last as it completes', () => {
    const { paths } = render({ ...HORIZONTAL, terminal: true });
    const spine = paths[0];
    expect(spine.duration).toBe(0.8);
    expect(spine.delay).toBe(0);

    const stationDelays = paths.filter(isSquare).map((p) => p.delay);
    for (const delay of stationDelays) expect(delay).toBeLessThanOrEqual(0.8);
    expect(stationDelays.at(-1)).toBeCloseTo(0.8, 6);
    // The accent lands with the completed spine rather than after a pause.
    expect(paths.filter((p) => p.className !== undefined)[0].delay).toBeCloseTo(0.8, 6);
  });

  test('a tick and its node share one clock', () => {
    const { paths } = render({ ...VERTICAL });
    const ticks = paths.filter(isTick).map((p) => p.delay);
    const nodes = paths.filter(isSquare).map((p) => p.delay);
    expect(ticks).toHaveLength(8);
    expect(nodes).toEqual(ticks);
  });
});

describe('Axis geometry by orientation', () => {
  test('the horizontal spine runs along x and is fluid', () => {
    const { diagram, paths } = render({ ...HORIZONTAL, terminal: true });
    expect(paths[0].d).toBe('M 8 24 L 968 24');
    expect(paths[0].weight).toBe('hairline');
    expect(diagram.fluid).toBe(true);
    // 8 + 960 + 32, by 48 of default thickness.
    expect(diagram.width).toBe(1000);
    expect(diagram.height).toBe(48);
  });

  test('the vertical spine runs along y at its own authored size', () => {
    const { diagram, paths } = render({ ...VERTICAL, terminal: true });
    expect(paths[0].d).toBe('M 24 8 L 24 456');
    // A tall narrow diagram stretched to container width would scale absurdly.
    expect(diagram.fluid).toBe(false);
    expect(diagram.width).toBe(48);
    // 8 + 448 + 32.
    expect(diagram.height).toBe(488);
  });

  test('ticks run perpendicular and outward in both orientations', () => {
    const h = render({ ...HORIZONTAL }).paths.filter(isTick);
    // Axis at y 24; the tick sits a unit clear of it and runs up 8 more.
    expect(h[0].d).toBe('M 8 16 V 8');
    expect(h.at(-1)?.d).toBe('M 968 16 V 8');

    const v = render({ ...VERTICAL }).paths.filter(isTick);
    // Axis at x 24; the tick sits a unit clear of it and runs right 8 more.
    expect(v[0].d).toBe('M 32 8 H 40');
    expect(v.at(-1)?.d).toBe('M 32 456 H 40');
  });

  test('no tick ever crosses the square its station is marked with', () => {
    for (const props of [HORIZONTAL, VERTICAL]) {
      const { paths } = render({ ...props });
      // Default node is 8 across, centred on the axis at 24: it occupies 20..28.
      for (const tick of paths.filter(isTick)) {
        const { from, to } = tickSpan(tick);
        for (const point of [from, to]) {
          expect(point < 20 || point > 28).toBe(true);
        }
      }
    }
  });

  test('ticks stay inside the canvas on the cross axis', () => {
    const h = render({ ...HORIZONTAL }).paths.filter(isTick);
    // Thickness 48: the tick's far end is at 8, a full unit clear of the edge.
    for (const tick of h) expect(tickSpan(tick).to).toBe(8);

    const v = render({ ...VERTICAL }).paths.filter(isTick);
    for (const tick of v) expect(tickSpan(tick).to).toBe(40);
  });

  test('a thicker axis grows its ticks rather than clipping them', () => {
    const { diagram, paths } = render({ ...HORIZONTAL, thickness: units(10) });
    expect(diagram.height).toBe(80);
    // Axis moves to 40; the tick starts a unit clear at 32 and now runs to 8.
    expect(paths.filter(isTick)[0].d).toBe('M 8 32 V 8');
  });

  test('forwards className to the Diagram, in both orientations', () => {
    // Colour reaches the marks as currentColor inherited down the SVG subtree,
    // so dropping this one prop silently unstyles the entire axis while every
    // geometry assertion still passes.
    expect(render({ ...HORIZONTAL, className: 'text-border' }).diagram.className).toBe(
      'text-border',
    );
    expect(render({ ...VERTICAL, className: 'text-border' }).diagram.className).toBe('text-border');
  });
});

describe('Axis terminal', () => {
  test('appears only when asked, and lengthens the canvas rather than the axis', () => {
    const without = render({ ...HORIZONTAL });
    const on = render({ ...HORIZONTAL, terminal: true });

    // 13 = spine + 6 x (tick + hollow node). 15 adds the terminal's outline and
    // the serpentine that inks it.
    expect(without.paths).toHaveLength(13);
    expect(on.paths).toHaveLength(15);
    expect(without.diagram.width).toBe(976);
    expect(on.diagram.width).toBe(1000);
    // The station span is identical either way, so consumer labels stay aligned.
    expect(without.paths[0].d).toBe(on.paths[0].d);
  });

  test('is the only accented element, and is solid', () => {
    const { paths } = render({ ...HORIZONTAL, terminal: true, filled: [true, true] });
    const accented = paths.filter((p) => p.className !== undefined);
    expect(accented).toHaveLength(2);
    for (const p of accented) expect(p.className).toBe('text-violet-glow');
    // Outline plus serpentine: the terminal can never render hollow.
    expect(accented.filter(isSquare)).toHaveLength(1);
    expect(accented.filter(isFill)).toHaveLength(1);
    // A 12px square centred at 984, 24 — past the last station at 968.
    expect(squareCentre(accented[0])).toEqual([984, 24]);
  });

  test('sits at the far end of a vertical axis, not beside it', () => {
    const { paths } = render({ ...VERTICAL, terminal: true });
    const accented = paths.filter((p) => p.className !== undefined);
    expect(squareCentre(accented[0])).toEqual([24, 472]);
  });
});

describe('Axis stroke discipline', () => {
  test('draws everything at a single authored weight and never paints a fill', () => {
    const { paths } = render({ ...HORIZONTAL, terminal: true, filled: [true] });
    expect(paths.length).toBeGreaterThan(0);
    for (const p of paths) {
      // The whole axis is structure, so all of it is hairline. A second weight
      // showing up here is a spec decision, not a styling tweak.
      expect(p.weight).toBe('hairline');
      expect(p.d).not.toMatch(/[a-z]/);
    }
  });
});
