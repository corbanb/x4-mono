import { Axis } from '@/components/svg/Axis';
import { axisMetrics, axisThickness, units } from '@/components/svg/grid';

interface Milestone {
  title: string;
  description: string;
  /**
   * Shipped, or still in flight.
   *
   * The markup this replaced did branch on this field — twice, choosing between
   * two marker colours — but the branch was statically unreachable: the type was
   * narrowed to the literal 'complete' at every entry, so the other arm could
   * not be reached without editing the data AND widening the type. Dead at the
   * type level rather than absent from the markup.
   *
   * Two things changed. The union now has a second member, so the distinction is
   * reachable; and it is re-encoded as FILL rather than colour — solid station
   * for shipped, hollow for in flight — which leaves the accent free for the one
   * element §4.3 reserves it for, the terminal. All eight below are accurate as
   * 'complete'; the ninth can be added as 'in-progress' and needs no other
   * change.
   */
  status: 'complete' | 'in-progress';
}

const MILESTONES: Milestone[] = [
  {
    title: 'Monorepo Foundation',
    description: 'Bun workspaces, Turborepo, TypeScript config, shared packages.',
    status: 'complete',
  },
  {
    title: 'Shared Types & Database',
    description: 'Zod schemas, Drizzle ORM, Neon Postgres, migrations, seed data.',
    status: 'complete',
  },
  {
    title: 'API Server',
    description: 'Hono + tRPC v11 with CRUD routers, middleware, and OpenAPI docs.',
    status: 'complete',
  },
  {
    title: 'Authentication',
    description: 'Better Auth with sessions, bearer tokens, RBAC, multi-platform clients.',
    status: 'complete',
  },
  {
    title: 'AI Integration',
    description: 'Vercel AI SDK, Claude provider, streaming, cost tracking.',
    status: 'complete',
  },
  {
    title: 'Multi-Platform Clients',
    description: 'Next.js 15 web, Expo mobile, Electron desktop — all sharing the API.',
    status: 'complete',
  },
  {
    title: 'CI/CD & Testing',
    description: 'GitHub Actions, Neon branching, 350+ tests, Playwright E2E.',
    status: 'complete',
  },
  {
    title: 'Documentation & DX',
    description: 'Fumadocs site, getting started guide, contributing docs, READMEs.',
    status: 'complete',
  },
];

/**
 * Distance between two stations, and the number the layout actually depends on.
 *
 * A vertical Axis renders at its authored size, so this is 112 CSS px at every
 * viewport, and the label blocks it has to clear are TALLEST at the narrowest
 * one: at 375 every description wraps to two lines, giving a 76px block and 36px
 * of clearance (measured). That is the binding constraint, so the pitch is the
 * constant and the axis length is derived from it — the other way round, a
 * fixed length silently shrinks the pitch as milestones are added, and the very
 * first thing this surface advertises is that a ninth milestone can be dropped
 * in. At a fixed units(98) that ninth entry would take the pitch to 96 and eat a
 * third of the clearance, with nothing failing.
 *
 * `length` is a TARGET — the Axis snaps the pitch and rebuilds the span from it —
 * so passing pitch x gaps is also the one input for which no adjustment happens:
 * 112 is already a grid multiple, so `snap` returns it unchanged at any count.
 * Every number downstream is still read back off `axisMetrics`, never off this.
 */
const STATION_PITCH = units(14);

/** Target length for `count` stations: the pitch, repeated across the gaps. */
function axisLength(count: number): number {
  return STATION_PITCH * Math.max(1, count - 1);
}

/**
 * units(8) rather than the units(6) default, matching KickstartFlow so tick
 * weight is identical across the two pilot surfaces. It leaves the ticks units(2)
 * long — the length marks.tsx itself defaults to — where units(6) leaves them
 * units(1), a speck against a two-line label.
 */
const AXIS_THICKNESS = units(8);

/**
 * Half the axis box: the empty canvas on the far side of the spine.
 *
 * An Axis centres its spine in its box, and a vertical one draws its ticks to the
 * RIGHT, so this much of the left edge is blank. Pulling the axis back by all of
 * it puts the SPINE on the content rail — flush left, which is what §6 asks for —
 * rather than the edge of an empty box.
 *
 * Derived from the exported `axisThickness` rather than written as a `-ml-8`
 * class, because the number is half of a value the Axis normalizes internally and
 * does not export: hard-coding it would let a thickness change slide the spine
 * off the rail with nothing failing. Exact at every viewport, since a vertical
 * Axis is not fluid and renders 1:1 with CSS px.
 */
const AXIS_CROSS = axisThickness(AXIS_THICKNESS) / 2;

/**
 * Space between the axis box and the label column.
 *
 * The box extends units(4) past the spine while the ticks stop units(3) past it,
 * so this is one unit narrower than the clearance it buys: at units(1) the type
 * starts units(2) after the tick ends. Judged from the artwork — at units(2) the
 * tick reads as a floating dash rather than as the mark the line of type hangs
 * off, which is the one thing §6 asks this label to do.
 */
const LABEL_GAP = units(1);

/** Structure grey. `border` is an 8% white and does not survive as a hairline. */
const AXIS_COLOR = 'text-muted-foreground';

/**
 * Half a title's line box: the one optical correction here.
 *
 * `top` places a label's box EDGE on its station, and what has to sit on the
 * station is the first line of type — so the block is pulled up by half the line
 * it leads with. That only lands exactly if the line box is an even number of
 * units, which is why the title carries `leading-8` rather than the 24px the
 * type scale would give it: half of 24 is 12, off the grid, and rounding to 8
 * leaves every title sitting four pixels below the tick it is registered to.
 * A 32px line box makes the correction units(2) and the registration exact.
 */
const LABEL_LIFT = units(2);

/**
 * A 0..1 fraction as a CSS percentage, at fixed precision — binary floating point
 * otherwise stringifies 0.008 * 100 as 0.8000000000000001.
 */
function percent(fraction: number): string {
  return `${(fraction * 100).toFixed(4)}%`;
}

interface TimelineProps {
  /**
   * Defaults to the project's own milestones, which is what the page renders.
   * A prop because the status-to-station mapping is the point of this surface and
   * a caller — or a test — has to be able to hand it a milestone that is not
   * finished. The axis geometry is derived from the list that arrives, so a
   * ninth entry lengthens the axis rather than falling off the end of it.
   */
  milestones?: Milestone[];
}

/**
 * Project milestones as stations on one vertical axis.
 *
 * A server component on purpose. All of the motion belongs to the Axis, which
 * draws itself on enter and pins to its final state under
 * `prefers-reduced-motion` via the one CSS rule in globals.css. The fade-up
 * wrappers this section used to carry sat OUTSIDE that rule — with motion's
 * default reducedMotion of "never" they animated for reduced-motion visitors
 * regardless — and they animated the same content the axis already introduces.
 * Dropping them makes the section hook-free, which is what lets `axisMetrics` be
 * called here at all: it lives in grid.ts rather than Axis.tsx precisely so a
 * server component can reach it.
 */
export function Timeline({ milestones = MILESTONES }: TimelineProps = {}) {
  const length = axisLength(milestones.length);
  const metrics = axisMetrics(length, milestones.length, true);
  const complete = milestones.map((m) => m.status === 'complete');
  const shipped = complete.filter(Boolean).length;

  return (
    <section className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        {/* Flush left, on the same rail as the spine below it. */}
        <h2 className="text-3xl font-bold sm:text-4xl">How we got here</h2>

        <div className="mt-16 flex" style={{ gap: LABEL_GAP }}>
          <div className="shrink-0" style={{ marginLeft: -AXIS_CROSS }}>
            <Axis
              orientation="vertical"
              length={length}
              count={milestones.length}
              filled={complete}
              terminal
              thickness={AXIS_THICKNESS}
              className={AXIS_COLOR}
            />
          </div>

          {/* Height is the extent the Axis authored, not the length it was asked
              for, so the fractions map onto it 1:1 — a vertical Axis renders at
              its authored size rather than stretching. Labels are placed from
              those fractions and never distributed evenly: stations start one pad
              in and the canvas grows past the last one for the terminal, so an
              even eight-row split is wrong at both ends. */}
          <div className="relative flex-1" style={{ height: metrics.extent }}>
            {milestones.map((milestone, i) => (
              <div
                key={milestone.title}
                className="absolute"
                style={{ top: percent(metrics.fractions[i]), marginTop: -LABEL_LIFT }}
              >
                <h3 className="font-semibold leading-8 text-foreground">{milestone.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Where the axis ends up. The accented terminal is drawn past the last
            station; this is the sentence it makes.

            In normal flow rather than registered to `metrics.terminalFraction`,
            which is exported and would place it exactly on the mark — the mark
            sits units(2) past the final station, which is INSIDE the final label
            block, so registering the type there would drop it on top of the
            milestone it follows. Left edge on the label column instead, from the
            same two constants the column is built from.

            The margin carries an assumption worth stating, because it is not
            derived: labels are absolutely positioned, so they do not size their
            container, and the last one overhangs the axis extent by however tall
            it is past its own station — measured at 8px at 1440 and 28px at 375.
            units(6) clears both. A THIRD line of description at 375 would take
            the overhang to 48 and leave no clearance at all, at which point this
            margin is not the fix: the label column needs a min-height, or the
            caption needs the terminal room a `terminalOffset` prop would give
            it. Nothing in the copy is near that today. */}
        <p
          className="mt-12 font-mono text-xs uppercase tracking-widest text-violet-glow"
          style={{ paddingLeft: AXIS_CROSS + LABEL_GAP }}
        >
          {shipped} shipped · you are here
        </p>
      </div>
    </section>
  );
}
