# Swiss SVG Design Layer — Design Spec

**Date:** 2026-07-30
**Status:** Approved (design), not yet planned
**Scope:** `apps/marketing` only
**Prior art:** [2026-04-03-marketing-site-reimagine-design.md](./2026-04-03-marketing-site-reimagine-design.md) — produced the site this layer sits on top of. This spec does not retract any decision in it.

---

## 1. Context

The marketing site is 7 pages, 13 components, ~2,250 lines. Its visual language is dark
glassmorphism: violet/blue/cyan gradients, `box-shadow` glow, backdrop blur, noise overlay.
27 call sites across 13 files use those decorative utilities (`glass`, `glow`, `gradient-text`,
`gradient-border`, `shimmer`, `dot-grid`, `noise`, `GlowCard`).

**There is no hand-authored SVG anywhere in the app.** Every visual is a lucide icon, a CSS
gradient, or a box-shadow. So this is not extending an SVG design language — it is creating one.

The content is inherently diagrammable and currently isn't diagrammed. `KickstartFlow`,
`Timeline`, `TechStackBento`, and `AgentPluginShowcase` are all sequences, maps, or hierarchies
rendered as rounded cards wrapping text. Two concrete symptoms:

- `KickstartFlow` renders 6 process steps with 6 hardcoded hexes (`#7c3aed`, `#3b82f6`,
  `#06b6d4`, `#4ade80`, `#f59e0b`, `#8b5cf6`). The colors carry no information — they are a
  rainbow assigned by array position.
- `Timeline` renders 8 milestones that are all `status: 'complete'`, on a decorative
  violet→blue gradient rule. The `status` field renders nothing distinguishable; it is dead.

## 2. Core design decisions

Each was an explicit fork during brainstorming. Recorded with the rejected alternative so
the reasoning survives.

| #   | Decision                                                                                                                       | Rejected alternative                                                                                                                                                                                                                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **New SVG layer alongside existing tokens.** Keep dark glassmorphism base; add a Swiss SVG system proven on 2 surfaces first.  | Full token-level reskin of all 7 pages. Rejected: it's a migration, not exploration, and fights the grain of the last 4 commits (all cleanup/removal).                                                                                                                                                                                                          |
| 2   | **Pilot on `KickstartFlow` + `Timeline`, then port to hero.**                                                                  | Hero first. Rejected: hero is the front door; a bad first pass on an unproven system wrecks it. `/kickstart` and `/about` are the honest, low-blast-radius test.                                                                                                                                                                                                |
| 3   | **Monochrome + one accent that points.** Greyscale hairlines; violet marks _only_ state — the active/terminal/changed element. | (a) Inherit the tri-color gradient — rejected, gradient-on-line-art is the "animated squiggle" failure mode. (b) Semantic multi-accent (violet=agent, emerald=shipped, amber=blocked) — rejected as premature; it's decision 3 plus a rule we can add later if diagrams actually need state distinction.                                                        |
| 4   | **Scroll-triggered on enter, plays once, stays drawn.** `motion`'s `whileInView`.                                              | (a) Load-triggered — rejected, animation finishes before the user scrolls to it. (b) Scroll-scrubbed via `useScroll` — rejected as a maintenance tax on a marketing site: jank risk on mobile, and its correct state is a function of scroll offset, which makes both verification and reduced-motion much harder. May be added deliberately to the hero later. |
| 5   | **Dark-first stays.** Swiss does not imply light mode. High contrast, monochrome, one accent works in dark.                    | Light or inverted mode. Rejected: dark-first is a deliberate dev-tool positioning choice.                                                                                                                                                                                                                                                                       |
| 6   | **No new dependencies.** `motion` 12.34 is already installed; SVG animation is `motion` + CSS. Type stays `geist`.             | GSAP, Lottie, a Helvetica-clone webfont. Rejected: cost with no payoff; `geist` is a defensible neutral grotesque.                                                                                                                                                                                                                                              |

## 3. Quality bar (pass/fail)

**The SVG must carry the information.** If the diagram can be deleted and nothing is lost but
decoration, it failed and gets reworked.

Six grey stations terminating in one violet mark say something that six rainbow cards do not:
_these are steps, they are equivalent, and this is where they end up._ That difference is the
entire deliverable. Animated line art layered on top of the same cards is the failure mode this
bar exists to catch.

## 4. The primitive layer

New directory: `apps/marketing/src/components/svg/`. Marketing-only — nothing moves into
`packages/shared` until the system is proven on real surfaces.

### 4.1 Grid

- Base unit `UNIT = 8`. Every coordinate and viewBox dimension is a multiple of 8.
- `snap(n)` rounds to the nearest unit and is used at every authoring site. Off-grid coordinates
  are a review failure, not a style preference.
- Diagrams are authored at a fixed viewBox and scaled with CSS
  (`width: 100%; height: auto`), so the grid is authored once and holds at every breakpoint.

### 4.2 Stroke

- **Exactly two weights:** `1` (hairline — structure, rules, axes) and `1.5` (primary path).
- `vector-effect="non-scaling-stroke"` on every stroked element, so hairlines stay hairlines
  when the viewBox scales.
- **`stroke-linecap="butt"`, `stroke-linejoin="miter"`, corner radius `0`.** This is the single
  biggest visual tell separating Swiss line art from generic friendly-startup illustration.
  Rounded caps are a review failure.

The surrounding HTML cards keep their `0.75rem` radius. The SVG layer being square creates a
deliberate visual seam, which is the evidence for or against the follow-up token reskin.

### 4.3 Color

- All strokes and fills are `currentColor`, driven by Tailwind text utilities. No hex literals
  in SVG markup — ever. The six hardcoded hexes in `KickstartFlow` are deleted.
- Three greys, by role: `border` (structure), `muted-foreground` (labels),
  `foreground` (emphasis).
- One accent (violet, existing `--color-violet-glow` token) applied **only** to the active,
  terminal, or changed element. If a diagram has no such element, it renders fully greyscale.

### 4.4 Text

- Labels stay in **HTML** wherever possible: selectable, accessible, no font-loading race,
  no duplicated type scale.
- SVG `<text>` only where a label must register to the grid (station numerals, axis ticks):
  10–11px, uppercase, `tracking-widest`, geist mono.
- Accepted cost: labels cannot hug geometry as tightly as they could if all type lived in the
  SVG. Worth it for accessibility and for keeping one type scale.

### 4.5 Files

| File           | Responsibility                                                                                                                                                 | Depends on               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `grid.ts`      | `UNIT`, stroke-width constants, `snap()`, viewBox helpers. Pure — no React, no JSX.                                                                            | nothing                  |
| `Diagram.tsx`  | Responsive `<svg>` wrapper. Owns the `useInView({ once: true })` trigger **and** the `prefers-reduced-motion` check; publishes both via context.               | `grid.ts`                |
| `DrawPath.tsx` | Animated path primitive. `pathLength="1"` normalization so dasharray math is scale-independent; animates `strokeDashoffset` 1 → 0. Consumes `Diagram` context. | `grid.ts`, `Diagram.tsx` |
| `marks.tsx`    | Node vocabulary: `Node`, `Junction`, `Terminal`, `Tick`. Grid-registered, square, hairline.                                                                    | `grid.ts`                |

**Motion characteristics:** draw ~0.8s, stagger 0.06s between elements, linear-ish easing.
**No spring, no bounce, no overshoot** — Swiss motion does not oscillate.

### 4.6 Reduced motion

`prefers-reduced-motion: reduce` renders the **final drawn state instantly**, no transition:
`strokeDashoffset: 0` on first paint.

Checked in exactly one place (`Diagram.tsx`) and inherited by every primitive, so a surface
cannot forget it. The existing site has zero reduced-motion handling — `shimmer`, `animate-pulse`,
and the marquee `scroll` keyframes are all unconditional. Fixing those is out of scope, but the
new layer must not add to the problem.

## 5. Pilot surface: `KickstartFlow` (`/kickstart`)

**Current:** 6 rounded cards in a `md:overflow-x-auto` row, each with a colored numeral badge in
one of 6 hardcoded hexes; below, a `/x4:work` command chip and a 3-cell "Three ways to plan" grid.

**Redesigned as a plotted process axis:**

- One hairline baseline spanning the grid width, with 6 stations snapped to it.
- Each station: a vertical tick + grid-registered numeral (SVG) + name and description (HTML,
  below the axis).
- All 6 stations render greyscale. The rainbow is deleted.
- The axis **terminates** at `/x4:work`, marked in accent — the one violet element. Reading:
  _six planning steps, and this is what you actually run._
- "Three ways to plan" keeps Kickstart as the accented cell, other two greyscale;
  `rounded-2xl` cards become hairline-ruled grid cells.

**Animation:** on enter, the baseline draws left→right; each station's tick fires as the draw
front passes it. Stagger is derived from **x-position, not array index** — the animation follows
the geometry, so reordering or adding a station cannot desync it.

**Mobile:** the current `md:overflow-x-auto` is a horizontal-scroll shrug. Instead the axis
**rotates** — vertical baseline below `md`, identical primitives, draw runs top→bottom. Same
component, one orientation prop, no scroll trap.

## 6. Pilot surface: `Timeline` (`/about`)

**Current:** 8 milestones against an `absolute left-5` violet→blue gradient rule, each with a
dot-in-halo marker. All 8 are `status: 'complete'`.

**Redesigned as a vertical milestone axis:**

- Hairline vertical axis, flush-left. The decorative gradient is deleted.
- The dot-in-halo becomes a **tick**: a short horizontal hairline meeting the axis, with type
  set flush-left off it.
- **`status` earns its keep:** filled tick = complete, hollow tick = not. The field currently
  renders nothing distinguishable; this makes it the natural extension point for milestone 9.
- **Accent terminal at the bottom of the axis** — "8 shipped, you are here."

**Animation:** axis draws top→bottom on enter; ticks fire in sequence as the draw front passes.

**Note — invented content.** The "you are here" terminal is not currently on the page; it is
content this design introduces. Approved during brainstorming. The rejected alternative was zero
accent on Timeline (pure greyscale, type carries all hierarchy) — arguably _more_ Swiss, but then
the pilot never exercises the accent rule before it is ported to the hero, which is the point of
piloting.

## 7. Hero (later phase — specced, not built)

Not built in this pass. Recorded so the primitives are designed to reach it.

The hero pipeline — describe → plan → PRDs → agents → ship — becomes the horizontal axis
primitive from §5, with the typed phrase feeding station 1 and the accent marking the shipped
terminal. The current fake input and green plan card are replaced by a diagram carrying the same
information.

Requirement this places on §4: the horizontal axis primitive must support a variable station
count and an input feed at station 1 without a rewrite.

## 8. Build order

The serial/parallel split matters — this is the instruction for any agent fan-out.

1. **Serial — primitives.** The four files in §4.5, built and _rendered in a browser_ before
   anything consumes them. The frozen API is the hand-off contract.
2. **Parallel — two agents, one per surface.** Agent A: `KickstartFlow`. Agent B: `Timeline`.
   Zero file overlap; both only _read_ `svg/`. This is the safe fan-out.
3. **Serial — review both against §3,** then port proven primitives to the hero.

**Do not parallelize step 3.** Four agents inventing four grids is the failure mode; the hero's
entire value is reusing what steps 1–2 proved.

## 9. Verification

Visual work that is never rendered is the failure mode. "It type-checks" verifies nothing about
a redesign.

**Environment constraint:** this sandbox blocks both `bun install` and port listening (EPERM).
Resolved during brainstorming: **the dev server runs with `dangerouslyDisableSandbox`**, then
Playwright MCP drives `localhost:3001`.

Per surface, before it is called done:

- Screenshot at **1440** and **375**.
- Reduced-motion pass — confirm the final drawn state renders with no animation.
- Confirm the `whileInView` trigger actually fires on scroll (not already-fired on load).

Repo gates: `bun turbo type-check` and `bun turbo lint` (the `eslint-plugin-boundaries` step)
clean.

The static post-draw final state is what makes screenshot verification deterministic — a
consequence of decision 4, and a reason it beats scroll-scrubbing.

## 10. Out of scope

- **The token reskin.** `glow`, `glass`, `noise`, and the gradient utilities stay. The seam this
  layer creates is the evidence for that follow-up, not part of it.
- The other 5 surfaces (`TechStackBento`, `AgentPluginShowcase`, `DiscoveryExplainer`,
  `CommandsTable`, `LiveDemoSection`).
- `packages/shared` — no promotion until the system is proven.
- Retrofitting reduced-motion onto existing `shimmer` / `pulse` / marquee animations.
- New dependencies. Light mode.
