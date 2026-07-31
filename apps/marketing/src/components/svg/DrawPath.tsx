'use client';

import { motion } from 'motion/react';
import { STROKE, STROKE_ATTRS, type StrokeWeight } from './grid';
import { useDiagram } from './Diagram';

interface DrawPathProps {
  /**
   * SVG path data. The anchors a path is placed at must be grid-snapped; the
   * geometry inside the path need not be, and for marks it deliberately is not
   * (see grid.ts and marks.tsx).
   */
  d: string;
  /**
   * Defaults to `hairline`, which is what every path in this design layer draws
   * at: the spine, the ticks, the nodes and the terminal's serpentine.
   *
   * `primary` is the heavier of the two authored weights and is reserved for a
   * path that is the SUBJECT of a diagram rather than its structure. Defaulting
   * to it is what this component did first, and since every call site inside
   * svg/ passes `hairline` explicitly, the only paths that would ever have
   * received 1.5 are the ones a future surface forgets to weight — which is
   * exactly backwards. The default is the common case; the emphasis is opted
   * into.
   */
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
  weight = 'hairline',
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
