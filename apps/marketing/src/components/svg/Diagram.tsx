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
 * Defaults are deliberately "already drawn, no motion" so a primitive rendered
 * outside a Diagram degrades to its final state rather than staying invisible.
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
 * Responsive SVG wrapper and the single place viewport state is resolved (spec
 * section 4.6), so an individual surface cannot forget to honor it.
 *
 * The data-x4-diagram attribute is load-bearing, not a test hook: it is the
 * selector the reduced-motion rule in globals.css targets. Reduced motion is
 * handled in CSS rather than here because motion's useReducedMotion() returns
 * null during SSR, so a JS-derived value would render an undrawn first frame
 * for exactly the visitors who asked not to see motion.
 *
 * aria-hidden because all meaningful labels live in HTML (spec section 4.4) —
 * the SVG carries geometry, not content a screen reader needs.
 *
 * --x4-stroke-scale is the replacement for vector-effect: non-scaling-stroke,
 * which had to be dropped from STROKE_ATTRS because it breaks stroke-dasharray
 * path drawing in every engine (see grid.ts). It is a partial correction keyed
 * to the breakpoint, applied by globals.css across the whole subtree so no
 * primitive has to opt in. Non-fluid diagrams render at their authored size, so
 * their scale is 1 by construction and they need no correction at all.
 *
 * The fluid multipliers assume a diagram spanning the page content column. A
 * diagram in a narrower column is slightly under-corrected — tolerable because
 * the correction is partial by design rather than an exact 1/scale.
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
        className={cn(
          'block',
          fluid
            ? 'h-auto w-full [--x4-stroke-scale:1.8] sm:[--x4-stroke-scale:1.3] md:[--x4-stroke-scale:1]'
            : '[--x4-stroke-scale:1]',
          className,
        )}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        {children}
      </svg>
    </DiagramContext.Provider>
  );
}
