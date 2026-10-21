import { cornerAlpha, cornerRadius, edgeAlpha, edgeWidth, hypercube, PLANE, project, type Corner, type Projected, type Turn } from '../../../../lib/hypercube'
import { STEP_SECONDS, type StepId } from '../steps'

/*
 * The pictures of the four steps of the block "What are our next steps?": a ladder of dimensions. Step N grows to the N-th dimension:
 * 01 a segment, 02 a square, 03 a cube, 04 the tesseract (the object of the card "Crypto Processing"). Every picture is a pure function
 * of the progress `p` (0 to 1) of the orange line of the step, so it is built while the line fills, stands still when the time is held,
 * and shows one fixed frame with reduced motion. The accent color (brand) marks the moments that matter. Spec: docs/blocks/next-steps.motion.md.
 */

export type SceneFrame = {
  context: CanvasRenderingContext2D
  width: number
  height: number
  /** Progress of the step: 0 to 1. */
  p: number
  /** Color of lines and corners (the text color of the theme) and the accent color (brand). */
  ink: string
  accent: string
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const easeOut = (t: number) => 1 - (1 - t) ** 3
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
/** 0 → 1 → 0 between `from` and `to` (a flash). */
const bump = (p: number, from: number, to: number) => Math.sin(Math.PI * clamp01((p - from) / (to - from)))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

type Point = { x: number; y: number }

/** Pixels per unit of the picture, and how the widths of lines and corners follow the size of the canvas. */
const unitOf = (frame: SceneFrame, span: number) => Math.min(frame.width, frame.height) / span
const detailOf = (frame: SceneFrame) => Math.min(frame.width, frame.height) / 260

const toScreen = (frame: SceneFrame, point: Projected, unit: number): Point => ({
  x: frame.width / 2 + point.x * unit,
  y: frame.height / 2 + point.y * unit,
})

function segment(frame: SceneFrame, from: Point, to: Point, width: number, alpha: number, color = frame.ink) {
  const { context } = frame
  context.globalAlpha = alpha
  context.strokeStyle = color
  context.lineWidth = width
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(from.x, from.y)
  context.lineTo(to.x, to.y)
  context.stroke()
}

function dot(frame: SceneFrame, at: Point, radius: number, alpha: number, color = frame.ink) {
  const { context } = frame
  context.globalAlpha = alpha
  context.fillStyle = color
  context.beginPath()
  context.arc(at.x, at.y, Math.max(0, radius), 0, Math.PI * 2)
  context.fill()
}

function ring(frame: SceneFrame, at: Point, radius: number, width: number, alpha: number, color = frame.ink) {
  const { context } = frame
  context.globalAlpha = alpha
  context.strokeStyle = color
  context.lineWidth = width
  context.beginPath()
  context.arc(at.x, at.y, Math.max(0, radius), 0, Math.PI * 2)
  context.stroke()
}


/** 01 Book a demo: two points, you and us, are joined by a line; at the moment of the contact a ring goes out from the middle. */
function bookDemo(frame: SceneFrame) {
  const { p } = frame
  const detail = detailOf(frame)
  const unit = unitOf(frame, 3.2)
  const turns: Turn[] = [[PLANE.XZ, -0.6 + p * 1.1], [PLANE.YZ, 0.28]]
  // The segment is stretched so that the two points stand far apart: the picture is wide.
  const [cornerA, cornerB] = hypercube(1).corners.map((corner) => [corner[0] * 2.2, 0, 0, 0] as Corner)
  const a = project(cornerA, turns)
  const b = project(cornerB, turns)
  const screenA = toScreen(frame, a, unit)
  const screenB = toScreen(frame, b, unit)

  const appear = easeOut(clamp01(p / 0.25))
  const grow = easeInOut(clamp01((p - 0.25) / 0.45))
  const filled = clamp01((p - 0.7) / 0.15)
  const head: Point = { x: lerp(screenA.x, screenB.x, grow), y: lerp(screenA.y, screenB.y, grow) }

  if (grow > 0) {
    segment(frame, screenA, head, edgeWidth(0.7, detail) * 1.2, 0.9)
    if (grow < 1) dot(frame, head, 2.8 * detail, 1, frame.accent)
  }
  for (const [point, screen] of [[a, screenA], [b, screenB]] as const) {
    const radius = cornerRadius(point.near, detail) * 1.5 * appear
    ring(frame, screen, radius, 1 * detail, 0.55 * appear)
    dot(frame, screen, radius * filled, 0.95)
  }
  // The contact: a ring goes out from the middle of the line.
  const flash = clamp01((p - 0.7) / 0.22)
  if (flash > 0 && flash < 1) {
    const middle: Point = { x: (screenA.x + screenB.x) / 2, y: (screenA.y + screenB.y) / 2 }
    ring(frame, middle, (6 + 52 * easeOut(flash)) * detail, 1.2 * detail, 0.9 * (1 - flash), frame.accent)
    dot(frame, middle, 2.5 * detail * (1 - flash), 1, frame.accent)
  }
}

/** 02 Pass KYB: a square frame is scanned from top to bottom; its four corners are checked one after another, then the frame locks. */
function passKyb(frame: SceneFrame) {
  const { p } = frame
  const detail = detailOf(frame)
  const unit = unitOf(frame, 2.7)
  const turns: Turn[] = [[PLANE.XZ, 0.35 + p * 0.5], [PLANE.YZ, -0.45]]
  const { corners } = hypercube(2)
  // Round the frame clockwise from the top left corner.
  const ring4 = [0, 1, 3, 2].map((index) => toScreen(frame, project(corners[index], turns), unit))
  const near4 = [0, 1, 3, 2].map((index) => project(corners[index], turns).near)
  const at = (x: number, y: number) => toScreen(frame, project([x, y, 0, 0] as Corner, turns), unit)

  // The part already scanned is lightly filled; the scanning line is the accent.
  const scan = clamp01(p / 0.8)
  const y = -1 + 2 * scan
  if (scan > 0) {
    const { context } = frame
    const polygon = [at(-1, -1), at(1, -1), at(1, y), at(-1, y)]
    context.globalAlpha = 0.07
    context.fillStyle = frame.ink
    context.beginPath()
    polygon.forEach((point, index) => (index === 0 ? context.moveTo(point.x, point.y) : context.lineTo(point.x, point.y)))
    context.closePath()
    context.fill()
    if (scan < 1) segment(frame, at(-1, y), at(1, y), 1.3 * detail, 0.95, frame.accent)
  }

  const times = [0.18, 0.38, 0.58, 0.78]
  // The frame: thin at first; each side becomes solid when its first corner has been checked and the next one is reached.
  for (let index = 0; index < 4; index++) {
    const from = ring4[index]
    const to = ring4[(index + 1) % 4]
    const near = (near4[index] + near4[(index + 1) % 4]) / 2
    segment(frame, from, to, edgeWidth(near, detail), 0.25)
    const solid = clamp01((p - times[index]) / 0.2)
    if (solid > 0) segment(frame, from, { x: lerp(from.x, to.x, solid), y: lerp(from.y, to.y, solid) }, edgeWidth(near, detail) * 1.3, 0.95)
  }
  for (let index = 0; index < 4; index++) {
    const check = clamp01((p - times[index]) / 0.1)
    const radius = cornerRadius(near4[index], detail) * 1.3
    ring(frame, ring4[index], radius, 1 * detail, 0.5)
    dot(frame, ring4[index], radius * easeOut(check), 0.95)
    if (check > 0 && check < 1) ring(frame, ring4[index], radius * (1 + 1.6 * check), 1.3 * detail, 1 - check, frame.accent)
  }
  // The frame locks: all the sides flash in the accent color once.
  const lock = bump(p, 0.84, 0.98)
  if (lock > 0) for (let index = 0; index < 4; index++) segment(frame, ring4[index], ring4[(index + 1) % 4], 1.8 * detail, 0.9 * lock, frame.accent)
}

const CUBE = hypercube(3)
/** The sides of the cube in the order they are built: around the first corner, then outwards. */
const CUBE_EDGES = [...CUBE.edges].sort((a, b) => Math.max(...a) - Math.max(...b) || Math.min(...a) - Math.min(...b))
/** A walk round the cube along its edges (a Gray code): the test payment runs along it. */
const WALK = [0, 1, 3, 2, 6, 7, 5, 4, 0]

/** 03 Start the process: the corners appear and the twelve sides of the cube are built one after another; then a point (a test payment) runs along them. */
function startProcess(frame: SceneFrame) {
  const { p } = frame
  const detail = detailOf(frame)
  const unit = unitOf(frame, 2.8)
  const turns: Turn[] = [[PLANE.XZ, 0.55 + p * 1.1], [PLANE.YZ, 0.5]]
  const points = CUBE.corners.map((corner) => project(corner, turns))
  const screen = points.map((point) => toScreen(frame, point, unit))

  const start = (index: number) => 0.04 + (index / CUBE_EDGES.length) * 0.62
  const built = CUBE_EDGES.map((_, index) => easeOut(clamp01((p - start(index)) / 0.1)))
  const cornerTime = CUBE.corners.map((_, corner) => {
    const times = CUBE_EDGES.flatMap((edge, index) => (edge.includes(corner) ? [start(index)] : []))
    return Math.min(0.02, ...times)
  })

  // Far sides first, so that near ones lie on top.
  const order = CUBE_EDGES.map((edge, index) => ({ edge, index, near: (points[edge[0]].near + points[edge[1]].near) / 2 })).sort((a, b) => a.near - b.near)
  for (const { edge, index, near } of order) {
    if (built[index] <= 0) continue
    const from = screen[edge[0]]
    const to = screen[edge[1]]
    segment(frame, from, { x: lerp(from.x, to.x, built[index]), y: lerp(from.y, to.y, built[index]) }, edgeWidth(near, detail), edgeAlpha(near))
  }
  for (let corner = 0; corner < CUBE.corners.length; corner++) {
    const appear = easeOut(clamp01((p - cornerTime[corner]) / 0.08))
    dot(frame, screen[corner], cornerRadius(points[corner].near, detail) * appear, cornerAlpha(points[corner].near))
  }

  // The test payment: the head runs along the walk, the trail behind it fades.
  const travel = clamp01((p - 0.75) / 0.25) * (WALK.length - 1)
  if (travel > 0) {
    const trail = 1.8
    for (let leg = Math.floor(Math.max(0, travel - trail)); leg <= Math.min(WALK.length - 2, Math.floor(travel)); leg++) {
      const from = screen[WALK[leg]]
      const to = screen[WALK[leg + 1]]
      const t0 = Math.max(leg, travel - trail) - leg
      const t1 = Math.min(leg + 1, travel) - leg
      const a: Point = { x: lerp(from.x, to.x, t0), y: lerp(from.y, to.y, t0) }
      const b: Point = { x: lerp(from.x, to.x, t1), y: lerp(from.y, to.y, t1) }
      segment(frame, a, b, 1.8 * detail, 0.35 + 0.65 * ((leg + t1 - (travel - trail)) / trail), frame.accent)
    }
    const leg = Math.min(WALK.length - 2, Math.floor(travel))
    const from = screen[WALK[leg]]
    const to = screen[WALK[leg + 1]]
    const t = travel - leg
    dot(frame, { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) }, 3.2 * detail, 1, frame.accent)
  }
}

const TESSERACT = hypercube(4)
const weight = (corner: number) => corner.toString(2).split('1').length - 1
/** How far a side is from the first corner: the pulse of the picture runs from layer to layer. */
const EDGE_LAYER = TESSERACT.edges.map((edge) => Math.max(weight(edge[0]), weight(edge[1])))
/** Radians per second of the four turns (the same as the tesseract of the card "Crypto Processing"). */
const SPEEDS = [0.26, 0.17, 0.11, 0.07] as const

/** 04 Go live: the inner cube unfolds from the outer one, then the whole tesseract turns and a pulse runs through its sides. */
function goLive(frame: SceneFrame) {
  const { p } = frame
  const detail = detailOf(frame)
  const unit = unitOf(frame, 3.9)
  const unfold = easeOut(clamp01(p / 0.2))
  const angles = SPEEDS.map((rate, index) => [0.3, 0.2, 0.5, 0.45][index] + rate * p * STEP_SECONDS)
  const turns: Turn[] = [[PLANE.XW, angles[0]], [PLANE.YW, angles[1]], [PLANE.XZ, angles[2]], [PLANE.YZ, angles[3]]]
  const points = TESSERACT.corners.map((corner) => project([corner[0], corner[1], corner[2], corner[3] * unfold] as Corner, turns))
  const screen = points.map((point) => toScreen(frame, point, unit))

  // The pulse: it leaves the first corner at the end of the unfolding and runs through the layers, twice before the step ends.
  const cycle = clamp01((p - 0.2) / 0.8) * 11
  const position = p < 0.2 ? -10 : cycle % 5.5
  const glow = (layer: number) => Math.exp(-((layer - position) ** 2) / 0.4)

  const order = TESSERACT.edges.map((edge, index) => ({ edge, index, near: (points[edge[0]].near + points[edge[1]].near) / 2 })).sort((a, b) => a.near - b.near)
  for (const { edge, index, near } of order) {
    const from = screen[edge[0]]
    const to = screen[edge[1]]
    segment(frame, from, to, edgeWidth(near, detail), edgeAlpha(near))
    const light = glow(EDGE_LAYER[index])
    if (light > 0.05) segment(frame, from, to, edgeWidth(near, detail) * 1.8, 0.95 * light, frame.accent)
  }
  const dots = points.map((point, index) => ({ point, index })).sort((a, b) => a.point.near - b.point.near)
  for (const { point, index } of dots) {
    dot(frame, screen[index], cornerRadius(point.near, detail), cornerAlpha(point.near))
    const light = glow(weight(index))
    if (light > 0.05) ring(frame, screen[index], cornerRadius(point.near, detail) * (1.3 + light), 1.1 * detail, 0.9 * light, frame.accent)
  }
}

export const scenes: Record<StepId, (frame: SceneFrame) => void> = {
  'book-demo': bookDemo,
  'pass-kyb': passKyb,
  'start-process': startProcess,
  'go-live': goLive,
}

/** Draws one frame of a step on a cleared canvas. */
export function drawScene(id: StepId, frame: SceneFrame) {
  frame.context.clearRect(0, 0, frame.width, frame.height)
  scenes[id](frame)
  frame.context.globalAlpha = 1
}
