import { describe, expect, test } from 'bun:test';
import { Timeline } from './Timeline';
import { Diagram } from '../svg/Diagram';
import { DrawPath } from '../svg/DrawPath';
import { UNIT, axisThickness } from '../svg/grid';

/**
 * Same technique as Axis.test.ts and KickstartFlow.test.ts: the surface is a
 * plain function returning an element tree, so what it emits is checked by
 * calling it and walking the result. No DOM, no renderer, no new dependency.
 * Timeline is callable at all because it holds no hooks — the axis owns every
 * piece of motion on the surface, which is the thing the removed fade-up
 * wrappers were competing with.
 *
 * `Diagram` uses hooks, so it is recorded and descended into rather than
 * invoked. `Axis`, `Tick`, `Node` and `Terminal` are pure and are rendered for
 * real, which is what puts actual paths and classNames in front of the
 * assertions.
 *
 * Every expected number is enumerated by hand from the stated geometry: 784
 * across eight stations is a pitch of 112, so stations sit at 8, 120, 232, 344,
 * 456, 568, 680, 792 over a canvas of 8 + 784 + 32 = 824, and each fraction is
 * therefore (station / 8) / 103. Nothing below calls `axisMetrics`; a test that
 * recomputes the implementation's arithmetic agrees with it by construction.
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

function styleOf(node: Emitted): Record<string, unknown> {
  const style = node.props.style;
  return typeof style === 'object' && style !== null ? (style as Record<string, unknown>) : {};
}

function classOf(node: Emitted): string {
  return typeof node.props.className === 'string' ? node.props.className : '';
}

/** Flattened text of a leaf element whose children are strings and numbers. */
function textOf(node: Emitted): string {
  const children = node.props.children;
  return (Array.isArray(children) ? children : [children]).map(String).join('');
}

/** Host elements only — a lowercase kind is a DOM tag rather than a component. */
const isHost = (node: Emitted): boolean => /^[a-z]/.test(node.kind);

const TREE = emitted(Timeline());
const AXES = TREE.filter((n) => n.kind === 'Axis');
const PATHS = TREE.filter((n) => n.kind === 'DrawPath');
const LABELS = TREE.filter((n) => 'top' in styleOf(n));

/** The one line of accented type: "N shipped, you are here". */
function accentLine(tree: Emitted[]): Emitted {
  const lines = tree.filter((n) => n.kind === 'p' && classOf(n).includes('text-violet-glow'));
  expect(lines).toHaveLength(1);
  return lines[0];
}

/**
 * The same surface with one milestone still in flight — the extension point the
 * `status` union exists for, and the only way to see the hollow branch, since all
 * eight real milestones are shipped. Same length as the real list, so the
 * geometry is unchanged and only the fills differ.
 */
const IN_FLIGHT = 5;
const MIXED = Array.from({ length: 8 }, (_, i) => ({
  title: `Milestone ${i}`,
  description: `Description ${i}`,
  status: (i === IN_FLIGHT ? 'in-progress' : 'complete') as 'complete' | 'in-progress',
}));
const MIXED_TREE = emitted(Timeline({ milestones: MIXED }));

describe('Timeline labels register to the axis', () => {
  test('positions the eight labels on the stations, not on an even eight-row split', () => {
    // An even eight-row split would be 0 / 12.5 / 25 / ... / 87.5. Stations are
    // inset by one pad and the canvas grows past the last one for the terminal,
    // so every one of the eight differs — and the last differs from the
    // no-terminal value of 792/800 = 99% too, which pins that `terminal` was
    // passed to the metrics as well as to the Axis.
    expect(LABELS.map((n) => styleOf(n).top)).toEqual([
      '0.9709%',
      '14.5631%',
      '28.1553%',
      '41.7476%',
      '55.3398%',
      '68.9320%',
      '82.5243%',
      '96.1165%',
    ]);
  });

  test('gives the label column the height the axis actually authored', () => {
    // 824, not the units(98) = 784 that was asked for: one pad in front of the
    // first station plus four units of terminal room past the last.
    expect(TREE.filter((n) => 'height' in styleOf(n)).map((n) => styleOf(n).height)).toEqual([824]);
  });

  test('names the milestones in axis order', () => {
    const titles = TREE.filter((n) => n.kind === 'h3').map(textOf);
    expect(titles).toEqual([
      'Monorepo Foundation',
      'Shared Types & Database',
      'API Server',
      'Authentication',
      'AI Integration',
      'Multi-Platform Clients',
      'CI/CD & Testing',
      'Documentation & DX',
    ]);
  });

  test('emits one label per station', () => {
    expect(AXES).toHaveLength(1);
    expect(AXES[0].props.count).toBe(8);
    expect(AXES[0].props.orientation).toBe('vertical');
    expect(LABELS).toHaveLength(8);
  });
});

/**
 * The point of the rebuild: `status` used to render nothing distinguishable.
 * It now selects between a solid station and a hollow one, which is a difference
 * the emitted paths carry — a solid Node is its outline PLUS a serpentine that
 * inks it, so a hollow station emits one fewer path.
 */
describe('Timeline drives the stations from status', () => {
  test('fills every station, because every milestone is shipped', () => {
    expect(AXES[0].props.filled).toEqual(Array(8).fill(true));
  });

  test('leaves an in-progress milestone hollow', () => {
    const axis = MIXED_TREE.filter((n) => n.kind === 'Axis')[0];
    expect(axis.props.filled).toEqual([true, true, true, true, true, false, true, true]);
  });

  test('drops the hollow station serpentine from the drawn paths', () => {
    // 1 spine + 8 ticks + 8 station outlines + 8 serpentines + 2 for the
    // terminal (outline and serpentine) = 27 when everything is shipped. The
    // in-flight station loses its serpentine and nothing else.
    expect(PATHS).toHaveLength(27);
    expect(MIXED_TREE.filter((n) => n.kind === 'DrawPath')).toHaveLength(26);
  });

  test('counts the shipped milestones from the same field', () => {
    expect(textOf(accentLine(TREE))).toBe('8 shipped · you are here');
    expect(textOf(accentLine(MIXED_TREE))).toBe('7 shipped · you are here');
  });
});

/**
 * The two offsets that do NOT come from the metrics. They correct for the axis's
 * CROSS-axis layout, which Axis.tsx keeps private and does not export ("nothing
 * outside the diagram needs it"): a vertical Axis centres its spine in its box
 * and draws its ticks to the right, so the left half of the canvas is empty and
 * the spine renders half a box in from wherever the element is placed.
 *
 * Each expectation is asserted twice — once derived from the thickness the Axis
 * was actually handed, which catches a thickness change that forgets the offset,
 * and once hand-enumerated, which catches a wrong derivation. Unlike the
 * horizontal correction on the other pilot surface, these are exact at every
 * viewport: a vertical Axis is not fluid, so it renders 1:1 with CSS px.
 */
describe('Timeline offsets are keyed to the axis box', () => {
  /** Half the axis box: the axis centres its spine, so this much of it is empty. */
  const cross = axisThickness(Number(AXES[0].props.thickness)) / 2;

  test('pulls the axis back by its whole empty half, putting the spine on the rail', () => {
    // units(8) = 64, halved.
    expect(cross).toBe(32);
    expect(cross % UNIT).toBe(0);

    const wrappers = TREE.filter((n) => n.kind === 'div' && classOf(n).includes('shrink-0'));
    expect(wrappers).toHaveLength(1);
    expect(styleOf(wrappers[0]).marginLeft).toBe(-cross);
    expect(styleOf(wrappers[0]).marginLeft).toBe(-32);
  });

  test('sets the terminal line on the same rail as the labels', () => {
    // The label column starts one gap past the axis box, and the box extends
    // `cross` past the spine: 32 + 8. The terminal line is in normal flow rather
    // than positioned, so it reaches that column through padding instead.
    const [gap] = TREE.filter((n) => 'gap' in styleOf(n)).map((n) => Number(styleOf(n).gap));
    expect(gap).toBe(8);

    const accent = accentLine(TREE);
    expect(styleOf(accent).paddingLeft).toBe(cross + gap);
    expect(styleOf(accent).paddingLeft).toBe(40);
    expect(Number(styleOf(accent).paddingLeft) % UNIT).toBe(0);
  });
});

describe('Timeline accent', () => {
  test('accents the terminal and nothing else inside the diagram', () => {
    // Spine + 8 ticks + 8 outlines + 8 serpentines = 25 unaccented paths, plus
    // the terminal's outline and the serpentine that inks it.
    const accented = PATHS.filter((p) => typeof p.props.className === 'string');
    expect(accented).toHaveLength(2);
    for (const p of accented) expect(p.props.className).toBe('text-violet-glow');
  });

  test('terminates the axis', () => {
    expect(AXES[0].props.terminal).toBe(true);
  });

  test('accents exactly one element outside the diagram', () => {
    // Of everything rendered as real markup — the section, the heading, the
    // eight labels, the axis's own <svg> — exactly one carries the accent.
    const violet = TREE.filter((n) => isHost(n) && classOf(n).includes('violet'));
    expect(violet).toHaveLength(1);
    expect(violet[0].kind).toBe('p');
  });

  test('renders every milestone label in the same two greys, none of them accented', () => {
    const titles = TREE.filter((n) => n.kind === 'h3');
    const descriptions = TREE.filter((n) => n.kind === 'p' && !classOf(n).includes('violet'));
    expect(new Set(titles.map(classOf)).size).toBe(1);
    expect(new Set(descriptions.map(classOf)).size).toBe(1);
    expect(descriptions).toHaveLength(8);
  });
});

describe('Timeline renders no decoration of its own', () => {
  test('emits no colour ramp in any class', () => {
    // The rule this axis replaces was a violet-to-blue fade to transparent,
    // which spec section 4.3 does not permit.
    for (const node of TREE) expect(classOf(node)).not.toMatch(/gradient|to-transparent/);
  });

  test('emits no rounded corner anywhere', () => {
    // The station marker used to be a dot inside a halo — two nested pill
    // shapes. Radius 0 is a rule of the design layer, not a styling preference.
    for (const node of TREE) expect(classOf(node)).not.toMatch(/rounded/);
  });

  test('emits no hex literal in any class or style value', () => {
    for (const node of TREE) {
      const values = [classOf(node), ...Object.values(styleOf(node)).map(String)];
      for (const v of values) expect(v).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    }
  });

  test('sizes the axis only through props, never through a class', () => {
    // A sizing class passed through className beats the size the Diagram sets,
    // letterboxes the artwork, and silently invalidates every fraction above.
    // className is for colour.
    expect(String(AXES[0].props.className)).not.toMatch(/\b[wh]-|\bmax-|\baspect-|shrink/);
    // units(8), so the ticks come out units(2) rather than units(1).
    expect(AXES[0].props.thickness).toBe(64);
  });

  test('renders the heading as plain markup, not as an animated element', () => {
    // A motion.h2 would emit an exotic component type here rather than the host
    // tag. The fade-ups sat outside [data-x4-diagram], so the reduced-motion
    // rule never covered them and they ran for visitors who asked for no motion.
    const headings = TREE.filter((n) => n.kind === 'h2');
    expect(headings).toHaveLength(1);
    expect(textOf(headings[0])).toBe('How we got here');
  });
});
