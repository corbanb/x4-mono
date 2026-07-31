/**
 * Swiss grid constants and coordinate math.
 *
 * Every station and layout coordinate in this design layer — the positions marks
 * and paths are placed AT — is a multiple of UNIT. Authoring sites call snap()
 * rather than rounding by hand so the rule holds in one place.
 *
 * The rule governs anchors, not every number inside a path's `d`. A mark's
 * internal geometry is sub-unit by necessity: a square centered on an anchor
 * starts at `x - size / 2`, and the serpentine that inks a solid square steps by
 * half a unit so its runs overlap (see marks.tsx). Snapping those to the 8-grid
 * would collapse the shape — do not "fix" them.
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
 * quietly opt out.
 *
 * vector-effect: non-scaling-stroke is deliberately ABSENT. It is incompatible
 * with the stroke-dasharray path drawing DrawPath uses: with it applied, both
 * Chromium and WebKit evaluate the dash lengths in device pixels while taking
 * their magnitude from user space, so the drawn length pins at roughly
 * (progress x viewBox width) device px no matter what the viewBox is scaled to.
 * At a 0.36 scale — a 960-unit diagram on a 390px viewport — that exceeds the
 * whole path and the line renders solid from about 37% of the animation onward,
 * i.e. no draw at all on mobile. Measured identically in both engines; this is
 * not a WebKit quirk. Stroke weight is instead kept legible at small scales by
 * the --x4-stroke-scale compensation Diagram sets (see globals.css).
 */
export const STROKE_ATTRS = {
  fill: 'none',
  strokeLinecap: 'butt',
  strokeLinejoin: 'miter',
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
