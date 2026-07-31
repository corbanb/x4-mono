'use client';

import { Fragment } from 'react';
import { Diagram } from './Diagram';
import { DrawPath } from './DrawPath';
import { Node, Terminal, Tick, type Orientation } from './marks';
import { snap, stationOffsets, units } from './grid';

interface AxisProps {
  orientation: Orientation;
  /**
   * Axis length in user-space px. Must be grid-snapped.
   *
   * Prefer a length where `length / (count - 1)` is itself a multiple of UNIT.
   * Station coordinates are snapped, so a spacing that is not on the grid does
   * not drift off it — it jitters instead: 480 across 8 stations snaps to a
   * 72/64/72/64 rhythm, a visible 12.5% unevenness. 448 across 8 gives 64 flat.
   */
  length: number;
  /** Number of stations, evenly spaced end to end. */
  count: number;
  /** Per-station fill. Index-aligned with stations; omitted entries read as hollow. */
  filled?: boolean[];
  /** Draw an accented terminal past the final station. */
  terminal?: boolean;
  /**
   * Cross-axis extent in user-space px — the room ticks and marks occupy.
   *
   * Must be an EVEN number of units: the axis sits at `thickness / 2`, and that
   * has to land on the 8-grid like every other station coordinate.
   *
   * This is also the knob that sizes the ticks — they grow to fill the room it
   * gives them (see below) — so units(6) is the practical minimum. units(4)
   * leaves a tick of length zero.
   */
  thickness?: number;
  className?: string;
}

const DRAW_DURATION = 0.8;
const ACCENT_CLASS = 'text-violet-glow';

/**
 * Station marks stand OFF the axis rather than on it.
 *
 * A Tick starts at the point it is given and runs perpendicular, so a tick and a
 * node sharing a station coordinate put the tick's first unit inside the node's
 * square — a stub in the middle of a hollow marker. Offsetting the tick by a
 * full unit leaves a 4px gap between the node's edge and the tick's near end,
 * which is idiomatic Swiss diagramming rather than a patched collision. The
 * alternative — moving the node out to the tick's far end — does not actually
 * separate them, since the node is centred on the point it is given and would
 * swallow the tick's last 4px instead.
 *
 * Half-unit offsets are not available: units(0.5) is 4, off the grid.
 *
 * Tick LENGTH is not a constant: it is whatever room `thickness` leaves after
 * the gap and one unit of margin. A fixed length would either clip against the
 * viewBox edge at the default thickness or force the default up and leave every
 * horizontal axis carrying dead canvas below its spine. Deriving it instead
 * makes `thickness` a real knob — raise it and the ticks grow with it — and
 * makes clipping impossible by construction rather than by a checked invariant.
 * It stays on the grid because `cross` is a grid multiple whenever `thickness`
 * is an even number of units, and subtracting two units keeps it one.
 */
const TICK_GAP = units(1);
const TICK_MARGIN = units(1);

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
  const tickLength = cross - TICK_GAP - TICK_MARGIN;

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

  /**
   * Snapped here rather than trusted from the caller: this is the authoring site
   * Tasks 6 and 7 inherit, and `length * t` is only on the grid when the caller
   * happened to pick a length divisible by count - 1. Endpoints are exact either
   * way, since PAD and length are both grid values.
   */
  const along = (t: number) => snap(PAD + length * t);
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
        const at = along(t);
        // Timing follows geometry: each station fires as the draw front reaches it.
        const delay = DRAW_DURATION * t;
        return (
          <Fragment key={i}>
            <Tick
              x={horizontal ? at : cross + TICK_GAP}
              y={horizontal ? cross - TICK_GAP : at}
              length={tickLength}
              orientation={orientation}
              delay={delay}
            />
            <Node
              x={horizontal ? at : cross}
              y={horizontal ? cross : at}
              filled={filled[i] ?? false}
              delay={delay}
            />
          </Fragment>
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
