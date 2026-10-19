/*
 * Geometry of the logo wave (Figma block `logos`). Pure functions, no DOM: tested in tests/logos-wave.spec.ts.
 *
 * The tiles stand still in a row; a wave runs through them and lifts each tile to the height of the curve.
 * Coordinates are in px: x is measured from the left edge of the content column (`logos__track-wrap`),
 * y from its top.
 */

/** Tile (circle) size in px: 48 px icon + 16 px padding on each side. */
export const TILE_SIZE = 80

/** Distance between tile origins along x, px (21 tiles span 2460 px in the design). */
export const SPACING = 123.05

/** x of the tile with index 0 in the design (the first Bybit tile). */
export const GRID_ORIGIN = -551

/** Number of different brands; the brand sequence repeats every 9 tiles. */
export const BRAND_COUNT = 9

/** The curve repeats every seven tiles (861 px). The wave runs this far per cycle. */
export const WAVELENGTH = 7 * SPACING

/**
 * Heights of the curve at seven consecutive tile positions, taken from the design (tiles 7 to 13 of the frame;
 * the next seven repeat them within 1 px). With the wave at phase 0 the tiles stand exactly as in the design.
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

/** x of the tile in slot `slot`. Tiles never move along x by themselves. */
export const tileX = (slot: number) => GRID_ORIGIN + slot * SPACING

/** Which brand (index in `brands`) stands in slot `slot`. */
export const tileBrand = (slot: number) => mod(slot, BRAND_COUNT)

/**
 * Height of the tile in slot `slot` while the wave is at `phase` px. The wave runs from right to left:
 * a crest that was at x is at x - phase later. After WAVELENGTH px the picture repeats exactly.
 */
export const tileY = (slot: number, phase: number) => waveY(tileX(slot) + phase)

/**
 * Which slots must exist so that the screen is always full while the strip drifts left by 0..`drift` px
 * (the scroll shift). `columnLeft` is the x of the content column on the screen, `viewportWidth` the screen width.
 */
export function slotRange(columnLeft: number, viewportWidth: number, drift: number) {
  const leftEdge = -columnLeft - TILE_SIZE
  const rightEdge = viewportWidth - columnLeft + drift
  return {
    first: Math.ceil((leftEdge - GRID_ORIGIN) / SPACING),
    last: Math.floor((rightEdge - GRID_ORIGIN) / SPACING),
  }
}
