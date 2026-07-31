/**
 * Swiss grid constants and coordinate math.
 *
 * Every SVG coordinate in this design layer is a multiple of UNIT. Authoring
 * sites call snap() rather than rounding by hand so the rule holds in one place.
 */

/** Base grid unit, in user-space px. */
export const UNIT = 8;

/** The only two stroke weights in the system: hairline structure, primary path. */
export const STROKE = {
  hairline: 1,
  primary: 1.5,
} as const;

export type StrokeWeight = keyof typeof STROKE;

/**
 * Attributes every stroked element in the system carries.
 *
 * Butt caps and miter joins are the tell that separates Swiss line art from
 * generic friendly-startup illustration — centralized here so no call site can
 * quietly opt out. non-scaling-stroke keeps hairlines hairline as the viewBox
 * scales.
 */
export const STROKE_ATTRS = {
  fill: 'none',
  strokeLinecap: 'butt',
  strokeLinejoin: 'miter',
  vectorEffect: 'non-scaling-stroke',
} as const;

/** Round a coordinate to the nearest grid unit. */
export function snap(n: number): number {
  return Math.round(n / UNIT) * UNIT;
}

/** Convert a count of grid units to user-space px. */
export function units(n: number): number {
  return n * UNIT;
}

/** Build an origin-anchored viewBox string with snapped dimensions. */
export function viewBox(width: number, height: number): string {
  return `0 0 ${snap(width)} ${snap(height)}`;
}

/**
 * Normalized positions (0 to 1) of evenly spaced stations along an axis.
 *
 * Animation stagger keys off these rather than array index, so the draw follows
 * the geometry and reordering or adding a station cannot desync it. Normalized
 * position rather than a raw coordinate, because the vertical axis variant gives
 * every station the same x.
 */
export function stationOffsets(count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0];
  return Array.from({ length: count }, (_, i) => i / (count - 1));
}
