import { useEffect, useRef, type MutableRefObject } from 'react'
import { prefersReducedMotion } from '../../lib/media'
import { useTheme } from '../../lib/theme'
import { useRevealOn } from '../../motion/useReveal'

/** How many rates the chart shows, and how often a new one arrives (ms): the dots glide left by one place in between. */
export const HISTORY = 40
export const TICK_MS = 900

/** How far the rate may stray from its base, as a share of it: the height of the chart. */
const SPREAD = 0.007

type Props = {
  /** The last `HISTORY` rates, the newest last; the parent pushes a new one every `TICK_MS` and writes the time into `tickAt`. */
  history: MutableRefObject<number[]>
  tickAt: MutableRefObject<number>
  base: number
  /** The rate that is held (a line across the chart), or null while the rate is live. */
  locked: number | null
}

/**
 * The price of 1 USDT as a row of dots that float (a slow orbit each) and drift left as new rates arrive; the newest one is orange.
 * A locked quote is a straight orange line: the dots go on moving, the held price does not. Colors from the tokens (probes), so it follows the theme.
 */
export function RateChart({ history, tickAt, base, locked }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const probes = useRef<{ ink: HTMLSpanElement | null; brand: HTMLSpanElement | null; mute: HTMLSpanElement | null }>({ ink: null, brand: null, mute: null })
  const palette = useRef({ ink: '#111', brand: '#b63b12', mute: '#999' })
  const redrawRef = useRef<() => void>(() => {})
  const propsRef = useRef({ base, locked })
  const { theme } = useTheme()
  const animated = useRevealOn()

  useEffect(() => {
    propsRef.current = { base, locked }
    redrawRef.current()
  }, [base, locked])

  useEffect(() => {
    const read = (element: HTMLSpanElement | null, fallback: string) => (element ? getComputedStyle(element).color : fallback)
    palette.current = { ink: read(probes.current.ink, '#111'), brand: read(probes.current.brand, '#b63b12'), mute: read(probes.current.mute, '#999') }
    redrawRef.current()
  }, [theme])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const still = !animated || prefersReducedMotion()
    let width = 0
    let height = 0
    let frame = 0
    let running = false
    let visible = false

    const draw = (now: number) => {
      context.clearRect(0, 0, width, height)
      const { ink, brand, mute } = palette.current
      const { base: center, locked: held } = propsRef.current
      const rates = history.current
      const padX = 12
      const padY = 18
      const step = (width - padX * 2) / (HISTORY - 1)
      const glide = still ? 0 : Math.min(1, (performance.now() - tickAt.current) / TICK_MS)
      const yOf = (value: number) => {
        const unit = (value - center) / (center * SPREAD)
        return height / 2 - Math.max(-1, Math.min(1, unit)) * (height / 2 - padY)
      }

      // The base price: a dashed line in the middle.
      context.strokeStyle = mute
      context.globalAlpha = 0.35
      context.lineWidth = 1
      context.setLineDash([2, 6])
      context.beginPath()
      context.moveTo(0, height / 2)
      context.lineTo(width, height / 2)
      context.stroke()
      context.setLineDash([])

      // A hairline through the dots, so that the eye follows the price.
      const points: { x: number; y: number }[] = rates.map((value, index) => ({
        x: padX + (index - glide) * step,
        y: yOf(value) + (still ? 0 : Math.sin(now / 700 + index * 1.7) * 1.6),
      }))
      context.strokeStyle = ink
      context.globalAlpha = 0.18
      context.beginPath()
      points.forEach((point, index) => (index === 0 ? context.moveTo(point.x, point.y) : context.lineTo(point.x, point.y)))
      context.stroke()

      // The dots: fainter towards the past.
      context.fillStyle = ink
      points.forEach((point, index) => {
        if (point.x < -4) return
        const age = index / (HISTORY - 1)
        context.globalAlpha = 0.25 + 0.75 * age
        context.beginPath()
        context.arc(point.x, point.y, 1.8 + age * 1.2, 0, Math.PI * 2)
        context.fill()
      })

      // The newest rate: orange, with a ring that breathes.
      const last = points[points.length - 1]
      if (last) {
        const breath = still ? 0 : (Math.sin(now / 450) + 1) / 2
        context.strokeStyle = brand
        context.fillStyle = brand
        context.globalAlpha = 0.3 + 0.3 * breath
        context.beginPath()
        context.arc(last.x, last.y, 7 + breath * 3, 0, Math.PI * 2)
        context.stroke()
        context.globalAlpha = 1
        context.beginPath()
        context.arc(last.x, last.y, 3.6, 0, Math.PI * 2)
        context.fill()
      }

      // A held price: a straight orange line that the moving dots cross.
      if (held !== null) {
        const y = yOf(held)
        context.globalAlpha = 1
        context.strokeStyle = brand
        context.lineWidth = 2
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(width, y)
        context.stroke()
      }
      context.globalAlpha = 1
    }

    const tick = (time: number) => {
      draw(time)
      running = visible
      frame = running ? requestAnimationFrame(tick) : 0
    }
    const start = () => {
      if (running || !visible || still) return
      running = true
      frame = requestAnimationFrame(tick)
    }
    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      draw(performance.now())
    }
    redrawRef.current = () => draw(performance.now())
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
    })
    visibility.observe(canvas)
    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
      redrawRef.current = () => {}
    }
  }, [animated, history, tickAt])

  return (
    <div className="relative size-full">
      <span ref={(element) => void (probes.current.ink = element)} className="hidden text-typography-primary" />
      <span ref={(element) => void (probes.current.brand = element)} className="hidden text-typography-brand" />
      <span ref={(element) => void (probes.current.mute = element)} className="hidden text-typography-tertiary" />
      <canvas ref={canvasRef} data-el="ramp__quote-chart" aria-hidden="true" className="block size-full" />
    </div>
  )
}
