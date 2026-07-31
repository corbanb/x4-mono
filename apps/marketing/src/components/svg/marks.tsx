'use client';

import { DrawPath } from './DrawPath';
import { units } from './grid';

export type Orientation = 'horizontal' | 'vertical';

/**
 * Seconds a single mark takes to draw. Short on purpose — a mark is punctuation
 * at a station, not a path in its own right. It should land while the spine's
 * draw front is still near it.
 */
export const MARK_DURATION = 0.25;

/**
 * Why every mark draws instead of rendering statically.
 *
 * Spec sections 5 and 6 both say a station's mark "fires as the draw front
 * passes it". A static mark cannot do that: it is painted at t=0, so all six
 * stations appear at once while the spine is still crossing the first of them,
 * which reads as broken rather than as a plot being drawn. The capability has to
 * live here, because the mark is the thing that has to wait.
 *
 * So each mark is a DrawPath with a `delay`. That is the only sanctioned motion
 * primitive and the only sanctioned kind of motion (animate `pathLength`) — an
 * opacity or transform reveal is not available, because the reduced-motion rule
 * in globals.css pins dash properties only and would not catch it.
 *
 * The consequence for fills: SVG paints `fill` regardless of `stroke-dasharray`,
 * so a filled square would show its fill at t=0 no matter how its outline draws.
 * Nothing in this file uses `fill` for that reason. A solid square is instead
 * produced by `fillPath` below — a stroked serpentine that inks the square in,
 * the way a pen plotter fills a region. It draws, so `filled` keeps the meaning
 * spec section 6 gives it (complete vs. pending) with no fade and no fill.
 */

/**
 * Vertical spacing between the runs of a serpentine fill, in user-space px.
 *
 * Half a pixel against a 1px hairline is a deliberate 2x overlap. At 1:1 pitch
 * the rendered stroke width equals the pitch only when --x4-stroke-scale is 1,
 * and two subpixel-offset antialiased runs composite to less than full coverage,
 * which shows as faint banding. At half-unit pitch minimum coverage is 2x the
 * scale multiplier, which is >= 2 at every breakpoint, so the square is solid
 * everywhere.
 */
const FILL_PITCH = 0.5;

/** Perimeter of a square centered on (x, y), drawn from the top-left clockwise. */
function squarePath(x: number, y: number, size: number): string {
  const half = size / 2;
  return `M ${x - half} ${y - half} H ${x + half} V ${y + half} H ${x - half} Z`;
}

/**
 * A single continuous serpentine that inks a square centered on (x, y).
 *
 * One subpath, so the draw is one unbroken pen stroke top to bottom rather than
 * a set of lines blinking on in sequence. Coordinates here are sub-unit by
 * necessity; the multiple-of-UNIT rule governs where a mark is anchored, not the
 * internal geometry that renders it (the same way `x - size / 2` is off-grid).
 *
 * Exported for its tests rather than for call sites: it is a pure
 * (x, y, size) => string, so its geometry — run count, pitch, span, and where
 * the last run lands — can be asserted directly from the emitted path data.
 */
export function fillPath(x: number, y: number, size: number): string {
  const half = size / 2;
  const left = x - half;
  const right = x + half;
  const runs = Math.round(size / FILL_PITCH) + 1;

  let d = `M ${left} ${y - half}`;
  for (let i = 0; i < runs; i += 1) {
    if (i > 0) d += ` V ${y - half + i * FILL_PITCH}`;
    d += ` H ${i % 2 === 0 ? right : left}`;
  }
  return d;
}

/** Timing every mark accepts, so a station can wait for the draw front. */
interface MarkTiming {
  /**
   * Seconds to wait before drawing. Derive from normalized position along the
   * axis (`stationOffsets`), never from array index — the animation follows the
   * geometry, so reordering a station cannot desync it and the math survives the
   * rotation to a vertical axis, where every station shares an x.
   */
  delay?: number;
  duration?: number;
}

interface TickProps extends MarkTiming {
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
 *
 * Drawn outward from the axis, so it grows away from the spine the draw front is
 * travelling along rather than arriving at it from nowhere.
 */
export function Tick({
  x,
  y,
  length = units(2),
  orientation,
  delay = 0,
  duration = MARK_DURATION,
  className,
}: TickProps) {
  const horizontalAxis = orientation === 'horizontal';
  const d = horizontalAxis ? `M ${x} ${y} V ${y - length}` : `M ${x} ${y} H ${x + length}`;

  return (
    <DrawPath d={d} weight="hairline" delay={delay} duration={duration} className={className} />
  );
}

interface NodeProps extends MarkTiming {
  x: number;
  y: number;
  /** Edge length in user-space px. Defaults to one grid unit. */
  size?: number;
  /** Solid reads as complete; hollow reads as pending. */
  filled?: boolean;
  className?: string;
}

/**
 * A station marker, centered on (x, y). Square with zero radius — the shape is
 * doing the same job a circle would, and circles are not in this vocabulary.
 *
 * The solid variant is the outline plus the serpentine fill, both on the same
 * clock, so the square inks in as its edge is drawn.
 *
 * A solid node and a hollow one are exactly the same size because the solid one
 * always renders the outline too, and the outline is what sets the bounds. The
 * serpentine alone would be narrower: its runs terminate flush at the left and
 * right edges with butt caps, so it spans exactly `size` horizontally, while the
 * outline's stroke overhangs the perimeter by half a hairline on every side.
 * Vertically the two agree — the serpentine's first and last runs overhang by
 * that same half hairline, which is why the fill reaches the outline's top and
 * bottom edges rather than stopping short of them.
 */
export function Node({
  x,
  y,
  size = units(1),
  filled = false,
  delay = 0,
  duration = MARK_DURATION,
  className,
}: NodeProps) {
  return (
    <>
      <DrawPath
        d={squarePath(x, y, size)}
        weight="hairline"
        delay={delay}
        duration={duration}
        className={className}
      />
      {filled && (
        <DrawPath
          d={fillPath(x, y, size)}
          weight="hairline"
          delay={delay}
          duration={duration}
          className={className}
        />
      )}
    </>
  );
}

interface TerminalProps extends MarkTiming {
  x: number;
  y: number;
  /** Edge length in user-space px. Defaults to one and a half grid units. */
  size?: number;
  className?: string;
}

/**
 * The end of an axis. Always solid and always the accented element, so it is the
 * one thing the eye lands on (spec section 4.3).
 *
 * Deliberately a solid Node one size up rather than its own geometry: the
 * terminal is the same mark carrying more emphasis, and giving it a second
 * implementation would let the two drift apart.
 */
export function Terminal({
  x,
  y,
  size = units(1.5),
  delay = 0,
  duration = MARK_DURATION,
  className,
}: TerminalProps) {
  return (
    <Node x={x} y={y} size={size} filled delay={delay} duration={duration} className={className} />
  );
}

interface JunctionProps extends MarkTiming {
  x: number;
  y: number;
  /** Arm length in user-space px. Defaults to one grid unit. */
  size?: number;
  className?: string;
}

/**
 * A crossing where a branch meets an axis.
 *
 * One path with two subpaths rather than two paths, so a single delay drives the
 * whole mark. pathLength normalizes over both, so the arms draw in sequence —
 * fine at a quarter second, and nothing in the pilots uses this mark yet.
 */
export function Junction({
  x,
  y,
  size = units(1),
  delay = 0,
  duration = MARK_DURATION,
  className,
}: JunctionProps) {
  const d = `M ${x - size} ${y} H ${x + size} M ${x} ${y - size} V ${y + size}`;

  return (
    <DrawPath d={d} weight="hairline" delay={delay} duration={duration} className={className} />
  );
}
