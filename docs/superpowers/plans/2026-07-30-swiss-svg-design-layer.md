# Swiss SVG Design Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Swiss-influenced SVG design language for `apps/marketing` and prove it on two surfaces — `KickstartFlow` and `Timeline`.

**Architecture:** Five primitives in `apps/marketing/src/components/svg/` (grid math, an SVG wrapper owning viewport state, an animated path, a mark vocabulary, and a station axis). Two pilot surfaces consume them. Primitives are built serially and frozen before the surfaces fan out, because both surfaces and the future hero are all instances of the same axis.

**Tech Stack:** Next.js 15 App Router, React 19, `motion` 12.34 (already installed), Tailwind v4, TypeScript 5.6, Bun test runner.

**Spec:** [2026-07-30-swiss-svg-design-layer-design.md](../specs/2026-07-30-swiss-svg-design-layer-design.md). Section references (§) below point into it.

## Global Constraints

- **No new dependencies.** Not runtime, not dev. `motion` 12.34 is installed and is the only animation library. (§2 decision 6)
- **No hex literals in SVG markup, ever.** All color is `currentColor` driven by Tailwind text utilities. (§4.3)
- **Every primitive accepts and forwards `className`.** That pass-through _is_ the color mechanism. (§4.5)
- **`stroke-linecap="butt"`, `stroke-linejoin="miter"`, corner radius `0`.** Rounded caps are a review failure. (§4.2)
- **Exactly two stroke weights:** `1` hairline, `1.5` primary — **authored in user space**. Since Task 3 retracted `non-scaling-stroke` (see §4.2), _rendered_ CSS-pixel width varies with viewport. The enforceable form is: exactly two authored values, always in a `1 : 1.5` ratio. Any third authored weight is a review failure. **Rendered weight is NOT monotonic and cannot be made so** under per-breakpoint constants — rendered width is `authored x scale(v) x multiplier(v)`, and since `scale` is continuous across a breakpoint while the multiplier steps down, the product always falls there. Demanding monotonicity was a controller error, corrected here. What IS required: no breakpoint range may exceed the desktop maximum (the inversion Task 3 fixed). (§4.2)
- **Every coordinate is a multiple of `UNIT = 8`.** Off-grid coordinates are a review failure. (§4.1)
- **Three greys + one accent.** `border` / `muted-foreground` / `foreground`, plus violet **only** on the active/terminal/changed element. If a diagram has no such element it renders fully greyscale. (§4.3)
- **Motion never oscillates.** No spring, no bounce, no overshoot. Draw ~0.8s, stagger 0.06s, linear easing. (§4.5)
- **`prefers-reduced-motion: reduce` renders the final drawn state on first paint**, enforced in exactly one place: the `[data-x4-diagram]` CSS rule in `globals.css`. Primitives carry no reduced-motion logic. (§4.6)
- **Never hand-roll an `<svg>` element.** Always go through `<Diagram>`. The reduced-motion guarantee keys off the `data-x4-diagram` marker `Diagram` emits, so a bare `<svg>` silently opts out of it.
- **`<Axis>` call-site arithmetic (frozen at Task 5, no runtime guard).** Two rules, both silent-failure if broken:
  - **`length / (count - 1)` must be a multiple of `UNIT`.** Stations are snapped individually, so an off-grid spacing does not drift — it _jitters_, alternating spacing (e.g. 72/64/72/64) in a way that reads as sloppy rendering rather than as a bug. Check the arithmetic before writing the call.
  - **`thickness` must be an even number of units and at least `units(6)`.** Odd puts the axis centreline off the 8-grid; `units(4)` yields a **zero-length tick**, i.e. no visible station marks at all. Note `thickness` also sizes the ticks, so a longer leader means a wider diagram.
- **All motion inside a Diagram is path-draw motion** — animate `pathLength` via `DrawPath`, nothing else. The CSS rule pins `stroke-dasharray`/`stroke-dashoffset` only, so an opacity or transform animation inside a Diagram would run for reduced-motion visitors and nothing would catch it. A primitive that needs non-draw motion **stops and reports** so the rule can be extended deliberately.
- **Labels stay in HTML** except grid-registered numerals and ticks. (§4.4)
- **Do not touch** `glow` / `glass` / `noise` / gradient utilities, the other five surfaces, or `packages/shared`. (§10)

## Test Strategy — read this before Task 1

`@testing-library/react`, jsdom, and happy-dom are **not installed anywhere in this monorepo**, and `apps/marketing` has no test runner wired (`"test": "echo 'no tests yet'"`). CLAUDE.md's claim that `apps/web/src/components/*.tsx` uses `@testing-library/react` does not reflect the installed tree. Adding any of them violates the no-new-dependencies constraint.

Verification therefore splits by what each unit actually is:

- **`grid.ts` is pure TypeScript** — genuine TDD with `bun test`, zero new deps. Task 1 wires the runner.
- **The four visual primitives and both surfaces are verified in a real browser** via the SVG lab route and Playwright MCP (§9). Screenshots at 1440 and 375, plus a reduced-motion pass.

This is deliberate. Do not write assertion-free "tests" against React components to satisfy a TDD habit — a test that renders a component and asserts nothing verifies nothing, and for a visual redesign the browser _is_ the test.

**Amended after Task 4 — this section was too pessimistic.** A component in this layer is a pure function returning an element tree, so you can **call it directly and walk the returned tree**, asserting on the elements and props it emits. That needs no jsdom, no testing-library, and no new dependency, and it caught two mutations that source-text assertions let through. Where a primitive's output is geometry, the strongest form is to export the pure geometry function (as Task 4 did with `fillPath`) and assert on the path data it emits.

Two rules learned the hard way there, both of which produced tests that passed against broken code:

- **Never derive an expected value from the same expression the implementation uses.** Hand-enumerate it. A test that recomputes `Math.round(size / FILL_PITCH) + 1` catches nothing.
- **Never assert on source text** — a regex over the file passes while the emitted output is wrong. Assert on what the component or function actually returns.

Browser verification is still required for anything visual (layout, colour, stagger, reduced motion). These tests complement it; they do not replace it.

**Dev server (§9):** dependencies are already installed per-workspace (`apps/marketing/node_modules/.bin/next` exists) — do not run `bun install`. The sandbox blocks port listening, so the dev server must be started with `dangerouslyDisableSandbox: true`. The user approved this during brainstorming.

**Port 3011, not the usual 3001.** Discovered during Task 2: port 3001 — this app's normal `PORT_MARKETING` default — is held on this machine by an unrelated local project's API, which answers requests rather than refusing them. Pointing a browser check at 3001 would silently verify against the wrong server. Every task in this plan uses **3011**.

**The dev server does not survive between tasks.** It is tied to the session that starts it, so each task that needs a browser starts its own and should not assume a previous task left one up. Check before starting: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3011/`.

## File Structure

| File                                                       | Responsibility                                                                                                                | Task |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---- |
| `apps/marketing/src/components/svg/grid.ts`                | `UNIT`, stroke constants, shared stroke attrs, `snap()`, `units()`, `viewBox()`, `stationOffsets()`. Pure — no React, no JSX. | 1    |
| `apps/marketing/src/components/svg/grid.test.ts`           | Unit tests for the above.                                                                                                     | 1    |
| `apps/marketing/src/components/svg/Diagram.tsx`            | `<svg>` wrapper. Owns `useInView({ once: true })` and emits the `data-x4-diagram` marker the reduced-motion CSS rule selects. | 2    |
| `apps/marketing/src/app/svg-lab/page.tsx`                  | Dev-only harness for rendering primitives before surfaces exist. `noindex`, unlinked. **Deleted in Task 8.**                  | 2    |
| `apps/marketing/src/components/svg/DrawPath.tsx`           | Animated path. `pathLength` normalization. Carries no reduced-motion logic — CSS handles it.                                  | 3    |
| `apps/marketing/src/components/svg/marks.tsx`              | `Tick`, `Node`, `Terminal`, `Junction`. Grid-registered, square, hairline.                                                    | 4    |
| `apps/marketing/src/components/svg/Axis.tsx`               | The station axis. `orientation`, variable station count, optional accent terminal. Both pilots and the hero are instances.    | 5    |
| `apps/marketing/src/components/sections/KickstartFlow.tsx` | Rewritten as a plotted process axis.                                                                                          | 6    |
| `apps/marketing/src/components/sections/Timeline.tsx`      | Rewritten as a vertical milestone axis.                                                                                       | 7    |
| `apps/marketing/package.json`                              | `"test": "bun test"`.                                                                                                         | 1    |

**Task 5 is the freeze point.** Tasks 6 and 7 are independent and only _read_ `svg/`. Per §8, a surface agent that needs a primitive change **stops and reports** rather than editing `svg/` or inlining a one-off.

**Run Tasks 6 and 7 sequentially, not in parallel** (decided during execution). The blocker is not file conflicts — it is that both verify through one browser, and viewport size and `emulateMedia` are per-context global state. Concurrent agents would silently corrupt each other's checks: one resizes to 375 while the other screenshots "1440," or one's reduced-motion emulation leaks into the other's normal-motion pass, making an already-drawn axis look like proof the animation works. Task 2 hit that leak and had to reset `emulateMedia` explicitly; two concurrent agents have no such handshake. A wrong visual check is indistinguishable from a right one in a report, and the tasks are two single-file rewrites whose wall-clock is dominated by verification that serializes anyway.

**Hero is not in this plan.** §7 specs it as a later phase; §8 step 3 mentions porting to it. §7 governs — the hero becomes a follow-up plan once Task 8 confirms the primitives held.

---

### Task 1: Grid module

**Files:**

- Create: `apps/marketing/src/components/svg/grid.ts`
- Create: `apps/marketing/src/components/svg/grid.test.ts`
- Modify: `apps/marketing/package.json` (the `"test"` script)

**Interfaces:**

- Consumes: nothing.
- Produces: `UNIT: 8`, `STROKE: { hairline: 1, primary: 1.5 }`, `STROKE_ATTRS`, `snap(n: number): number`, `units(n: number): number`, `viewBox(w: number, h: number): string`, `stationOffsets(count: number): number[]`. Every later task imports from here.

- [ ] **Step 1: Write the failing test**

Create `apps/marketing/src/components/svg/grid.test.ts`:

```ts
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
});
```

- [ ] **Step 2: Point the workspace test script at Bun**

In `apps/marketing/package.json`, change the `"test"` script:

```json
"test": "bun test",
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd apps/marketing && bun test src/components/svg/grid.test.ts`
Expected: FAIL — `Cannot find module './grid'`.

- [ ] **Step 4: Write the implementation**

Create `apps/marketing/src/components/svg/grid.ts`:

```ts
/**
 * Swiss grid constants and coordinate math.
 *
 * Every SVG coordinate in this design layer is a multiple of UNIT. Authoring
 * sites call snap() rather than rounding by hand so the rule holds in one place.
 */

/** Base grid unit, in user-space px. */
export const UNIT = 8;

/** The only two stroke weights in the system: hairline structure, primary path. */
export const STROKE = {
  hairline: 1,
  primary: 1.5,
} as const;

export type StrokeWeight = keyof typeof STROKE;

/**
 * Attributes every stroked element in the system carries.
 *
 * Butt caps and miter joins are the tell that separates Swiss line art from
 * generic friendly-startup illustration — centralized here so no call site can
 * quietly opt out.
 *
 * NOTE: this listing originally carried vector-effect: non-scaling-stroke. The
 * Task 3 spike proved it incompatible with stroke-dasharray path drawing in both
 * Chromium and WebKit, so it was removed. This block is left as the historical
 * Task 1 record; grid.ts at HEAD does not have it, and grid.test.ts asserts the
 * exact key set so it cannot come back silently.
 */
export const STROKE_ATTRS = {
  fill: 'none',
  strokeLinecap: 'butt',
  strokeLinejoin: 'miter',
} as const;

/** Round a coordinate to the nearest grid unit. */
export function snap(n: number): number {
  return Math.round(n / UNIT) * UNIT;
}

/** Convert a count of grid units to user-space px. */
export function units(n: number): number {
  return n * UNIT;
}

/** Build an origin-anchored viewBox string with snapped dimensions. */
export function viewBox(width: number, height: number): string {
  return `0 0 ${snap(width)} ${snap(height)}`;
}

/**
 * Normalized positions (0 to 1) of evenly spaced stations along an axis.
 *
 * Animation stagger keys off these rather than array index, so the draw follows
 * the geometry and reordering or adding a station cannot desync it. Normalized
 * position rather than a raw coordinate, because the vertical axis variant gives
 * every station the same x.
 */
export function stationOffsets(count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0];
  return Array.from({ length: count }, (_, i) => i / (count - 1));
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd apps/marketing && bun test src/components/svg/grid.test.ts`
Expected: PASS, 14 tests.

- [ ] **Step 6: Verify the repo gates**

Run: `bun turbo type-check --filter=@x4/marketing`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add apps/marketing/src/components/svg/grid.ts apps/marketing/src/components/svg/grid.test.ts apps/marketing/package.json
git commit -m "feat(marketing): add Swiss SVG grid module

Base 8px unit, the system's two stroke weights, and the shared stroke
attributes that centralize butt caps and miter joins so no call site can
opt out. stationOffsets returns normalized positions so animation stagger
follows geometry rather than array index.

Wires bun test for the marketing workspace."
```

---

### Task 2: Diagram wrapper + SVG lab

**Files:**

- Create: `apps/marketing/src/components/svg/Diagram.tsx`
- Create: `apps/marketing/src/app/svg-lab/page.tsx`
- Modify: `apps/marketing/src/styles/globals.css` (append the reduced-motion rule only)

**Interfaces:**

- Consumes: `viewBox` from `./grid`.
- Produces: `<Diagram width height fluid className children />`, `useDiagram(): { drawn: boolean }`, and the `[data-x4-diagram]` reduced-motion CSS rule. `drawn` is viewport state only — reduced motion never enters JS, so primitives carry no reduced-motion logic at all.

- [ ] **Step 1: Write the Diagram primitive**

Create `apps/marketing/src/components/svg/Diagram.tsx`:

```tsx
'use client';

import { createContext, useContext, useRef, type ReactNode } from 'react';
import { useInView } from 'motion/react';
import { cn } from '@/lib/utils';
import { viewBox } from './grid';

interface DiagramState {
  /**
   * True when children should render their final, fully-drawn state.
   *
   * Purely a viewport signal. Reduced motion is deliberately NOT folded in here
   * and is not exposed at all — it is handled entirely in CSS (see the
   * data-x4-diagram rule in globals.css). Primitives therefore carry no
   * reduced-motion logic and cannot forget a rule they never touch.
   */
  drawn: boolean;
}

/**
 * Default is deliberately "already drawn" so a primitive rendered outside a
 * Diagram degrades to its final state rather than staying invisible. Note it
 * degrades to drawn, not to reduced-motion-safe: outside a Diagram there is no
 * data-x4-diagram marker, so the CSS rule does not apply there either.
 */
const DiagramContext = createContext<DiagramState>({ drawn: true });

export function useDiagram(): DiagramState {
  return useContext(DiagramContext);
}

interface DiagramProps {
  /** Authoring width in user-space px. Snapped to the grid. */
  width: number;
  /** Authoring height in user-space px. Snapped to the grid. */
  height: number;
  /**
   * Stretch to the container width, height following the aspect ratio.
   *
   * True suits a wide diagram. False renders at authored size, which is what a
   * tall narrow one needs — a 32x768 viewBox stretched to 100% width would
   * scale to absurd height.
   */
  fluid?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Responsive SVG wrapper and the single place viewport state is resolved.
 *
 * The data-x4-diagram marker is load-bearing, not a test hook: it is what the
 * reduced-motion CSS rule in globals.css selects. Reduced motion is handled in
 * CSS rather than JS because useReducedMotion() returns null during SSR — a
 * JS-derived value would render an undrawn first frame for reduced-motion
 * visitors and introduce a hydration mismatch for exactly those users. See
 * spec section 4.6.
 *
 * aria-hidden because all meaningful labels live in HTML (spec section 4.4) —
 * the SVG carries geometry, not content a screen reader needs.
 */
export function Diagram({ width, height, fluid = true, className, children }: DiagramProps) {
  const ref = useRef<SVGSVGElement>(null);
  const drawn = useInView(ref, { once: true, margin: '-50px' });

  return (
    <DiagramContext.Provider value={{ drawn }}>
      <svg
        ref={ref}
        data-x4-diagram=""
        viewBox={viewBox(width, height)}
        width={fluid ? undefined : width}
        height={fluid ? undefined : height}
        className={cn('block', fluid && 'h-auto w-full', className)}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        {children}
      </svg>
    </DiagramContext.Provider>
  );
}
```

Sizing goes through `cn` rather than an inline `style`, because an inline style
would beat any Tailwind class a caller passes in `className` and make the prop
un-overridable. Add the import alongside the others:
`import { cn } from '@/lib/utils';` — it already exists in the app and wraps
`tailwind-merge`.

- [ ] **Step 2: Add the reduced-motion CSS rule**

Append to `apps/marketing/src/styles/globals.css`. Do not modify any existing rule in that file — the `glow` / `glass` / `noise` / gradient utilities are out of scope (§10).

```css
/* Reduced motion: pin every diagram to its final drawn state.
   
   This lives in CSS rather than in the SVG primitives because motion's
   useReducedMotion() returns null during SSR, so a JS-derived value renders an
   undrawn first frame for reduced-motion visitors and creates a server/client
   hydration mismatch for exactly those users. A media query is present in the
   server HTML with zero JS, so the drawn state is correct on first paint.

   This overrides motion's path drawing, which is applied via setAttribute() —
   presentation attributes, the lowest tier of the cascade. !important is
   belt-and-braces in case a future version switches to inline styles. */
@media (prefers-reduced-motion: reduce) {
  [data-x4-diagram] * {
    stroke-dasharray: none !important;
    stroke-dashoffset: 0 !important;
  }
}
```

- [ ] **Step 3: Create the SVG lab route**

This is the harness for verifying primitives before any surface consumes them. It is unlinked and `noindex`, and Task 8 deletes it.

Create `apps/marketing/src/app/svg-lab/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { Diagram } from '@/components/svg/Diagram';
import { STROKE, STROKE_ATTRS, units } from '@/components/svg/grid';

export const metadata: Metadata = {
  title: 'SVG Lab',
  robots: { index: false, follow: false },
};

/**
 * Development harness for the Swiss SVG primitives. Unlinked and noindex.
 * Deleted once both pilot surfaces are verified.
 */
export default function SvgLabPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-16 px-6 py-24">
      <h1 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">SVG Lab</h1>

      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Diagram — static baseline
        </h2>
        <Diagram width={units(120)} height={units(10)} className="text-border">
          <line
            x1={0}
            y1={units(5)}
            x2={units(120)}
            y2={units(5)}
            stroke="currentColor"
            strokeWidth={STROKE.hairline}
            {...STROKE_ATTRS}
          />
        </Diagram>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Start the dev server**

The sandbox blocks port listening, so this needs the sandbox escape the user approved (§9). Do **not** run `bun install` — deps are already present.

Run in background with `dangerouslyDisableSandbox: true`:

```bash
cd apps/marketing && ./node_modules/.bin/next dev --port 3011
```

- [ ] **Step 5: Verify in the browser**

Navigate Playwright MCP to `http://localhost:3011/svg-lab`.

Expected: a full-width hairline rule. Confirm via `browser_evaluate` that the rendered `<svg>` has `viewBox="0 0 960 80"`. (This step originally also asserted a 1px stroke on the assumption `non-scaling-stroke` would hold it constant. Task 3 retracted that attribute, so rendered width now scales with the viewBox and the assertion no longer applies.)

- [ ] **Step 6: Verify the repo gates**

Run: `bun turbo type-check --filter=@x4/marketing && bun turbo lint --filter=@x4/marketing`
Expected: exit 0 for both.

- [ ] **Step 7: Commit**

```bash
git add apps/marketing/src/components/svg/Diagram.tsx apps/marketing/src/app/svg-lab/page.tsx apps/marketing/src/styles/globals.css
git commit -m "feat(marketing): add Diagram SVG wrapper and dev lab route

Diagram resolves viewport state and emits the data-x4-diagram marker that
the reduced-motion CSS rule selects. Reduced motion is enforced in CSS
rather than JS because useReducedMotion() returns null during SSR, so a
JS-derived value would render an undrawn first frame for reduced-motion
visitors. Context defaults to already-drawn so a primitive rendered
outside a Diagram degrades to its final state rather than staying
invisible.

The lab route is unlinked and noindex; it exists to verify primitives
before any surface consumes them and is removed once both pilots land."
```

---

### Task 3: DrawPath + the non-scaling-stroke spike

**Files:**

- Create: `apps/marketing/src/components/svg/DrawPath.tsx`
- Modify: `apps/marketing/src/app/svg-lab/page.tsx` (add a DrawPath section)

**Interfaces:**

- Consumes: `STROKE`, `STROKE_ATTRS`, `StrokeWeight` from `./grid`; `useDiagram` from `./Diagram`.
- Produces: `<DrawPath d weight delay duration className />`.

**This task carries the spike §9 requires.** `pathLength` + dasharray is well-supported; `non-scaling-stroke` + dasharray is where cross-browser inconsistency lives, because the dash pattern is computed in user space but stroked in device space. It gets settled here, once, in the primitive — not twice in two surfaces.

- [ ] **Step 1: Write the DrawPath primitive**

Create `apps/marketing/src/components/svg/DrawPath.tsx`:

```tsx
'use client';

import { motion } from 'motion/react';
import { STROKE, STROKE_ATTRS, type StrokeWeight } from './grid';
import { useDiagram } from './Diagram';

interface DrawPathProps {
  /** SVG path data. All coordinates must be grid-snapped. */
  d: string;
  weight?: StrokeWeight;
  /** Seconds to delay the draw. Derive from normalized axis position, not array index. */
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * A path that draws itself when its Diagram scrolls into view.
 *
 * pathLength normalization means the dash math is independent of the path's
 * real length, so delay and duration behave identically for a 40px tick and a
 * 960px baseline.
 *
 * Linear easing on purpose: a drawing line that eases out reads as decoration.
 * Swiss motion does not overshoot (spec section 4.5).
 */
export function DrawPath({
  d,
  weight = 'primary',
  delay = 0,
  duration = 0.8,
  className,
}: DrawPathProps) {
  const { drawn } = useDiagram();

  return (
    <motion.path
      d={d}
      pathLength={1}
      stroke="currentColor"
      strokeWidth={STROKE[weight]}
      className={className}
      {...STROKE_ATTRS}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: drawn ? 1 : 0 }}
      transition={{ duration, delay, ease: 'linear' }}
    />
  );
}
```

There is deliberately **no reduced-motion branch here.** Reduced motion is
handled entirely by the CSS rule Task 2 added against `[data-x4-diagram]`, which
pins `stroke-dasharray`/`stroke-dashoffset` to the drawn state. A primitive
cannot forget a rule it never touches, and — unlike a JS check — the CSS is
present in the server-rendered HTML, so the drawn state is correct on the very
first paint rather than after hydration.

`initial` and `animate` therefore depend only on viewport state, which is
identical on server and client (both `false`), so this introduces no hydration
mismatch.

- [ ] **Step 2: Add a spike section to the lab**

Add to `apps/marketing/src/app/svg-lab/page.tsx`, inside `<main>` after the existing section. Add `import { DrawPath } from '@/components/svg/DrawPath';` at the top.

```tsx
<section className="space-y-4">
  <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
    DrawPath — stagger by normalized position
  </h2>
  <Diagram width={units(120)} height={units(10)} className="text-muted-foreground">
    <DrawPath d={`M 0 ${units(5)} L ${units(120)} ${units(5)}`} />
    {[0, 0.25, 0.5, 0.75, 1].map((t) => (
      <DrawPath
        key={t}
        d={`M ${units(120) * t} ${units(5)} L ${units(120) * t} ${units(2)}`}
        weight="hairline"
        duration={0.3}
        delay={0.8 * t}
      />
    ))}
  </Diagram>
</section>
```

- [ ] **Step 3: Verify the draw animation**

With the dev server running, navigate Playwright MCP to `http://localhost:3011/svg-lab`.

Expected: the baseline draws left to right over ~0.8s; each tick fires as the draw front reaches it. Ticks must fire **in spatial order**, and the last tick must land as the baseline completes. If ticks fire together, the delay is not being applied.

- [ ] **Step 4: Run the cross-browser spike — do not skip**

Screenshot the lab in **Chromium**, then again in **WebKit** (`browser_navigate` after switching browser, or a WebKit-backed Playwright context).

Expected: identical stroke weights and identical dash behavior. Specifically confirm no path renders with a visibly heavier or lighter stroke in WebKit, and that partially-drawn paths show a clean single segment rather than a repeating dash pattern.

**If WebKit misbehaves:** remove `vectorEffect: 'non-scaling-stroke'` from `STROKE_ATTRS` in `grid.ts`, update the `STROKE_ATTRS` test in `grid.test.ts` accordingly, and instead scale `strokeWidth` per breakpoint inside `Diagram`. Record the outcome either way in the commit message — Tasks 5–7 depend on this being settled.

- [ ] **Step 5: Verify reduced motion**

Via Playwright MCP `browser_run_code_unsafe`, apply `emulateMedia({ reducedMotion: 'reduce' })`, then reload `http://localhost:3011/svg-lab`.

Expected: every path renders **fully drawn on first paint**, with no animation. Screenshot to confirm.

- [ ] **Step 6: Verify the repo gates**

Run: `bun turbo type-check --filter=@x4/marketing && bun turbo lint --filter=@x4/marketing`
Expected: exit 0 for both.

- [ ] **Step 7: Commit**

Record the spike result in the message (replace the bracketed line with what you actually observed):

```bash
git add apps/marketing/src/components/svg/DrawPath.tsx apps/marketing/src/app/svg-lab/page.tsx
git commit -m "feat(marketing): add DrawPath scroll-triggered path primitive

pathLength normalization makes dash math independent of real path length,
so delay and duration behave the same for a 40px tick and a 960px
baseline. Linear easing on purpose — a drawing line that eases out reads
as decoration rather than construction.

Cross-browser spike on non-scaling-stroke combined with dasharray:
[record the WebKit result and whether non-scaling-stroke was kept]."
```

---

### Task 4: Mark vocabulary

**Files:**

- Create: `apps/marketing/src/components/svg/marks.tsx`
- Modify: `apps/marketing/src/app/svg-lab/page.tsx` (add a marks section)

**Interfaces:**

- Consumes: `STROKE`, `STROKE_ATTRS`, `units` from `./grid`.
- Produces: `<Tick x y length orientation delay duration className />`, `<Node x y size filled delay duration className />`, `<Terminal x y size delay duration className />`, `<Junction x y size delay duration className />`, plus `MARK_DURATION` (0.25) and the `Orientation` type. All take grid-snapped user-space coordinates. **Every mark animates**, via `DrawPath` internally — `delay` defaults to 0, `duration` to `MARK_DURATION`. Import `Orientation` rather than redeclaring the union.

**RESOLVED during Task 4 — a fourth option.** §5 and §6 say each station's mark "fires as the draw front passes it," but the originally planned `Axis` rendered marks statically. The obstacle was that a **filled** `Node` cannot draw: SVG paints `fill` regardless of `stroke-dasharray`, so a filled node would show its fill at t=0 — and `Timeline` needs filled nodes for `status: 'complete'`. An opacity fade was unavailable, since the reduced-motion CSS rule pins dash properties only.

The resolution removes the obstacle rather than working around it: **nothing in the mark vocabulary uses `fill` at all.** A solid square is a stroked serpentine at half-unit pitch — a plotter fill — so it draws exactly like every other mark. Every mark is a `DrawPath` with a `delay`.

This keeps §6's `filled = complete` verbatim (no spec change), adds no third authored stroke weight, and adds no second motion site. The rejected options: option 3 (express completion with stroke instead of fill) does not solve `Terminal`, which is always solid; option 2 (fold ticks into the spine path) leaves nodes unsolved and becomes redundant once marks own a delay.

Consequence for Task 5: a solid `Node`/`Terminal` renders **two** `<path>` elements (outline plus serpentine), not one.

- [ ] **Step 1: Write the marks**

Create `apps/marketing/src/components/svg/marks.tsx`:

```tsx
import { STROKE, STROKE_ATTRS, units } from './grid';

export type Orientation = 'horizontal' | 'vertical';

interface TickProps {
  x: number;
  y: number;
  /** Tick length in user-space px. Defaults to two grid units. */
  length?: number;
  /** Orientation of the axis the tick belongs to; the tick runs perpendicular. */
  orientation: Orientation;
  className?: string;
}

/**
 * A short rule meeting an axis at a station. Runs perpendicular to the axis, so
 * a horizontal axis gets vertical ticks and vice versa.
 */
export function Tick({ x, y, length = units(2), orientation, className }: TickProps) {
  const horizontalAxis = orientation === 'horizontal';
  return (
    <line
      x1={x}
      y1={y}
      x2={horizontalAxis ? x : x + length}
      y2={horizontalAxis ? y - length : y}
      stroke="currentColor"
      strokeWidth={STROKE.hairline}
      className={className}
      {...STROKE_ATTRS}
    />
  );
}

interface NodeProps {
  x: number;
  y: number;
  /** Edge length in user-space px. Defaults to one grid unit. */
  size?: number;
  /** Filled reads as complete; hollow reads as pending. */
  filled?: boolean;
  className?: string;
}

/**
 * A station marker, centered on (x, y). Square with zero radius — the shape is
 * doing the same job a circle would, and circles are not in this vocabulary.
 */
export function Node({ x, y, size = units(1), filled = false, className }: NodeProps) {
  return (
    <rect
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      stroke="currentColor"
      strokeWidth={STROKE.hairline}
      className={className}
      {...STROKE_ATTRS}
      fill={filled ? 'currentColor' : 'none'}
    />
  );
}

interface TerminalProps {
  x: number;
  y: number;
  /** Edge length in user-space px. Defaults to one and a half grid units. */
  size?: number;
  className?: string;
}

/**
 * The end of an axis. Always filled and always the accented element, so it is
 * the one thing the eye lands on (spec section 4.3).
 */
export function Terminal({ x, y, size = units(1.5), className }: TerminalProps) {
  return (
    <rect
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      className={className}
      {...STROKE_ATTRS}
      fill="currentColor"
    />
  );
}

interface JunctionProps {
  x: number;
  y: number;
  /** Arm length in user-space px. Defaults to one grid unit. */
  size?: number;
  className?: string;
}

/** A crossing where a branch meets an axis. */
export function Junction({ x, y, size = units(1), className }: JunctionProps) {
  return (
    <g stroke="currentColor" strokeWidth={STROKE.hairline} className={className} {...STROKE_ATTRS}>
      <line x1={x - size} y1={y} x2={x + size} y2={y} />
      <line x1={x} y1={y - size} x2={x} y2={y + size} />
    </g>
  );
}
```

- [ ] **Step 2: Add a marks section to the lab**

Add to `apps/marketing/src/app/svg-lab/page.tsx`, and import: `import { Junction, Node, Terminal, Tick } from '@/components/svg/marks';`

```tsx
<section className="space-y-4">
  <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Marks</h2>
  <Diagram width={units(120)} height={units(10)} className="text-muted-foreground">
    <Tick x={units(10)} y={units(5)} orientation="horizontal" />
    <Node x={units(30)} y={units(5)} />
    <Node x={units(50)} y={units(5)} filled />
    <Junction x={units(70)} y={units(5)} />
    <Terminal x={units(90)} y={units(5)} className="text-violet-glow" />
  </Diagram>
</section>
```

- [ ] **Step 3: Verify in the browser**

Navigate Playwright MCP to `http://localhost:3011/svg-lab` and screenshot.

Expected: hollow square, filled square, cross, and a violet filled square. **Every corner is square** — if anything renders rounded, a `rx`/`ry` or a `linecap` leaked in. Confirm the `Terminal` is the only colored element.

- [ ] **Step 4: Verify the repo gates**

Run: `bun turbo type-check --filter=@x4/marketing && bun turbo lint --filter=@x4/marketing`
Expected: exit 0 for both.

- [ ] **Step 5: Commit**

```bash
git add apps/marketing/src/components/svg/marks.tsx apps/marketing/src/app/svg-lab/page.tsx
git commit -m "feat(marketing): add Swiss mark vocabulary

Tick, Node, Terminal, and Junction. Squares rather than circles, zero
radius throughout. Node's filled variant is what lets a status field
render a real distinction instead of decoration. Terminal is filled and
accented because it is the one element the eye should land on."
```

---

### Task 5: Axis — the freeze point

**Files:**

- Create: `apps/marketing/src/components/svg/Axis.tsx`
- Modify: `apps/marketing/src/app/svg-lab/page.tsx` (add both orientations)

**Interfaces:**

- Consumes: `units`, `stationOffsets`, `STROKE` from `./grid`; `Diagram` from `./Diagram`; `DrawPath` from `./DrawPath`; `Node`, `Terminal`, `Tick` from `./marks`.
- Produces: `<Axis orientation length count filled terminal thickness className />`. **Tasks 6 and 7 build against this signature. Once this task is committed, the API is frozen** — a surface needing a change stops and reports (§8).

There is deliberately **no mid-axis accent prop**. Every specced surface accents
its terminal, so an `accentIndex` would ship unused. If the hero later needs to
accent a station in the middle, that is the escape hatch working as intended
rather than a gap to pre-fill.

This is the primitive §7 requires for the hero: variable station count, either orientation, optional accent terminal.

**This task is the first real non-fluid consumer, and it owns a deferred decision about `--x4-stroke-scale`.** Task 3 introduced that per-breakpoint multiplier to keep strokes legible once `non-scaling-stroke` was retracted. Two facts constrain what you may do with it, both established by review rather than assumed:

- **Lowering any multiplier below `1` bands the serpentine fill.** Task 4's solid marks sit _exactly_ at their coverage floor (2.0x at `md+`, where the multiplier is 1). Coverage is `2 x --x4-stroke-scale`, so anything under 1 gaps the fill and solid nodes visibly stripe. **Deleting the mechanism entirely is safe** — the `var(--x4-stroke-scale, 1)` fallback holds the floor.
- **The fluid/non-fluid mismatch is real but currently latent.** At 390px a fluid diagram renders primary 0.855 / hairline 0.570 while a non-fluid one renders 1.500 / 1.000, so a non-fluid diagram's _hairline_ is heavier than a fluid diagram's _primary_ — the weight hierarchy inverts between two diagrams on one screen. In the pilots as planned they are never on screen together (`KickstartFlow` is fluid-horizontal at `md+` and non-fluid-vertical below; `Timeline` is non-fluid throughout), so nothing is visibly broken today. It becomes visible the moment one page shows both.

The mismatch is **not** closable by retuning the base multiplier: closing it needs base ≈ 2.8, which renders 2.59 at 639px — 70% above the desktop max, a worse inversion than the one Task 3 just removed. Two other knobs exist and neither has been evaluated: compensating the _non-fluid_ side downward, or **deleting the compensation entirely** on the grounds that the design already rotates to a vertical axis below `md`, so a 960-unit diagram never needs to render at 390px — constrain fluid usage to `md+` and scale stays roughly 0.75–1.33, never sub-pixel.

Evaluate with real artwork in the browser now that you have both orientations rendering. Decide, implement, and state which you chose and why. If you delete the compensation, delete its tripwire tests with it and say so.

- [ ] **Step 1: Write the Axis**

Create `apps/marketing/src/components/svg/Axis.tsx`:

```tsx
'use client';

import { Diagram } from './Diagram';
import { DrawPath } from './DrawPath';
import { Node, Terminal, Tick } from './marks';
import { stationOffsets, units } from './grid';

interface AxisProps {
  orientation: 'horizontal' | 'vertical';
  /** Axis length in user-space px. Must be grid-snapped. */
  length: number;
  /** Number of stations, evenly spaced end to end. */
  count: number;
  /** Per-station fill. Index-aligned with stations; omitted entries read as hollow. */
  filled?: boolean[];
  /** Draw an accented terminal past the final station. */
  terminal?: boolean;
  /** Cross-axis extent in user-space px — the room ticks and marks occupy. */
  thickness?: number;
  className?: string;
}

const DRAW_DURATION = 0.8;
const ACCENT_CLASS = 'text-violet-glow';

/**
 * The station axis every surface in this design layer is an instance of:
 * KickstartFlow horizontally, Timeline vertically, and the hero pipeline later.
 *
 * Station timing derives from normalized position along the axis, so the marks
 * appear as the draw front reaches them. Adding or reordering a station cannot
 * desync the animation, and the same math holds when the axis rotates for
 * mobile — which raw coordinates would not, since a vertical axis gives every
 * station the same x.
 */
export function Axis({
  orientation,
  length,
  count,
  filled = [],
  terminal = false,
  thickness = units(6),
  className,
}: AxisProps) {
  const horizontal = orientation === 'horizontal';
  const offsets = stationOffsets(count);
  const cross = thickness / 2;

  /**
   * Stations span the full `length`; the terminal sits beyond it and the canvas
   * grows to fit. Shrinking the station span to make room instead would leave a
   * consumer's evenly distributed labels no longer lining up with the stations
   * they name.
   *
   * PAD exists because the first and last stations sit at t=0 and t=1, i.e. on
   * the canvas edges, where a node centred on the axis would clip by half its
   * size. One grid unit clears a default node (size units(1), so half is 4) and
   * keeps every coordinate on the 8-grid.
   */
  const PAD = units(1);
  const terminalAt = PAD + length + units(2);
  const extent = PAD + length + (terminal ? units(4) : PAD);

  const at = (t: number) =>
    horizontal ? { x: PAD + length * t, y: cross } : { x: cross, y: PAD + length * t };
  const spine = horizontal
    ? `M ${PAD} ${cross} L ${PAD + length} ${cross}`
    : `M ${cross} ${PAD} L ${cross} ${PAD + length}`;

  return (
    <Diagram
      width={horizontal ? extent : thickness}
      height={horizontal ? thickness : extent}
      fluid={horizontal}
      className={className}
    >
      <DrawPath d={spine} weight="hairline" duration={DRAW_DURATION} />

      {offsets.map((t, i) => {
        const { x, y } = at(t);
        // Timing follows geometry: each station fires as the draw front reaches it.
        const delay = DRAW_DURATION * t;
        return (
          <g key={i}>
            <Tick x={x} y={y} orientation={orientation} delay={delay} />
            <Node x={x} y={y} filled={filled[i] ?? false} delay={delay} />
          </g>
        );
      })}

      {terminal && (
        <Terminal
          x={horizontal ? terminalAt : cross}
          y={horizontal ? cross : terminalAt}
          delay={DRAW_DURATION}
          className={ACCENT_CLASS}
        />
      )}
    </Diagram>
  );
}
```

**Resolve visually in the browser before committing:** a `Tick` starts at the station centre and runs perpendicular, so it passes through the interior of the `Node` drawn at the same point, leaving a visible stub inside a hollow square. Found during Task 4 and left for this task because it is a composition question, not a mark defect. Two approaches, both on-grid — pick whichever reads better and say which in your report:

1. Start the tick one full unit off the axis (`units(1)`), leaving a deliberate 4-unit gap between node edge and tick. Gaps of that kind are idiomatic in Swiss diagramming, so this may read as intentional rather than as a fix.
2. Move the node to the tick's outer end so the two never overlap, leaving the axis itself unmarked at the station.

Do not use a half-unit offset — `units(0.5)` is 4, which violates the 8-grid constraint.

- [ ] **Step 2: Add both orientations to the lab**

Add to `apps/marketing/src/app/svg-lab/page.tsx`, and import: `import { Axis } from '@/components/svg/Axis';`

```tsx
      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Axis — horizontal, six stations, accent terminal
        </h2>
        <Axis orientation="horizontal" length={units(120)} count={6} terminal className="text-border" />
      </section>

      <section className="max-w-xs space-y-4">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Axis — vertical, eight stations, all filled
        </h2>
        <Axis
          orientation="vertical"
          length={units(60)}
          count={8}
          filled={Array(8).fill(true)}
          terminal
          className="text-border"
        />
      </section>
```

- [ ] **Step 3: Verify both orientations**

Navigate Playwright MCP to `http://localhost:3011/svg-lab` and screenshot.

Expected: the horizontal axis draws left to right with six evenly spaced stations and a violet terminal square at the end; the vertical axis draws top to bottom with eight filled stations and a violet terminal at the bottom. In both, the terminal is the **only** colored element.

- [ ] **Step 4: Verify reduced motion once more**

Apply `emulateMedia({ reducedMotion: 'reduce' })` and reload.
Expected: both axes fully drawn on first paint, no animation.

- [ ] **Step 5: Verify the repo gates**

Run: `bun turbo type-check --filter=@x4/marketing && bun turbo lint --filter=@x4/marketing`
Expected: exit 0 for both.

- [ ] **Step 6: Commit**

```bash
git add apps/marketing/src/components/svg/Axis.tsx apps/marketing/src/app/svg-lab/page.tsx
git commit -m "feat(marketing): add Axis primitive and freeze the svg API

Both pilot surfaces and the future hero pipeline are instances of this
one component, which is why it is built before the surfaces rather than
extracted afterward from whichever surface happened to land first.

Station timing derives from normalized position along the axis, so marks
appear as the draw front reaches them and the same math survives the
rotation to vertical on mobile.

Surfaces build against this signature from here; a surface needing a
primitive change stops and reports rather than editing svg/ in place."
```

---

### Task 6: KickstartFlow — plotted process axis

**Runs in parallel with Task 7.** Touches only `KickstartFlow.tsx`; reads `svg/` but must not write to it.

**Files:**

- Modify: `apps/marketing/src/components/sections/KickstartFlow.tsx` (full rewrite of the flow markup; `FLOW_STEPS` and `PLANNING_MODES` data is retained with the `color` field removed)

**Interfaces:**

- Consumes: `<Axis>` from `@/components/svg/Axis`, `units` from `@/components/svg/grid`.
- Produces: nothing other tasks depend on.

**Spec:** §5. **Quality bar:** §3 — if the diagram can be deleted and nothing is lost but decoration, it failed.

- [ ] **Step 1: Delete the rainbow**

In `apps/marketing/src/components/sections/KickstartFlow.tsx`, remove the `color` field from the `FlowStep` interface and from all six entries in `FLOW_STEPS`. The six hardcoded hexes (`#7c3aed`, `#3b82f6`, `#06b6d4`, `#4ade80`, `#f59e0b`, `#8b5cf6`) carried no information — they were assigned by array position. Remove every `style={{ borderColor: ... }}`, `style={{ backgroundColor: step.color }}`, and `style={{ color: step.color }}` that referenced them.

- [ ] **Step 2: Replace the card row with the axis**

Replace the `md:overflow-x-auto` block (the outer `<div>` wrapping the `FLOW_STEPS.map`) with an axis plus an HTML label row. The axis is horizontal at `md` and up, vertical below — §5 rejects the horizontal-scroll fallback the current code uses.

```tsx
      {/* Horizontal at md+, rotated vertical on small screens (spec section 5) */}
      <div className="hidden md:block">
        <Axis
          orientation="horizontal"
          length={units(120)}
          count={FLOW_STEPS.length}
          terminal
          className="text-border"
        />
        <div className="mt-4 grid grid-cols-6 gap-4">
          {FLOW_STEPS.map((step) => (
            <div key={step.number}>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {String(step.number).padStart(2, '0')}
              </p>
              <p className="mt-1 font-semibold text-foreground">{step.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-6 md:hidden">
        <Axis
          orientation="vertical"
          length={units(70)}
          count={FLOW_STEPS.length}
          terminal
          thickness={units(6)}
          className="shrink-0 text-border"
        />
        {/* Height pinned to the axis length so labels line up with stations
            rather than with the taller canvas the terminal adds. */}
        <div
          className="flex flex-1 flex-col justify-between"
          style={{ height: units(70) }}
        >
          {FLOW_STEPS.map((step) => (
            <div key={step.number}>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {String(step.number).padStart(2, '0')}
              </p>
              <p className="font-semibold text-foreground">{step.name}</p>
            </div>
          ))}
        </div>
      </div>
```

Add the imports: `import { Axis } from '@/components/svg/Axis';` and `import { units } from '@/components/svg/grid';`

- [ ] **Step 3: Make the accent point at `/x4:work`**

The axis terminates at the command — the one violet element, reading _six planning steps, and this is what you actually run_. Replace the existing command-line block's container classes so it is flush with the axis terminal rather than centered in a rounded card:

```tsx
<div className="inline-flex flex-col items-start border-l-2 border-violet-glow bg-card px-6 py-4 font-mono text-sm sm:flex-row sm:items-center sm:gap-4">
  <span className="text-violet-glow">/x4:work</span>
  <span className="mt-1 text-muted-foreground sm:mt-0">
    ← agents build all features, in order, automatically
  </span>
</div>
```

- [ ] **Step 4: Convert "Three ways to plan" to grid cells**

Replace the `rounded-2xl` card classes in the `PLANNING_MODES.map` with hairline-ruled square cells. Kickstart stays the accented cell; the other two are greyscale.

```tsx
<div
  key={mode.name}
  className={`border p-6 transition-colors ${
    mode.highlighted ? 'border-violet-glow/50' : 'border-border'
  }`}
>
  <p className={`font-semibold ${mode.highlighted ? 'text-violet-glow' : 'text-foreground'}`}>
    {mode.name}
    {mode.highlighted && (
      <span className="ml-2 border border-violet-glow/30 px-2 py-0.5 font-mono text-xs uppercase tracking-widest text-violet-glow">
        this page
      </span>
    )}
  </p>
  <p className="mt-2 text-sm text-muted-foreground">{mode.description}</p>
</div>
```

- [ ] **Step 5: Verify at both breakpoints**

With the dev server running, navigate Playwright MCP to `http://localhost:3011/kickstart`.

- Screenshot at **1440**: horizontal axis, six stations, labels aligned under their stations, violet terminal.
- Resize to **375** and screenshot: axis is **vertical**, labels to its right, and **no horizontal scrollbar**. Confirm via `browser_evaluate` that `document.documentElement.scrollWidth <= window.innerWidth`.
- Confirm no hex literal survives: `grep -n '#[0-9a-fA-F]\{6\}' apps/marketing/src/components/sections/KickstartFlow.tsx` returns nothing.

- [ ] **Step 6: Verify reduced motion**

Apply `emulateMedia({ reducedMotion: 'reduce' })`, reload `/kickstart`, screenshot.
Expected: axis fully drawn on first paint, no animation.

- [ ] **Step 7: Verify the repo gates**

Run: `bun turbo type-check --filter=@x4/marketing && bun turbo lint --filter=@x4/marketing`
Expected: exit 0 for both.

- [ ] **Step 8: Commit**

```bash
git add apps/marketing/src/components/sections/KickstartFlow.tsx
git commit -m "feat(marketing): rebuild KickstartFlow as a plotted process axis

The six steps were rendered as rounded cards with six hardcoded hexes
assigned by array position, so color carried no information. They are now
stations on a single axis, all greyscale, terminating in an accented
/x4:work — six planning steps, and this is the one you run.

Small screens rotate the axis to vertical rather than falling back to
horizontal scrolling."
```

---

### Task 7: Timeline — vertical milestone axis

**Runs in parallel with Task 6.** Touches only `Timeline.tsx`; reads `svg/` but must not write to it.

**Files:**

- Modify: `apps/marketing/src/components/sections/Timeline.tsx`

**Interfaces:**

- Consumes: `<Axis>` from `@/components/svg/Axis`, `units` from `@/components/svg/grid`.
- Produces: nothing other tasks depend on.

**Spec:** §6. Note that the accent terminal is **content this design introduces** — it is not on the page today. Approved during brainstorming.

- [ ] **Step 1: Make `status` mean something**

All 8 entries in `MILESTONES` are `status: 'complete'`, so the field currently renders nothing distinguishable. Widen the type so it can express the distinction that makes it worth keeping, and which `Axis` already renders via `filled`:

```tsx
const MILESTONES: { title: string; description: string; status: 'complete' | 'in-progress' }[] = [
```

Leave all 8 as `'complete'` — that is accurate today. The point is that milestone 9 can now be added as `'in-progress'` and render as a hollow node with no further change.

- [ ] **Step 2: Replace the gradient rule with the axis**

Remove the `absolute left-5` gradient `<div>` entirely — `bg-gradient-to-b from-violet-glow/50 via-blue-glow/50 to-transparent` is decoration, and §4.3 does not permit it. Remove the dot-in-halo markup (the two nested `rounded-full` divs) from each milestone.

Replace the `<div className="relative mt-16">` block:

```tsx
        <div className="mt-16 flex gap-8">
          <Axis
            orientation="vertical"
            length={units(98)}
            count={MILESTONES.length}
            filled={MILESTONES.map((m) => m.status === 'complete')}
            terminal
            thickness={units(6)}
            className="shrink-0 text-border"
          />

          {/* Height pinned to the axis length so milestones line up with
              nodes rather than with the taller canvas the terminal adds. */}
          <div
            className="flex flex-1 flex-col justify-between"
            style={{ height: units(98) }}
          >
            {MILESTONES.map((milestone, i) => (
              <motion.div
                key={milestone.title}
                initial={{ opacity: 0, x: -12 }}
                animate={isInView ? { opacity: 1, x: 0 } : undefined}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="mt-6 pl-8 font-mono text-xs uppercase tracking-widest text-violet-glow">
          {MILESTONES.filter((m) => m.status === 'complete').length} shipped · you are here
        </p>
```

**Known limitation, deliberately not fixed here.** Those `motion.div` text entries sit _outside_ the `Diagram`, so the `[data-x4-diagram]` CSS rule does not cover them — reduced-motion visitors still get the opacity/x fade on the milestone text. This is the animation the component already has, carried over verbatim; §10 scopes out retrofitting the existing site's unconditional animations (`shimmer`, `animate-pulse`, the marquee), and this is the same class of gap. The SVG axis itself is fully covered. Do not expand scope to fix it in this task — it is recorded in the Follow-ups section.

Add the imports: `import { Axis } from '@/components/svg/Axis';` and `import { units } from '@/components/svg/grid';`

The `cn` import may now be unused — if so, remove it, since lint will flag it.

- [ ] **Step 3: Verify at both breakpoints**

Navigate Playwright MCP to `http://localhost:3011/about`.

- Screenshot at **1440**: hairline vertical axis, 8 filled nodes, type flush-left off each, violet terminal at the bottom with the "shipped · you are here" line.
- Resize to **375**, screenshot, and confirm the axis and text do not collide and nothing overflows horizontally.
- Confirm the gradient is gone: `grep -n 'gradient\|rounded-full' apps/marketing/src/components/sections/Timeline.tsx` returns nothing.

- [ ] **Step 4: Verify reduced motion**

Apply `emulateMedia({ reducedMotion: 'reduce' })`, reload `/about`, screenshot.
Expected: axis fully drawn on first paint, no animation.

- [ ] **Step 5: Verify the repo gates**

Run: `bun turbo type-check --filter=@x4/marketing && bun turbo lint --filter=@x4/marketing`
Expected: exit 0 for both.

- [ ] **Step 6: Commit**

```bash
git add apps/marketing/src/components/sections/Timeline.tsx
git commit -m "feat(marketing): rebuild Timeline as a vertical milestone axis

The status field was dead — all eight milestones were complete, so it
rendered nothing distinguishable. It now drives filled versus hollow
nodes, which makes it the extension point for the first milestone that
is still in flight.

Replaces the decorative violet-to-blue gradient rule with a hairline
axis, and adds an accented terminal so the sequence reads as ending at
the present rather than trailing off."
```

---

### Task 8: Review against the quality bar, remove the lab

**Files:**

- Delete: `apps/marketing/src/app/svg-lab/page.tsx`
- Modify: whichever surface fails review, if any

- [ ] **Step 1: Apply the §3 quality bar to both surfaces**

For `/kickstart` and `/about`, answer in writing: **if the diagram were deleted, what information would be lost?**

- KickstartFlow should answer: the steps are a _sequence_, they are _equivalent_ to one another, and they _terminate_ at a command you run.
- Timeline should answer: the milestones are _ordered_, each is _complete or not_, and the sequence _reaches the present_.

If either answers "nothing — it just looks nicer," it failed §3. Rework it before continuing rather than shipping animated decoration.

- [ ] **Step 2: Audit the constraints**

```bash
grep -rn '#[0-9a-fA-F]\{6\}' apps/marketing/src/components/svg apps/marketing/src/components/sections/KickstartFlow.tsx apps/marketing/src/components/sections/Timeline.tsx
grep -rn 'rounded\|linecap="round"\|strokeLinecap' apps/marketing/src/components/svg
```

Expected: no hex literals anywhere; the only `strokeLinecap` is the `'butt'` in `grid.ts`. Any `rounded-*` inside `svg/` is a §4.2 failure.

- [ ] **Step 3: Confirm no dependency drifted in**

```bash
git diff main --stat -- apps/marketing/package.json bun.lock
```

Expected: the only `package.json` change is the `"test"` script from Task 1; **`bun.lock` must be untouched**. Any lockfile change means a dependency was added, violating the global constraint.

- [ ] **Step 4: Wire the marketing tests into CI**

Found during Task 1's review. `.github/workflows/ci.yml` does not run `bun turbo test` — it enumerates one test job per workspace (`test-shared`, `test-database`, `test-auth`, `test-api`, `test-create-x4`) and `ci-passed` gates on exactly that list. Marketing is in none of them. `type-check` and `lint` do cover marketing, so types and lint are gated; **tests are not.**

That matters more here than it normally would: the plan deliberately forgoes React component tests, which concentrates every automated check for the entire SVG layer into `grid.test.ts`. Task 1 made that suite runnable and thereby created the appearance of a gate that does not exist. A later change to `STROKE_ATTRS` or `snap()` would break four downstream consumers, fail locally, and merge green.

Add a `test-marketing` job. Place it after the `test-create-x4` block, mirroring `test-shared` (no database, so no `neon-branch` dependency):

```yaml
# ─── Test: apps/marketing ──────────────────────────────────────────
test-marketing:
  name: 'Test: marketing'
  runs-on: ubuntu-latest
  needs: changes
  if: needs.changes.outputs.marketing == 'true'
  steps:
    - uses: actions/checkout@v6

    - uses: oven-sh/setup-bun@v2
      with:
        bun-version: '1.3.8'

    - uses: actions/cache@v5
      with:
        path: ~/.bun/install/cache
        key: bun-${{ runner.os }}-${{ hashFiles('bun.lock') }}
        restore-keys: bun-${{ runner.os }}-

    - name: Install dependencies
      run: bun install --frozen-lockfile

    - name: Run marketing tests
      run: bun test --cwd apps/marketing
```

`changes.outputs.marketing` already exists — no new paths-filter entry is needed.

Then add the job to the `ci-passed` gate, in **both** places it must appear. The `needs` list:

```yaml
needs:
  [
    quality,
    migration-check,
    test-shared,
    test-database,
    test-auth,
    test-api,
    test-create-x4,
    test-marketing,
  ]
```

And the failure check body, alongside the existing lines:

```bash
                "${{ needs.test-marketing.result }}" == "failure" || \
```

Adding it to `needs` without the check body is the silent-failure mode: the gate would wait on the job and then ignore its result.

- [ ] **Step 5: Delete the lab route**

```bash
rm apps/marketing/src/app/svg-lab/page.tsx
```

It existed to verify primitives before surfaces consumed them. Both surfaces now do that job, and an unlinked route that ships to production is dead weight.

- [ ] **Step 6: Full-repo gates**

Run: `bun turbo type-check && bun turbo lint && bun turbo test`
Expected: exit 0 for all three. `bun turbo test` must show the marketing `grid.test.ts` suite passing rather than the old `echo` placeholder.

- [ ] **Step 7: Final visual pass**

With the dev server running, screenshot `/kickstart` and `/about` at **1440** and **375**, plus one reduced-motion pass each. Confirm `/svg-lab` now 404s.

- [ ] **Step 8: Commit**

```bash
git add -A apps/marketing
git commit -m "chore(marketing): remove SVG lab route after pilot verification

The lab existed so primitives could be verified before any surface
consumed them. KickstartFlow and Timeline now serve that purpose, and an
unlinked route has no reason to ship."
```

---

## Follow-ups (not this plan)

- **Hero port** (§7). `Axis` already supports a variable station count; the remaining requirement is an input feed at station 1. Needs its own plan once Task 8 confirms the primitives held.
- **Token reskin** (§10). The deliberate seam between square SVG and `0.75rem` cards is the evidence for or against it. Decide after looking at the shipped pilots, not before.
- **Reduced motion on the existing site.** `shimmer`, `animate-pulse`, and the marquee `scroll` keyframes remain unconditional. Out of scope here, but now inconsistent with the new layer.
- **Reduced motion for HTML-level motion in the pilot surfaces.** The `[data-x4-diagram]` rule covers SVG inside a `Diagram` only. The `motion.div` text entries in `Timeline` (and the section fades in both surfaces) sit outside it and still animate for reduced-motion visitors. Carried over verbatim from the existing components rather than introduced, so it belongs with the item above — but note it is now the _only_ uncovered motion on the two pages this plan touches, which makes it cheaper to finish than it looks.
- **CLAUDE.md correction.** It lists `@testing-library/react` as the component test pattern for `apps/web`. It is not installed anywhere in the monorepo.
