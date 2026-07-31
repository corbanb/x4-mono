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
