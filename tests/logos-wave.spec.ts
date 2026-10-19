import { expect, test } from '@playwright/test'
import {
  BRAND_COUNT,
  GRID_ORIGIN,
  LOOP_LENGTH,
  SPACING,
  TILE_SIZE,
  slotRange,
  tilePosition,
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

test('the curve is periodic: seven tiles = 861 px', () => {
  for (const x of [-700, -123.4, 0, 57.7, 311, 999.9, 1800]) {
    expect(waveY(x + 7 * SPACING)).toBeCloseTo(waveY(x), 6)
  }
})

test('the curve stays inside the design range (no wild overshoot)', () => {
  for (let x = -700; x < 2000; x += 3) {
    const y = waveY(x)
    expect(y).toBeGreaterThan(-3)
    expect(y).toBeLessThan(77)
  }
})

test('tiles at rest sit where the design puts tiles 7 to 20 (x within 3.5 px, y within 1.5 px)', () => {
  designTiles.forEach(([left, top], index) => {
    const slot = 7 + index
    const { x, y } = tilePosition(slot, 0)
    expect(Math.abs(x - left)).toBeLessThanOrEqual(3.5)
    expect(Math.abs(y - top)).toBeLessThanOrEqual(1.5)
  })
})

test('brands repeat every 9 tiles in the design order', () => {
  expect(tilePosition(0, 0).brand).toBe(0)
  expect(tilePosition(8, 0).brand).toBe(BRAND_COUNT - 1)
  expect(tilePosition(9, 0).brand).toBe(0)
  expect(tilePosition(-1, 0).brand).toBe(BRAND_COUNT - 1)
})

test('the loop is seamless: after 9 tiles the picture is identical', () => {
  for (const offset of [0, 1.7, 400, 1000]) {
    for (let slot = -3; slot < 30; slot++) {
      const now = tilePosition(slot, offset)
      const later = tilePosition(slot + BRAND_COUNT, offset + LOOP_LENGTH)
      expect(later.x).toBeCloseTo(now.x, 6)
      expect(later.y).toBeCloseTo(now.y, 6)
      expect(later.brand).toBe(now.brand)
    }
  }
})

// Where the content column starts on screens of different width (see Container and --gutter).
const columnLeft = (viewport: number) => {
  const gutter = viewport >= 1280 ? 80 : viewport >= 768 ? 32 : 16
  const content = Math.min(1440, viewport - 2 * gutter)
  return (viewport - content) / 2
}

test('the screen is always full of tiles, at every width and every moment of the loop', () => {
  for (const viewport of [393, 768, 1024, 1280, 1440, 1920, 2560, 3840]) {
    const left = columnLeft(viewport)
    const { first, last } = slotRange(left, viewport)
    // At rest: the tile before the first one would be entirely off the left edge of the screen.
    expect(tilePosition(first, 0).x - SPACING + TILE_SIZE).toBeLessThanOrEqual(-left)
    for (let offset = 0; offset < LOOP_LENGTH; offset += 7.3) {
      const xs: number[] = []
      for (let slot = first; slot <= last; slot++) xs.push(tilePosition(slot, offset).x)
      // Tiles are SPACING apart (no holes). The next tile after the last one would be entirely off the right edge,
      // so there is never an empty place on the screen at any moment of the loop.
      expect(Math.max(...xs) + SPACING).toBeGreaterThanOrEqual(viewport - left)
      const visible = xs.filter((x) => x + TILE_SIZE > -left && x < viewport - left)
      expect(visible.length).toBeGreaterThan(0)
    }
  }
})
