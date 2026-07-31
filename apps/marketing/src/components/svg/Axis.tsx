'use client';

import { Fragment } from 'react';
import { Diagram } from './Diagram';
import { DrawPath } from './DrawPath';
import { Node, Terminal, Tick, type Orientation } from './marks';
import { axisMetrics, axisThickness, stationOffsets, units } from './grid';

interface AxisProps {
  orientation: Orientation;
  /**
   * TARGET axis length in user-space px, measured first station to last.
   *
   * Not an exact dimension. The component snaps the PITCH between stations to
   * the grid and repeats it, so every station lands on the grid AND the spacing
   * is exactly uniform — which snapping the length itself does not achieve,
   * since each station would then round independently and the rhythm would
   * stagger (576 across six stations gives 112/120/112/120/112).
   *
   * The consequence is that the axis is rarely exactly `length` wide, and it can
   * come out WIDER than requested as well as narrower:
   *
   *   length 576, count 6 -> pitch 112, span 560  (16 narrower)
   *   length 768, count 8 -> pitch 112, span 784  (16 WIDER)
   *
   * The deviation is at most half a pitch and is invisible to a viewer, who has
   * no reference to compare against; uneven spacing is not. A caller that needs
   * the real dimension — to size a sibling element, say — reads `span` or
   * `extent` from `axisMetrics(length, count, terminal)` in grid.ts, which is
   * the same function this component uses and reports the adjusted values.
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
   * Normalized to an even number of units, never below units(6), because the
   * axis sits at half of it and that has to land on the grid, and because the
   * ticks are sized from what is left over. units(7) becomes units(8); units(4)
   * becomes units(6). Out-of-range values are corrected, not honoured — an axis
   * cannot be asked into a state where its stations have no ticks or its spine
   * sits off the grid.
   *
   * Within the legal range it is a real knob: raise it and the ticks grow.
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
 * It stays on the grid, and stays at least one unit long, because `thickness` is
 * normalized to an even unit count of six or more before `cross` is taken from
 * it — subtracting two units from a grid multiple leaves a grid multiple.
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
 *
 * Along-axis geometry comes from `axisMetrics` in grid.ts rather than being
 * computed here, because a consumer has to position HTML labels against these
 * same stations and would otherwise be reproducing private math. Cross-axis
 * geometry stays local: nothing outside the diagram needs it.
 *
 * Both size inputs are NORMALIZED rather than trusted. Documenting a range and
 * hoping is what the first cut of this component did, and both downstream call
 * sites violated both rules immediately — one asking for a thickness that
 * produced zero-length ticks, i.e. stations with no marks at all.
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

  /**
   * Stations span the full `length`; the terminal sits beyond it and the canvas
   * grows to fit. Shrinking the station span to make room instead would leave a
   * consumer's evenly distributed labels no longer lining up with the stations
   * they name.
   */
  const { start, span, extent, stations, terminalAt } = axisMetrics(length, count, terminal);

  const box = axisThickness(thickness);
  const cross = box / 2;
  const tickLength = cross - TICK_GAP - TICK_MARGIN;

  /**
   * Drawn from the normalized `span`, not the raw `length`, so the far end lands
   * exactly on the last station. Trusting `length` here while snapping the
   * stations was an inconsistency that showed: at length 100 the spine stopped
   * at 108 while the final station snapped to 112, leaving the station that
   * terminates the axis four pixels past the line it terminates.
   */
  const spine = horizontal
    ? `M ${start} ${cross} L ${start + span} ${cross}`
    : `M ${cross} ${start} L ${cross} ${start + span}`;

  return (
    <Diagram
      width={horizontal ? extent : box}
      height={horizontal ? box : extent}
      fluid={horizontal}
      className={className}
    >
      <DrawPath d={spine} weight="hairline" duration={DRAW_DURATION} />

      {offsets.map((t, i) => {
        const at = stations[i];
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

      {terminalAt !== null && (
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
