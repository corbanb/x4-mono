import { Axis } from '@/components/svg/Axis';
import { axisMetrics, axisThickness, units } from '@/components/svg/grid';

interface Milestone {
  title: string;
  description: string;
  /**
   * Shipped, or still in flight.
   *
   * This field used to be inert: every entry was 'complete', and the markup drew
   * the same marker either way, so it encoded a distinction the page never made.
   * It now drives `filled` on the axis — solid station for shipped, hollow for
   * in flight — which is the whole reason the union has two members. All eight
   * below are accurate as 'complete'; the ninth can be added as 'in-progress'
   * and needs no other change.
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
 * TARGET axis length. The Axis snaps the PITCH between stations and rebuilds the
 * span from it, so this is rarely the drawn dimension — every number below is
 * read back off `axisMetrics`, never off this constant.
 *
 * units(98) across eight stations is a pitch of 112 exactly, so nothing is
 * adjusted at all. Chosen for that, and because 112 CSS px is the smallest pitch
 * that still clears the tallest label block at 375, where a description runs to
 * three lines. A vertical axis renders at its authored size, so that pitch is the
 * same at every viewport and the narrowest one is the only place it can fail.
 */
const AXIS_LENGTH = units(98);

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
 * Half a line box, the one optical correction here: `top` places a label's box
 * edge on its station, and what should sit on the station is the first line of
 * type. units(1) is the only grid-legal pull in range.
 */
const LABEL_LIFT = units(1);

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
  const metrics = axisMetrics(AXIS_LENGTH, milestones.length, true);
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
              length={AXIS_LENGTH}
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
                <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Where the axis ends up. The accented terminal is drawn past the last
            station; this is the sentence it makes. In normal flow rather than
            registered to the mark's own fraction: the mark sits units(2) past the
            final station, which is inside the final label block, so anchoring the
            type there would drop it on top of the milestone it follows.
            Left edge on the label column, from the same two constants. */}
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
