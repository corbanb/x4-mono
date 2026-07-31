import { Axis } from '@/components/svg/Axis';
import { axisMetrics, units } from '@/components/svg/grid';

interface FlowStep {
  number: number;
  name: string;
  description: string;
}

/**
 * The six steps carried a `color` field — one of six hardcoded hexes, assigned
 * by array position. Position is already carried by the numeral and by where the
 * station sits on the axis, so the colour was six values encoding one thing that
 * was said twice already. It is gone: every station renders in the same grey,
 * which is the claim the diagram is making (the steps are equivalent) rather
 * than a decoration layered over it.
 */
const FLOW_STEPS: FlowStep[] = [
  { number: 1, name: 'Vision', description: "Describe what you're building" },
  { number: 2, name: 'Brainstorm', description: 'AI expands your idea into features' },
  { number: 3, name: 'Prioritize', description: 'Rank and scope the feature list' },
  { number: 4, name: 'UI Design', description: 'Sketch screens and user flows' },
  { number: 5, name: 'Batch PRDs', description: 'Generate product requirements docs' },
  { number: 6, name: 'Summary', description: 'Review the full plan before building' },
];

interface PlanningMode {
  name: string;
  description: string;
  highlighted: boolean;
}

const PLANNING_MODES: PlanningMode[] = [
  {
    name: 'Kickstart',
    description:
      'Full guided session — vision, brainstorm, UI design, batch PRDs. Best for new projects.',
    highlighted: true,
  },
  {
    name: 'Incremental',
    description:
      'Capture ideas with /x4:idea, triage with /x4:plan-backlog. Best for ongoing work.',
    highlighted: false,
  },
  {
    name: 'Discovery',
    description: "Use /x4:gaps + /x4:dream to find dead ends and explore what's next.",
    highlighted: false,
  },
];

/**
 * Axis geometry, resolved once so the axis and its label row cannot drift.
 *
 * `length` is a TARGET — Axis snaps the pitch between stations and rebuilds the
 * span from it, so the drawn axis is rarely the number passed here. Nothing
 * below is sized against these constants; everything reads the METRICS the same
 * function hands the Axis.
 *
 * units(120) across six stations is a pitch of 192 exactly, so no adjustment
 * happens at all — chosen for that reason, not assumed.
 */
const AXIS_LENGTH = units(120);
const AXIS_LENGTH_MOBILE = units(70);

/**
 * units(8) rather than the units(6) default, so the ticks come out units(2)
 * long — the length marks.tsx itself defaults to. At units(6) the leftover room
 * makes them units(1), and a 8px tick under a 200px label column reads as a
 * speck rather than as the mark that registers the label to the axis. Same
 * value in both orientations so tick weight does not change at the breakpoint.
 */
const AXIS_THICKNESS = units(8);

/** Three greys, no accent: the axis is structure, the terminal supplies the one accent. */
const AXIS_COLOR = 'text-muted-foreground';

/**
 * Space between the vertical axis box and the label column.
 *
 * The box extends units(4) past the spine while the ticks stop units(3) past it,
 * so this is one unit narrower than the clearance it buys: at units(1) the type
 * starts units(2) after the tick ends.
 *
 * This was `gap-4` — units(2), so type units(3) clear of the tick — while
 * Timeline used units(1) for the same orientation, the same thickness and the
 * same units(2) tick. Two distances for one relationship, and only one of them
 * argued. Compared side by side at 375: at units(2) the tick reads as a floating
 * dash between two rails, at units(1) it reads as the mark the line of type
 * hangs off, which is the one thing this label has to do. Timeline's value, and
 * Timeline's reasoning, applied here.
 *
 * Written as a unit multiple rather than a `gap-2` class for the same reason
 * Timeline writes it that way: the number is one unit inside a clearance the
 * Axis derives from `thickness`, so a thickness change has to move it, and a
 * Tailwind spacing class would silently stay put.
 */
const LABEL_GAP = units(1);

const METRICS = axisMetrics(AXIS_LENGTH, FLOW_STEPS.length, true);
const METRICS_MOBILE = axisMetrics(AXIS_LENGTH_MOBILE, FLOW_STEPS.length, true);

/**
 * One station pitch as a fraction of the canvas — the width of a label column.
 *
 * Labels are laid out as a column grid registered to the stations: each label's
 * LEFT edge sits on its station, one pitch wide. Centring the box on the station
 * instead (`-translate-x-1/2`) is what the first cut did, and it fails the thing
 * this surface is judged on: the text inside is left-aligned, so a centred box
 * puts the words half a column to the left of the tick they name.
 */
const LABEL_COLUMN = METRICS.pitch / METRICS.extent;

/**
 * Room reserved to the right of the axis so the LAST label column still fits.
 *
 * The last station sits at 96.8% of the canvas (not 100% — the canvas grows past
 * it to make room for the terminal), so a full-width axis leaves 3.2% for a
 * label that needs 19.2%. Reserving trailing padding shortens the axis instead,
 * which costs nothing visually and keeps all six labels identical — the
 * alternative, special-casing the outer ones to right-align, breaks the rule
 * that the label's leading edge is its station.
 *
 * Derived rather than tuned: with the row reserving fraction r of the container,
 * the axis is (1 - r) of it, so the last label ends at (last + column)(1 - r),
 * and requiring that to be at most 1 gives r >= overhang / (1 + overhang).
 * Percentage padding resolves against the container width, so this holds at
 * every viewport without a media query.
 */
const LABEL_OVERHANG = Math.max(0, METRICS.fractions[FLOW_STEPS.length - 1] + LABEL_COLUMN - 1);
const LABEL_TRAIL = LABEL_OVERHANG / (1 + LABEL_OVERHANG);

/**
 * A 0..1 fraction as a CSS percentage, at fixed precision.
 *
 * Fixed rather than raw because binary floating point makes `0.008 * 100`
 * stringify as 0.8000000000000001, and a style attribute full of those reads as
 * a bug even though it renders identically.
 */
function percent(fraction: number): string {
  return `${(fraction * 100).toFixed(4)}%`;
}

/** Grid-registered numeral: two digits, so the column of numbers rules straight. */
function numeral(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * The six planning steps as stations on one process axis.
 *
 * A server component on purpose. All of the motion belongs to the Axis, which
 * draws itself on enter and pins to its final state under
 * `prefers-reduced-motion` via the one CSS rule in globals.css. The fade-up
 * `motion.div` wrappers this section used to carry sat OUTSIDE that rule — with
 * motion's default reducedMotion of "never" they animated for reduced-motion
 * visitors regardless — and they were animating the same content the axis
 * already introduces. Removing them makes the whole section hook-free, which is
 * also what lets `axisMetrics` be called here at module scope: it lives in
 * grid.ts rather than Axis.tsx precisely so a server component can reach it.
 */
export function KickstartFlow() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Horizontal at md and up. The trailing reserve belongs to this branch
            only — the vertical axis below has no such constraint. */}
        <div className="hidden md:block" style={{ paddingRight: percent(LABEL_TRAIL) }}>
          <Axis
            orientation="horizontal"
            length={AXIS_LENGTH}
            count={FLOW_STEPS.length}
            terminal
            thickness={AXIS_THICKNESS}
            className={AXIS_COLOR}
          />
          {/* Positioned from METRICS.fractions, which are over the canvas the
              Axis actually drew. A justify-between row or an even grid is wrong
              at both ends, and wrong by a different amount depending on
              `terminal` — the last station moves from 99.2% to 96.8% when it is
              set. The negative top margin pulls the row up through the dead
              canvas below the spine (the axis is centred in its box and the
              ticks run upward), so the label sits close under its station. */}
          <div className="relative -mt-4 h-20 lg:h-28">
            {FLOW_STEPS.map((step, i) => (
              <div
                key={step.number}
                className="absolute top-0 pr-6"
                style={{ left: percent(METRICS.fractions[i]), width: percent(LABEL_COLUMN) }}
              >
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {numeral(step.number)}
                </p>
                <p className="mt-1 font-semibold text-foreground">{step.name}</p>
                {/* Below lg a column is under 130px wide and the description
                    shreds into five lines. The step is still named and still
                    numbered; the sentence is the part that can wait for room. */}
                <p className="mt-1 hidden text-xs leading-relaxed text-muted-foreground lg:block">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Below md the axis ROTATES rather than falling back to a horizontal
            scroll trap. Same primitive, one prop. */}
        <div className="flex md:hidden" style={{ gap: LABEL_GAP }}>
          {/* A vertical Axis is centred in its box, so half its width is empty
              canvas to the left of the line. Pulling back by units(4) puts the
              SPINE on the content edge, which is the line the /x4:work rule and
              the cells below already sit on — so the axis, its terminal and the
              command it terminates at all share one left rail.
              The empty canvas then starts 8px left of the viewport origin.
              That is overflow toward the start edge, which is unreachable in a
              left-to-right document and adds nothing to scrollWidth; the 375
              check confirms it. Nothing drawn is out there — the spine is the
              leftmost ink. */}
          <div className="-ml-8 shrink-0">
            <Axis
              orientation="vertical"
              length={AXIS_LENGTH_MOBILE}
              count={FLOW_STEPS.length}
              terminal
              thickness={AXIS_THICKNESS}
              className={AXIS_COLOR}
            />
          </div>
          {/* Height is the extent the Axis authored, so the fractions map onto
              it 1:1 — a vertical Axis renders at its authored size rather than
              stretching. */}
          <div className="relative flex-1" style={{ height: METRICS_MOBILE.extent }}>
            {FLOW_STEPS.map((step, i) => (
              <div
                key={step.number}
                className="absolute -mt-2 pr-2"
                style={{ top: percent(METRICS_MOBILE.fractions[i]) }}
              >
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {numeral(step.number)}
                </p>
                <p className="mt-1 font-semibold text-foreground">{step.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Where the axis was heading. The violet rule continues the accent the
            terminal ends on — the one coloured element on the page besides the
            Kickstart cell below. */}
        <div className="mt-10 flex">
          <div className="inline-flex flex-col items-start border-l-2 border-violet-glow bg-card px-6 py-4 font-mono text-sm sm:flex-row sm:items-center sm:gap-4">
            <span className="text-violet-glow">/x4:work</span>
            <span className="mt-1 text-muted-foreground sm:mt-0">
              ← agents build all features, in order, automatically
            </span>
          </div>
        </div>

        <div className="mt-16">
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Three ways to plan
          </h3>

          <div className="grid gap-4 sm:grid-cols-3">
            {PLANNING_MODES.map((mode) => (
              <div
                key={mode.name}
                className={`border p-6 transition-colors ${
                  mode.highlighted ? 'border-violet-glow/50' : 'border-border'
                }`}
              >
                <p
                  className={`font-semibold ${
                    mode.highlighted ? 'text-violet-glow' : 'text-foreground'
                  }`}
                >
                  {mode.name}
                  {mode.highlighted && (
                    <span className="ml-2 border border-violet-glow/30 px-2 py-0.5 font-mono text-xs uppercase tracking-widest text-violet-glow">
                      this page
                    </span>
                  )}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{mode.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default KickstartFlow;
