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

/**
 * Clearance at each end of an axis, in user-space px.
 *
 * The first and last stations sit at t=0 and t=1 — on the canvas edges, where a
 * mark centred on the axis would clip by half its size. One grid unit clears a
 * default node (size UNIT, so half is 4) and keeps every coordinate on the grid.
 */
const AXIS_PAD = UNIT;

/** Room past the last station for a terminal: the mark plus its own clearance. */
const AXIS_TERMINAL_ROOM = UNIT * 4;

/** Where a terminal sits past the last station. */
const AXIS_TERMINAL_OFFSET = UNIT * 2;

export interface AxisMetrics {
  /**
   * Where the axis begins along its own length — one unit of clearance, so the
   * first station does not sit on the canvas edge. Also the spine's near end.
   */
  start: number;
  /**
   * ADJUSTED station span: the distance from the first station to the last.
   *
   * Derived from a grid-snapped PITCH, so it is rarely the `length` that was
   * asked for — see the note on `axisMetrics`. Read this, never the `length` you
   * passed in, whenever the real dimension matters.
   */
  span: number;
  /** Grid-snapped distance between two adjacent stations. 0 below two stations. */
  pitch: number;
  /** Total canvas along the axis — the long dimension of the Axis's viewBox. */
  extent: number;
  /** Station coordinates along the axis, in user-space px. */
  stations: number[];
  /**
   * Station positions as a fraction of `extent`, which is the number an HTML
   * label needs — `left: ${fraction * 100}%` with a -50% translate.
   *
   * Valid for BOTH orientations, but for two different reasons, which is
   * load-bearing and not obvious:
   *
   * - Fluid horizontal: the SVG stretches to its container and the viewBox
   *   aspect matches the element box, so `x / extent` IS the container fraction.
   * - Non-fluid vertical: the SVG is authored at exactly `extent` px along the
   *   axis, so `y / extent` is again the container fraction — user space is 1:1
   *   with CSS px.
   *
   * A third rendering mode (letterboxed, cropped, or a preserveAspectRatio other
   * than the current one) would break that equivalence, and whoever adds one has
   * to revisit this field rather than assume it still holds.
   */
  fractions: number[];
  /** Terminal coordinate along the axis, or null when there is no terminal. */
  terminalAt: number | null;
  /** Terminal position as a fraction of `extent`, or null. */
  terminalFraction: number | null;
}

/**
 * Where an Axis puts its stations, and where a consumer must put the labels.
 *
 * All meaningful text lives in HTML outside the SVG (spec section 4.4), so every
 * surface has to align labels to stations that are positioned by math private to
 * the Axis. This is that math, exported once so a surface reads it instead of
 * reproducing it — and it lives in grid.ts rather than in Axis.tsx because
 * Axis.tsx is a 'use client' module, whose exports become client references that
 * a server component cannot call.
 *
 * `fractions` rather than raw px is the number to reach for, and `terminal` has
 * to be passed, because a horizontal Axis is fluid: it fills its container, so a
 * station's container-space position is its coordinate over the whole canvas,
 * and turning the terminal on lengthens that canvas WITHOUT moving any station.
 * Six stations across a 960 span end at 968/976 = 99.2% without a terminal and
 * 968/1000 = 96.8% with one — about 24px apart at a 1000px container. A row of
 * labels laid out with `justify-between` gets both cases wrong, and gets them
 * wrong differently depending on a prop that reads as purely decorative.
 *
 * `length` is a TARGET, not an exact dimension. What is snapped is the PITCH —
 * the gap between adjacent stations — and the span is then that pitch repeated,
 * so every station lands on the grid by construction and the spacing is exactly
 * uniform. Snapping the span instead (the obvious reading of "grid-snapped
 * length") leaves each station to round independently, which keeps them on the
 * grid but makes the RHYTHM uneven: 576 across six stations gives spacings of
 * 112/120/112/120/112, which reads as sloppy rendering in a design system whose
 * whole premise is a strict grid.
 *
 * The span therefore drifts from `length`, by up to half a pitch, in EITHER
 * direction:
 *
 *   axisMetrics(576, 6) -> pitch 112, span 560  (shrinks by 16)
 *   axisMetrics(768, 8) -> pitch 112, span 784  (GROWS by 16)
 *
 * This is a deliberate trade: the deviation is invisible to a viewer, who has no
 * reference to compare the axis against, while uneven spacing is not. A caller
 * who needs the real dimension reads `span` or `extent` from this result rather
 * than assuming the `length` it passed in.
 *
 * Axis derives its own geometry from this function, so the two cannot drift.
 */
export function axisMetrics(length: number, count: number, terminal = false): AxisMetrics {
  const pitch = count > 1 ? snap(length / (count - 1)) : 0;
  const span = count > 1 ? pitch * (count - 1) : snap(length);
  const extent = AXIS_PAD + span + (terminal ? AXIS_TERMINAL_ROOM : AXIS_PAD);
  const stations = stationOffsets(count).map((_, i) => AXIS_PAD + pitch * i);
  const terminalAt = terminal ? AXIS_PAD + span + AXIS_TERMINAL_OFFSET : null;

  return {
    start: AXIS_PAD,
    span,
    pitch,
    extent,
    stations,
    fractions: stations.map((s) => s / extent),
    terminalAt,
    terminalFraction: terminalAt === null ? null : terminalAt / extent,
  };
}

/**
 * Round a cross-axis extent to a legal one: an EVEN number of units, never below
 * six.
 *
 * Even, because the axis sits at half the extent and that has to land on the
 * grid like every other coordinate — and rounding the extent rather than snapping
 * the halfway point is what keeps the axis CENTRED. Snapping the midpoint of
 * units(7) gives 32 above the spine and 24 below it.
 *
 * Six is the floor because an Axis sizes its ticks from the room left over; below
 * six units there is none, and the stations lose their ticks entirely.
 */
export function axisThickness(thickness: number): number {
  const evenUnits = UNIT * 2 * Math.round(thickness / (UNIT * 2));
  return Math.max(UNIT * 6, evenUnits);
}
