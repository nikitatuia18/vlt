/*
 * The two signs of the hero, as points: the euro (the bank) and the tugrik-like T that stands for Tether (the wallet). They are drawn as strokes on
 * a hidden canvas and read back as points, because the fonts of the site have no ₮ (only the latin subset is loaded). The points are in
 * the unit of the sign: -0.5…0.5 across and down, 0 in the middle.
 */

export type Glyph = 'euro' | 'tether'
export type Point = { x: number; y: number }

const BOX = 240

/** A small steady random generator: the same points every time, so that the clouds do not jump when the page is built again. */
export function seeded(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function drawGlyph(context: CanvasRenderingContext2D, glyph: Glyph) {
  context.clearRect(0, 0, BOX, BOX)
  context.strokeStyle = '#000'
  context.lineCap = 'butt'
  if (glyph === 'euro') {
    // A "C" that opens to the right, and two bars that cross its mouth.
    context.lineWidth = 36
    context.beginPath()
    context.arc(134, 120, 74, 0.72, Math.PI * 2 - 0.72)
    context.stroke()
    context.lineWidth = 20
    context.beginPath()
    context.moveTo(30, 97)
    context.lineTo(154, 97)
    context.moveTo(30, 143)
    context.lineTo(154, 143)
    context.stroke()
    return
  }
  // A "T" with two thin bars across the stem.
  context.lineWidth = 36
  context.beginPath()
  context.moveTo(34, 52)
  context.lineTo(206, 52)
  context.moveTo(120, 52)
  context.lineTo(120, 214)
  context.stroke()
  context.lineWidth = 16
  context.beginPath()
  context.moveTo(62, 112)
  context.lineTo(178, 112)
  context.moveTo(62, 146)
  context.lineTo(178, 146)
  context.stroke()
}

/**
 * `count` points that fill the sign, sorted from the top down (with a little noise), so that a euro and a tether sorted the same way
 * can be matched point to point: the top of one becomes the top of the other, and a wave that runs down the first runs down the second.
 */
export function glyphPoints(glyph: Glyph, count: number, seed: number): Point[] {
  const canvas = document.createElement('canvas')
  canvas.width = BOX
  canvas.height = BOX
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return Array.from({ length: count }, () => ({ x: 0, y: 0 }))
  drawGlyph(context, glyph)
  const data = context.getImageData(0, 0, BOX, BOX).data
  const random = seeded(seed)

  // A grid that is as fine as the number of points asks for, shaken a little: the points lie evenly, not in clumps like a random choice would.
  let area = 0
  for (let index = 3; index < data.length; index += 4) if (data[index] > 128) area++
  const step = Math.sqrt(Math.max(area, 1) / count)
  const picked: Point[] = []
  for (let y = step / 2; y < BOX; y += step) {
    for (let x = step / 2; x < BOX; x += step) {
      if (data[(Math.floor(y) * BOX + Math.floor(x)) * 4 + 3] <= 128) continue
      picked.push({ x: (x + (random() - 0.5) * step * 0.7) / BOX - 0.5, y: (y + (random() - 0.5) * step * 0.7) / BOX - 0.5 })
    }
  }
  // The grid gives about `count` points: a few too many are dropped at random, a few too few are doubled with a shake.
  while (picked.length > count) picked.splice(Math.floor(random() * picked.length), 1)
  while (picked.length < count && picked.length > 0) {
    const from = picked[Math.floor(random() * picked.length)]
    picked.push({ x: from.x + (random() - 0.5) * 0.01, y: from.y + (random() - 0.5) * 0.01 })
  }
  return picked
    .map((point) => ({ point, key: point.y + (random() - 0.5) * 0.1 }))
    .sort((a, b) => a.key - b.key)
    .map((item) => item.point)
}
