import { useEffect, useRef } from 'react'
import { useTheme } from '../../lib/theme'

type InteractiveDotsProps = {
  /** Distance between dots, px. */
  spacing?: number
  /** Dot radius, px. */
  dotSize?: number
  /** Pointer influence radius, px. */
  radius?: number
  /** Push strength (1 = value from the approved prototype). */
  force?: number
  /** Return-to-place speed per frame, 0..1. */
  ease?: number
  /** Text color class that gives the dot color. Default surface-dots; on a colored background pass a light one. */
  colorClass?: string
  className?: string
}

type Dot = { baseX: number; baseY: number; x: number; y: number }

/** A dot is "at rest" when it moves less than this many px per frame. */
const REST_EPSILON = 0.01
const OFFSCREEN = -1000

/**
 * Dot grid that the pointer pushes away: a "living" background.
 * Defaults are the values of the approved prototype: spacing 40, dot 1, radius 150, force 1, ease 0.1.
 *
 * - Fills its parent (the parent must be positioned and should clip: overflow-hidden).
 * - Transparent: the page color shows through, so Light/Dark works by itself.
 * - Dot color is the semantic color `surface-dots` (Figma: theme/surface/dots), read from the element so it follows the theme.
 * - The pointer is tracked on the whole window (the canvas can sit behind content), touch is ignored.
 * - The animation runs only while something moves and the canvas is on screen; with `prefers-reduced-motion` the dots stay still.
 */
export function InteractiveDots({
  spacing = 40,
  dotSize = 1,
  radius = 150,
  force = 1,
  ease = 0.1,
  colorClass = 'text-surface-dots',
  className = '',
}: InteractiveDotsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // The effect restarts on a theme change: the dot color is read again and the grid is rebuilt.
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let dots: Dot[] = []
    let width = 0
    let height = 0
    let color = ''
    let frame = 0
    let running = false
    let isVisible = true
    // Last pointer position in the viewport; converted to canvas coordinates when needed.
    let pointer = { x: OFFSCREEN, y: OFFSCREEN }
    let mouse = { x: OFFSCREEN, y: OFFSCREEN }

    const updateMouse = () => {
      const rect = canvas.getBoundingClientRect()
      mouse = { x: pointer.x - rect.left, y: pointer.y - rect.top }
    }

    const buildDots = () => {
      dots = []
      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          dots.push({ baseX: x, baseY: y, x, y })
        }
      }
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const pixelRatio = window.devicePixelRatio || 1
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      buildDots()
      updateMouse()
      draw()
    }

    const draw = () => {
      context.clearRect(0, 0, width, height)
      context.fillStyle = color
      context.beginPath()
      for (const dot of dots) {
        context.moveTo(dot.x + dotSize, dot.y)
        context.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2)
      }
      context.fill()
    }

    // One physics step, same formulas as the prototype. Returns true while any dot is still moving.
    const step = () => {
      let isMoving = false
      for (const dot of dots) {
        const previousX = dot.x
        const previousY = dot.y
        const dx = mouse.x - dot.x
        const dy = mouse.y - dot.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < radius && distance > 0) {
          const strength = (radius - distance) / radius
          const push = strength * force * 50
          const angle = Math.atan2(dy, dx)
          dot.x += (dot.x - Math.cos(angle) * push - dot.x) * 0.2
          dot.y += (dot.y - Math.sin(angle) * push - dot.y) * 0.2
        }

        dot.x += (dot.baseX - dot.x) * ease
        dot.y += (dot.baseY - dot.y) * ease

        if (Math.abs(dot.x - previousX) > REST_EPSILON || Math.abs(dot.y - previousY) > REST_EPSILON) {
          isMoving = true
        }
      }
      return isMoving
    }

    const tick = () => {
      const isMoving = step()
      draw()
      if (isMoving && isVisible) {
        frame = requestAnimationFrame(tick)
      } else {
        running = false
      }
    }

    const start = () => {
      if (running || !isVisible || reducedMotion) return
      running = true
      frame = requestAnimationFrame(tick)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      pointer = { x: event.clientX, y: event.clientY }
      updateMouse()
      start()
    }

    const onPointerLeave = () => {
      pointer = { x: OFFSCREEN, y: OFFSCREEN }
      updateMouse()
      start() // let the dots return to their places
    }

    const onScroll = () => {
      // The canvas moves under a standing pointer: the pointer position inside it changes.
      updateMouse()
      start()
    }

    color = getComputedStyle(canvas).color
    resize()

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    // Do not animate a section nobody sees.
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
      if (isVisible) start()
    })
    visibilityObserver.observe(canvas)

    if (!reducedMotion) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('scroll', onScroll, { passive: true })
      document.documentElement.addEventListener('pointerleave', onPointerLeave)
    }

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScroll)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [theme, spacing, dotSize, radius, force, ease])

  return <canvas ref={canvasRef} aria-hidden="true" className={`block size-full ${colorClass} ${className}`} />
}
