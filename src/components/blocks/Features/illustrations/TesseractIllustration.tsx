import { useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { cornerAlpha, cornerRadius, edgeAlpha, edgeWidth, hypercube, PLANE, project, type Turn } from '../../../../lib/hypercube'
import { useTheme } from '../../../../lib/theme'
import { useRevealOn } from '../../../../motion/useReveal'

/*
 * The tesseract of the card "Crypto Processing" (Figma `img-tesseract`, 509 × 509 px). The design holds one still picture and the designer's
 * GIF of the same object (a four-dimensional cube turning, 24.8 s per loop, 6.9 MB). Here it is drawn live: the 16 corners and 32 edges of a
 * hypercube are turned in four dimensions and projected with perspective, so the loop is seamless, the picture is sharp on any screen,
 * it follows the theme, and it weighs nothing. Spec: docs/blocks/features.motion.md.
 */

const { corners: CORNERS, edges: EDGES } = hypercube(4)

/** Radians per second of the four turns (planes XW, YW, XZ, YZ). The first two are the "fourth dimension" that makes the inner cube swap places with the outer one. */
const SPEEDS = [0.26, 0.17, 0.11, 0.07] as const
/** The angles of the still picture (reduced motion): like the design, the inner cube stands inside the outer one. */
const REST = [0.05, 0, 0.35, 0.5] as const
const PLANES = [PLANE.XW, PLANE.YW, PLANE.XZ, PLANE.YZ] as const

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
      const turns = PLANES.map((plane, index): Turn => [plane, angles[index]])
      const points = CORNERS.map((corner) => project(corner, turns))
      context.clearRect(0, 0, size, size)
      context.lineCap = 'round'
      context.fillStyle = color
      context.strokeStyle = color

      // Far edges first, so that near ones lie on top.
      const edges = EDGES.map(([from, to]) => ({ from: points[from], to: points[to] })).sort((a, b) => a.from.near + a.to.near - (b.from.near + b.to.near))
      for (const edge of edges) {
        const near = (edge.from.near + edge.to.near) / 2
        context.globalAlpha = edgeAlpha(near)
        context.lineWidth = edgeWidth(near, detail)
        context.beginPath()
        context.moveTo(size / 2 + edge.from.x * unit, size / 2 + edge.from.y * unit)
        context.lineTo(size / 2 + edge.to.x * unit, size / 2 + edge.to.y * unit)
        context.stroke()
      }
      for (const point of [...points].sort((a, b) => a.near - b.near)) {
        context.globalAlpha = cornerAlpha(point.near)
        context.beginPath()
        context.arc(size / 2 + point.x * unit, size / 2 + point.y * unit, cornerRadius(point.near, detail), 0, Math.PI * 2)
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
