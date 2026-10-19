import { expect, test } from '@playwright/test'
import {
  BRAND_COUNT,
  GRID_ORIGIN,
  SPACING,
  TILE_SIZE,
  WAVELENGTH,
  slotRange,
  tileBrand,
  tileX,
  tileY,
  waveY,
} from '../src/components/blocks/Logos/wave'

// Geometry only, no browser. Positions of tiles 7 to 20 in the design (Figma `logos`): [left, top].
const designTiles: [number, number][] = [
  [311.27, 61.54], [433.91, 37.02], [558.45, 12.11], [682.04, 0.61], [804.68, 25.13], [927.31, 49.66], [1048, 74],
  [1174, 62], [1296, 37], [1421, 12], [1544, 1], [1667, 25], [1790, 50], [1910, 74],
]

test('the curve passes through the seven design heights', () => {
  const samples = [61.5, 37.0, 12.1, 0.6, 25.1, 49.7, 74.0]
  samples.forEach((height, k) => expect(waveY(GRID_ORIGIN + k * SPACING)).toBeCloseTo(height, 6))
})

test('the curve is periodic: seven tiles = one wavelength (861 px)', () => {
  expect(WAVELENGTH).toBeCloseTo(7 * SPACING, 9)
  for (const x of [-700, -123.4, 0, 57.7, 311, 999.9, 1800]) {
    expect(waveY(x + WAVELENGTH)).toBeCloseTo(waveY(x), 6)
  }
})

test('the curve stays inside the design range (no wild overshoot)', () => {
  for (let x = -700; x < 2000; x += 3) {
    const y = waveY(x)
    expect(y).toBeGreaterThan(-3)
    expect(y).toBeLessThan(77)
  }
})

test('with the wave at phase 0 the tiles stand where the design puts tiles 7 to 20 (x within 3.5 px, y within 1.5 px)', () => {
  designTiles.forEach(([left, top], index) => {
    const slot = 7 + index
    expect(Math.abs(tileX(slot) - left)).toBeLessThanOrEqual(3.5)
    expect(Math.abs(tileY(slot, 0) - top)).toBeLessThanOrEqual(1.5)
  })
})

test('brands repeat every 9 tiles in the design order', () => {
  expect(tileBrand(0)).toBe(0)
  expect(tileBrand(8)).toBe(BRAND_COUNT - 1)
  expect(tileBrand(9)).toBe(0)
  expect(tileBrand(-1)).toBe(BRAND_COUNT - 1)
})

test('the wave runs from right to left: a crest moves to smaller x as the phase grows', () => {
  // Position of the highest point (smallest y) of the curve within `radius` px of `around`, for a wave at the given phase.
  const crestNear = (phase: number, around: number, radius: number) => {
    let bestX = around
    let bestY = Infinity
    for (let x = around - radius; x <= around + radius; x += 0.5) {
      const y = waveY(x + phase)
      if (y < bestY) { bestY = y; bestX = x }
    }
    return bestX
  }
  const start = crestNear(0, 690, 100) // the crest of the design near x = 690
  // After the wave has run `phase` px, the crest stands `phase` px to the left. (Had it gone right, the window would
  // not contain a crest and the highest point would lie on the edge of the window, not in its middle.)
  for (const phase of [60, 100, 200]) {
    expect(crestNear(phase, start - phase, 100)).toBeCloseTo(start - phase, 0)
  }
  // And it is really not a crest on the other side.
  expect(Math.abs(crestNear(100, start + 100, 100) - (start + 100))).toBeGreaterThan(50)
})

test('the loop is seamless: after one wavelength the picture is identical', () => {
  for (const phase of [0, 1.7, 400, 860]) {
    for (let slot = -3; slot < 40; slot++) {
      expect(tileY(slot, phase + WAVELENGTH)).toBeCloseTo(tileY(slot, phase), 6)
    }
  }
})

// Where the content column starts on screens of different width (see Container and --gutter).
const columnLeft = (viewport: number) => {
  const gutter = viewport >= 1280 ? 80 : viewport >= 768 ? 32 : 16
  const content = Math.min(1440, viewport - 2 * gutter)
  return (viewport - content) / 2
}

test('there are always enough tiles, at every width and at both ends of the scroll drift', () => {
  const drift = 250
  for (const viewport of [393, 768, 1024, 1280, 1440, 1920, 2560, 3840]) {
    const left = columnLeft(viewport)
    const { first, last } = slotRange(left, viewport, drift)
    // No drift: the tile before the first one would be entirely off the left edge of the screen.
    expect(left + tileX(first) - SPACING + TILE_SIZE).toBeLessThanOrEqual(0)
    // Full drift (strip moved 250 px left): the tile after the last one would be entirely off the right edge.
    expect(left + tileX(last + 1) - drift).toBeGreaterThanOrEqual(viewport)
  }
})
