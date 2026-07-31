'use client';

import { createContext, useContext, useRef, type ReactNode } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { viewBox } from './grid';

interface DiagramState {
  /**
   * True when children should render their final, fully-drawn state.
   *
   * Already folds in the reduced-motion preference, which is why the raw
   * in-view flag is deliberately NOT exposed: a primitive that gated on
   * "has it scrolled into view" alone would animate for a visitor who asked
   * for no animation. There is no way to read the un-folded value, so there
   * is no way to forget (spec section 4.6).
   */
  drawn: boolean;
  /** True when the visitor asked for reduced motion — suppress the transition. */
  reduced: boolean;
}

/**
 * Defaults are deliberately "already drawn, no motion" so a primitive rendered
 * outside a Diagram degrades to its final state rather than staying invisible.
 */
const DiagramContext = createContext<DiagramState>({ drawn: true, reduced: true });

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
 * Responsive SVG wrapper and the single place viewport state and reduced-motion
 * preference are resolved (spec section 4.6), so an individual surface cannot
 * forget to honor either.
 *
 * aria-hidden because all meaningful labels live in HTML (spec section 4.4) —
 * the SVG carries geometry, not content a screen reader needs.
 */
export function Diagram({ width, height, fluid = true, className, children }: DiagramProps) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const reduced = useReducedMotion() ?? false;

  return (
    <DiagramContext.Provider value={{ drawn: reduced || inView, reduced }}>
      <svg
        ref={ref}
        viewBox={viewBox(width, height)}
        width={fluid ? undefined : width}
        height={fluid ? undefined : height}
        className={cn('block', fluid && 'h-auto w-full', className)}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        {children}
      </svg>
    </DiagramContext.Provider>
  );
}
