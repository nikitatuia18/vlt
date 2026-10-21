import { useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../../../../lib/theme'
import { useRevealOn } from '../../../../motion/useReveal'

/*
 * The tesseract of the card "Crypto Processing" (Figma `img-tesseract`, 509 × 509 px). The design holds one still picture and the designer's
 * GIF of the same object (a four-dimensional cube turning, 24.8 s per loop, 6.9 MB). Here it is drawn live: the 16 corners and 32 edges of a
 * hypercube are turned in four dimensions and projected with perspective, so the loop is seamless, the picture is sharp on any screen,
 * it follows the theme, and it weighs nothing. Spec: docs/blocks/features.motion.md.
 */

const CORNERS = Array.from({ length: 16 }, (_, index) => [index & 1 ? 1 : -1, index & 2 ? 1 : -1, index & 4 ? 1 : -1, index & 8 ? 1 : -1])
// Two corners are joined when they differ in exactly one coordinate: 32 edges.
const EDGES = CORNERS.flatMap((_, from) =>
  CORNERS.slice(from + 1).flatMap((_, offset) => {
    const to = from + 1 + offset
    const difference = from ^ to
    return difference && (difference & (difference - 1)) === 0 ? [[from, to] as const] : []
  }),
)

/** Radians per second of the four turns (planes XW, YW, XZ, YZ). The first two are the "fourth dimension" that makes the inner cube swap places with the outer one. */
const SPEEDS = [0.26, 0.17, 0.11, 0.07] as const
/** The angles of the still picture (reduced motion): like the design, the inner cube stands inside the outer one. */
const REST = [0.05, 0, 0.35, 0.5] as const

const HALF = 0.8 // half of the edge of the hypercube
const DISTANCE_W = 2.6 // the eye is this far from the hypercube along the fourth axis
const DISTANCE_Z = 6.5 // and along the depth of the picture

type Projected = { x: number; y: number; near: number }

/** One corner: turned by the four angles, then projected from 4D to 3D and from 3D to the picture. `near` is 0 (far) to 1 (near). */
function project(corner: number[], angles: readonly number[]): Projected {
  let [x, y, z, w] = corner.map((value) => value * HALF)
  const turn = (a: number, b: number, angle: number): [number, number] => [a * Math.cos(angle) - b * Math.sin(angle), a * Math.sin(angle) + b * Math.cos(angle)]
  ;[x, w] = turn(x, w, angles[0])
  ;[y, w] = turn(y, w, angles[1])
  ;[x, z] = turn(x, z, angles[2])
  ;[y, z] = turn(y, z, angles[3])
  const k = DISTANCE_W / (DISTANCE_W - w)
  const s = DISTANCE_Z / (DISTANCE_Z - z * k)
  return { x: x * k * s, y: y * k * s, near: Math.min(1, Math.max(0, (k * s - 0.55) / 1.6)) }
}

/** The size of the picture for a card of this width: the design size on wide cards (509 px, flush to the lower right), smaller on narrow ones. */
const sizeFor = (cardWidth: number) => (cardWidth >= 800 ? 509 : cardWidth < 500 ? Math.round(cardWidth * 0.95) : Math.round(cardWidth * 0.62))

/** Turns by itself while the card is on the screen; with reduced motion it stands still. Lines and corners are drawn in the text color of the theme. */
export function TesseractIllustration() {
  const wrapper = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const probe = useRef<HTMLSpanElement>(null)
  const [size, setSize] = useState(509)
  const inView = useInView(wrapper, { amount: 0.2 })
  const reduced = useReducedMotion() ?? false
  const revealOn = useRevealOn()
  const animated = !reduced && revealOn
  const { theme } = useTheme()
  const time = useRef(0)

  useEffect(() => {
    const element = wrapper.current
    if (!element) return
    const measure = () => setSize(sizeFor(element.clientWidth))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const element = canvas.current
    const context = element?.getContext('2d')
    if (!element || !context) return
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    element.width = Math.round(size * ratio)
    element.height = Math.round(size * ratio)
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    const color = probe.current ? getComputedStyle(probe.current).color : '#181818'
    const unit = size / 5.2 // pixels per unit of the picture
    const detail = size / 509 // line widths and corner sizes follow the size of the picture

    const draw = () => {
      const angles = animated ? SPEEDS.map((rate) => rate * time.current) : REST
      const points = CORNERS.map((corner) => project(corner, angles))
      context.clearRect(0, 0, size, size)
      context.lineCap = 'round'
      context.fillStyle = color
      context.strokeStyle = color

      // Far edges first, so that near ones lie on top.
      const edges = EDGES.map(([from, to]) => ({ from: points[from], to: points[to] })).sort((a, b) => a.from.near + a.to.near - (b.from.near + b.to.near))
      for (const edge of edges) {
        const near = (edge.from.near + edge.to.near) / 2
        context.globalAlpha = 0.28 + 0.72 * near
        context.lineWidth = (0.7 + 1.5 * near) * detail * 1.4
        context.beginPath()
        context.moveTo(size / 2 + edge.from.x * unit, size / 2 + edge.from.y * unit)
        context.lineTo(size / 2 + edge.to.x * unit, size / 2 + edge.to.y * unit)
        context.stroke()
      }
      for (const point of [...points].sort((a, b) => a.near - b.near)) {
        context.globalAlpha = 0.45 + 0.55 * point.near
        context.beginPath()
        context.arc(size / 2 + point.x * unit, size / 2 + point.y * unit, (3.2 + 7.5 * point.near) * detail * 1.15, 0, Math.PI * 2)
        context.fill()
      }
      context.globalAlpha = 1
    }

    draw()
    if (!animated || !inView) return
    let frameId = 0
    let last = performance.now()
    const tick = (now: number) => {
      time.current += Math.min((now - last) / 1000, 0.1)
      last = now
      draw()
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [animated, inView, size, theme])

  return (
    <div ref={wrapper} aria-hidden="true" className="pointer-events-none absolute inset-0">
      <span ref={probe} className="hidden text-typography-primary" />
      <canvas
        ref={canvas}
        data-el="features__tesseract"
        // Flush to the lower right of the card; the design lets it go a little beyond the right edge (34 of 509 px).
        style={{ width: size, height: size, right: -size * 0.067 }}
        className="absolute bottom-0"
      />
    </div>
  )
}
