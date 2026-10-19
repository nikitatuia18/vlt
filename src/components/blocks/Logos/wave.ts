/*
 * Geometry of the logo wave (Figma block `logos`). Pure functions, no DOM: tested in tests/logos-wave.spec.ts.
 *
 * Coordinates are in px, x measured from the left edge of the content column (`logos__track-wrap`),
 * y from its top. The tiles slide along a fixed curve: a tile's height is a function of where it is on the screen.
 */

/** Tile (circle) size in px: 48 px icon + 16 px padding on each side. */
export const TILE_SIZE = 80

/** Distance between tile origins along x, px (21 tiles span 2460 px in the design). */
export const SPACING = 123.05

/** x of the tile with index 0 in the design (the first Bybit tile). */
export const GRID_ORIGIN = -551

/** Number of different brands; the brand sequence repeats every 9 tiles. */
export const BRAND_COUNT = 9

/** After moving this far (9 tiles) the picture repeats exactly, so the loop is seamless. */
export const LOOP_LENGTH = BRAND_COUNT * SPACING

/**
 * Heights of the curve at seven consecutive tile positions, taken from the design (tiles 7 to 13 of the frame;
 * the next seven repeat them within 1 px). The curve is periodic with these seven tiles (861 px).
 * The first seven tiles of the design are drawn about half a tile out of phase with the rest; the curve follows the rest.
 */
const WAVE_SAMPLES = [61.5, 37.0, 12.1, 0.6, 25.1, 49.7, 74.0] as const

const mod = (value: number, divisor: number) => ((value % divisor) + divisor) % divisor

/** Height (px) of the curve at x: a smooth periodic spline (Catmull-Rom) through the design samples. */
export function waveY(x: number): number {
  const n = WAVE_SAMPLES.length
  const u = (x - GRID_ORIGIN) / SPACING
  const index = Math.floor(u)
  const t = u - index
  const p0 = WAVE_SAMPLES[mod(index - 1, n)]
  const p1 = WAVE_SAMPLES[mod(index, n)]
  const p2 = WAVE_SAMPLES[mod(index + 1, n)]
  const p3 = WAVE_SAMPLES[mod(index + 2, n)]
  return (
    0.5 *
    (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t)
  )
}

/** Position and brand of the tile in slot `slot` after the track has moved `offset` px to the left. */
export function tilePosition(slot: number, offset: number) {
  const x = GRID_ORIGIN + slot * SPACING - offset
  return { x, y: waveY(x), brand: mod(slot, BRAND_COUNT) }
}

/**
 * Which slots must exist so that the screen is always full while the offset runs from 0 to LOOP_LENGTH.
 * `columnLeft` is the x of the content column on the screen, `viewportWidth` the width of the screen.
 */
export function slotRange(columnLeft: number, viewportWidth: number) {
  const leftEdge = -columnLeft - TILE_SIZE
  const rightEdge = viewportWidth - columnLeft + TILE_SIZE
  return {
    first: Math.ceil((leftEdge - GRID_ORIGIN) / SPACING),
    last: Math.floor((rightEdge + LOOP_LENGTH - GRID_ORIGIN) / SPACING),
  }
}
