import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../../lib/media'
import { useTheme } from '../../lib/theme'
import { createFlatLandDots, LAT_SPAN, LON_SPAN, MAP, type FlatDot } from './flatLand'
import { amounts, coins, formatAmount, networks, SETTLEMENT_CURRENCY, settledAmount, type Coin, type Network } from './demo'
import { heroScene, type PaymentStatus } from './sceneText'

/*
 * The scene of the hero of Crypto Processing: the world as a map of dots (the same land as the globe of the Global block, seen flat).
 * Payments fly in on arcs from places around the world and land on the point of the company account (Europe); the panel shows the status of
 * the latest one: Waiting → Confirmed → Settled. Click the map (or press the button) to send a payment from that place; the mouse pushes the dots away
 * like in the dot background of the site. It runs only while it is on the screen; with reduced motion the map stands still with one landed payment.
 */

/** The company account on the map (degrees): the arcs end here. */
const ACCOUNT = { lon: 10, lat: 50 }

/** Places the automatic payments start from (lat, lon in degrees). */
const SOURCES: readonly FlatDot[] = [
  { lat: 38, lon: -98 },
  { lat: -12, lon: -52 },
  { lat: 22, lon: 79 },
  { lat: 42, lon: 74 },
  { lat: -25, lon: 134 },
  { lat: 0, lon: 20 },
  { lat: 36, lon: 138 },
  { lat: 55, lon: -105 },
]

/** Seconds an arc takes, the share of it after which the payment counts as confirmed, and the pause between automatic payments. */
const FLIGHT_SECONDS = 1.6
const CONFIRMED_AT = 0.55
const GAP_SECONDS = [1.6, 3] as const
const MAX_IN_FLIGHT = 8

/** The mouse pushes the dots away within this many px (same formulas as `InteractiveDots`). */
const PUSH_RADIUS = 110
const PUSH_FORCE = 38
const EASE = 0.12

type Dot = { bx: number; by: number; x: number; y: number }
type DemoPayment = { coin: Coin; network: Network; amount: number }
type Payment = { id: number; from: FlatDot; start: number; info: DemoPayment; confirmed: boolean }
type Ring = { start: number }

const between = (low: number, high: number) => low + Math.random() * (high - low)
const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)]

export function DotMapScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const colors = useRef({ land: '#999', line: '#b63b12', text: '#666' })
  const probes = useRef<{ land: HTMLSpanElement | null; line: HTMLSpanElement | null; text: HTMLSpanElement | null }>({ land: null, line: null, text: null })
  const sendRef = useRef<(from?: FlatDot) => void>(() => {})
  const redrawRef = useRef<() => void>(() => {})
  const { theme } = useTheme()

  const [status, setStatus] = useState<PaymentStatus>('settled')
  const [latest, setLatest] = useState<DemoPayment>({ coin: 'USDT', network: 'Tron', amount: 250 })
  // After the visitor has sent a payment the hint asks for another place; on a screen without a mouse it says "tap".
  const [sentByVisitor, setSentByVisitor] = useState(false)
  const [touch] = useState(() => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches)

  // The colors come from the tokens (read from probe elements), so the map follows the theme.
  useEffect(() => {
    const read = (element: HTMLSpanElement | null, fallback: string) => (element ? getComputedStyle(element).color : fallback)
    colors.current = { land: read(probes.current.land, '#999'), line: read(probes.current.line, '#b63b12'), text: read(probes.current.text, '#666') }
    redrawRef.current()
  }, [theme])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const reduced = prefersReducedMotion()

    let width = 0
    let height = 0
    let dots: Dot[] = []
    let flatDots: FlatDot[] = []
    let layout = { x0: 0, y0: 0, w: 1, h: 1, spacing: 6 }
    let payments: Payment[] = []
    let rings: Ring[] = []
    let latestId = -1
    let nextId = 0
    let nextAuto = 0
    let frame = 0
    let running = false
    let visible = false
    let mouse = { x: -1000, y: -1000 }

    const toX = (lon: number) => layout.x0 + ((lon - MAP.lonFrom) / LON_SPAN) * layout.w
    const toY = (lat: number) => layout.y0 + ((MAP.latTop - lat) / LAT_SPAN) * layout.h
    const toLon = (x: number) => MAP.lonFrom + ((x - layout.x0) / layout.w) * LON_SPAN
    const toLat = (y: number) => MAP.latTop - ((y - layout.y0) / layout.h) * LAT_SPAN

    const build = () => {
      const columns = Math.max(60, Math.min(150, Math.round(width / 9)))
      const mapWidth = Math.min(width * 0.94, (height * 0.9 * LON_SPAN) / LAT_SPAN)
      const mapHeight = (mapWidth * LAT_SPAN) / LON_SPAN
      // On a narrow card the map stands in the upper part: the panel and the button take the lower one.
      const bias = width < 600 ? 0.3 : 0.5
      layout = { x0: (width - mapWidth) / 2, y0: (height - mapHeight) * bias, w: mapWidth, h: mapHeight, spacing: mapWidth / columns }
      flatDots = createFlatLandDots(columns)
      dots = flatDots.map((dot) => {
        const x = toX(dot.lon)
        const y = toY(dot.lat)
        return { bx: x, by: y, x, y }
      })
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      build()
      draw(performance.now())
    }

    /** The point of an arc (quadratic curve, bulging upwards in proportion to its length) at the share `t` of its way. */
    const arcAt = (from: FlatDot, t: number): [number, number] => {
      const x0 = toX(from.lon)
      const y0 = toY(from.lat)
      const x2 = toX(ACCOUNT.lon)
      const y2 = toY(ACCOUNT.lat)
      const lift = Math.min(0.32 * Math.hypot(x2 - x0, y2 - y0), height * 0.35)
      const x1 = (x0 + x2) / 2
      const y1 = (y0 + y2) / 2 - lift
      const u = 1 - t
      return [u * u * x0 + 2 * u * t * x1 + t * t * x2, u * u * y0 + 2 * u * t * y1 + t * t * y2]
    }

    const draw = (now: number) => {
      context.clearRect(0, 0, width, height)
      const { land, line, text } = colors.current

      // The land.
      context.fillStyle = land
      context.beginPath()
      const radius = Math.min(1.8, Math.max(0.8, layout.spacing * 0.17))
      for (const dot of dots) {
        context.moveTo(dot.x + radius, dot.y)
        context.arc(dot.x, dot.y, radius, 0, Math.PI * 2)
      }
      context.fill()

      // The account: a point with a soft ring that breathes, and its name.
      const ax = toX(ACCOUNT.lon)
      const ay = toY(ACCOUNT.lat)
      const breath = (Math.sin(now / 600) + 1) / 2
      context.strokeStyle = line
      context.fillStyle = line
      context.globalAlpha = 0.25 + 0.2 * breath
      context.lineWidth = 1
      context.beginPath()
      context.arc(ax, ay, 8 + 4 * breath, 0, Math.PI * 2)
      context.stroke()
      context.globalAlpha = 1
      context.beginPath()
      context.arc(ax, ay, 4, 0, Math.PI * 2)
      context.fill()
      context.fillStyle = text
      context.font = `500 ${width < 600 ? 10 : 12}px ${getComputedStyle(canvas).fontFamily}`
      context.textBaseline = 'middle'
      context.fillText(heroScene.account, ax + 14, ay - 14)

      // The rings where payments landed.
      for (const ring of rings) {
        const progress = (now - ring.start) / 900
        if (progress < 0 || progress > 1) continue
        context.strokeStyle = line
        context.globalAlpha = (1 - progress) * 0.7
        context.beginPath()
        context.arc(ax, ay, 6 + progress * 34, 0, Math.PI * 2)
        context.stroke()
      }
      context.globalAlpha = 1

      // The payments on their way: a fading trail and a bright head.
      context.strokeStyle = line
      context.lineCap = 'round'
      for (const payment of payments) {
        const t = Math.min(1, (now - payment.start) / (FLIGHT_SECONDS * 1000))
        if (t <= 0) continue
        const steps = 18
        for (let step = 0; step < steps; step++) {
          const from = Math.max(0, t - ((step + 1) / steps) * 0.34)
          const to = Math.max(0, t - (step / steps) * 0.34)
          if (to <= from) continue
          const [x1, y1] = arcAt(payment.from, from)
          const [x2, y2] = arcAt(payment.from, to)
          context.globalAlpha = (1 - step / steps) * 0.9
          context.lineWidth = 1 + (1 - step / steps) * 1.2
          context.beginPath()
          context.moveTo(x1, y1)
          context.lineTo(x2, y2)
          context.stroke()
        }
        const [hx, hy] = arcAt(payment.from, t)
        context.globalAlpha = 1
        context.fillStyle = line
        context.beginPath()
        context.arc(hx, hy, 3, 0, Math.PI * 2)
        context.fill()
        // Where the payment starts: a small ring.
        context.globalAlpha = Math.max(0, 1 - t * 2) * 0.6
        context.beginPath()
        context.arc(toX(payment.from.lon), toY(payment.from.lat), 4 + t * 10, 0, Math.PI * 2)
        context.stroke()
      }
      context.globalAlpha = 1
    }

    const send = (from?: FlatDot) => {
      if (from) setSentByVisitor(true)
      if (payments.length >= MAX_IN_FLIGHT) return
      const source = from ?? pick(SOURCES)
      const info: DemoPayment = { coin: pick(coins), network: pick(networks), amount: pick(amounts) }
      const payment: Payment = { id: nextId++, from: source, start: performance.now(), info, confirmed: false }
      payments.push(payment)
      latestId = payment.id
      setLatest(info)
      setStatus('waiting')
      start()
    }
    sendRef.current = send

    const step = (now: number) => {
      // The dots: pushed by the mouse, they return to their places.
      let moving = false
      for (const dot of dots) {
        const dx = mouse.x - dot.x
        const dy = mouse.y - dot.y
        const distance = Math.hypot(dx, dy)
        if (distance < PUSH_RADIUS && distance > 0) {
          const push = ((PUSH_RADIUS - distance) / PUSH_RADIUS) * PUSH_FORCE
          dot.x += (-(dx / distance) * push) * 0.2
          dot.y += (-(dy / distance) * push) * 0.2
        }
        const px = dot.x
        const py = dot.y
        dot.x += (dot.bx - dot.x) * EASE
        dot.y += (dot.by - dot.y) * EASE
        if (Math.abs(dot.x - px) > 0.01 || Math.abs(dot.y - py) > 0.01) moving = true
      }

      // The events of the payments: confirmed halfway, settled on landing.
      const landed: Payment[] = []
      for (const payment of payments) {
        const t = (now - payment.start) / (FLIGHT_SECONDS * 1000)
        if (!payment.confirmed && t >= CONFIRMED_AT) {
          payment.confirmed = true
          if (payment.id === latestId) setStatus('confirmed')
        }
        if (t >= 1) landed.push(payment)
      }
      for (const payment of landed) {
        rings.push({ start: now })
        if (payment.id === latestId) setStatus('settled')
      }
      if (landed.length) payments = payments.filter((payment) => !landed.includes(payment))
      rings = rings.filter((ring) => now - ring.start < 900)

      // The next automatic payment.
      if (now >= nextAuto) {
        nextAuto = now + between(GAP_SECONDS[0], GAP_SECONDS[1]) * 1000
        send()
      }
      return moving
    }

    const tick = (now: number) => {
      step(now)
      draw(now)
      frame = visible ? requestAnimationFrame(tick) : 0
      running = visible
    }

    function start() {
      if (running || !visible || reduced) return
      running = true
      frame = requestAnimationFrame(tick)
    }

    const updateMouse = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') updateMouse(event)
    }
    const onLeave = () => {
      mouse = { x: -1000, y: -1000 }
    }
    const onDown = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const lon = toLon(event.clientX - rect.left)
      const lat = toLat(event.clientY - rect.top)
      send({ lon: Math.min(MAP.lonTo, Math.max(MAP.lonFrom, lon)), lat: Math.min(MAP.latTop, Math.max(MAP.latBottom, lat)) })
    }

    redrawRef.current = () => draw(performance.now())
    resize()

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) {
        nextAuto = performance.now() + 400
        start()
      }
    })
    visibility.observe(canvas)

    if (reduced) {
      // One payment that has landed, nothing moves.
      payments = []
      rings = []
    } else {
      canvas.addEventListener('pointermove', onMove, { passive: true })
      canvas.addEventListener('pointerleave', onLeave)
      canvas.addEventListener('pointerdown', onDown)
    }

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointerdown', onDown)
      sendRef.current = () => {}
    }
  }, [])

  const dotColor = status === 'settled' ? 'bg-typography-brand' : 'bg-typography-secondary'

  return (
    <div data-el="crypto-processing__hero-scene-illustration" className="relative size-full">
      <span ref={(element) => void (probes.current.land = element)} className="hidden text-surface-dots" />
      <span ref={(element) => void (probes.current.line = element)} className="hidden text-typography-brand" />
      <span ref={(element) => void (probes.current.text = element)} className="hidden text-typography-secondary" />
      <canvas ref={canvasRef} aria-hidden="true" className="block size-full cursor-crosshair font-sans" />

      <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-4 tablet:inset-x-8 tablet:top-8">
        <p data-el="crypto-processing__hero-scene-hint" className="type-ui-sm text-typography-secondary">
          {sentByVisitor ? heroScene.hintAgain : touch ? heroScene.hintTouch : heroScene.hint}
        </p>
        <p className="type-ui-sm text-typography-tertiary">{heroScene.demo}</p>
      </div>

      <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3 tablet:inset-x-auto tablet:bottom-8 tablet:left-8 tablet:flex-row tablet:items-end tablet:gap-4">
        <div data-el="crypto-processing__hero-scene-panel" className="flex w-full flex-col gap-2 rounded-32 bg-surface-page p-4 ring-1 ring-border-subtle ring-inset tablet:w-60" aria-live="polite">
          <p className="type-ui-sm text-typography-secondary">{heroScene.panelTitle}</p>
          <p className="type-heading-sm text-typography-primary">
            {formatAmount(latest.amount)} {latest.coin}
            <span className="type-ui-sm pl-2 text-typography-secondary">{latest.network}</span>
          </p>
          <p data-el="crypto-processing__hero-scene-status" data-status={status} className="type-ui-md inline-flex items-center gap-2 text-typography-primary">
            <span className={`size-2 rounded-pill ${dotColor}`} />
            {heroScene.status[status]}
            {status === 'settled' && (
              <span className="type-ui-sm text-typography-secondary">
                +{formatAmount(settledAmount(latest.amount))} {SETTLEMENT_CURRENCY}
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          data-el="crypto-processing__hero-scene-send"
          onClick={() => {
            setSentByVisitor(true)
            sendRef.current()
          }}
          className="type-ui-md rounded-pill bg-surface-inverse px-5 py-3 whitespace-nowrap text-typography-inverse transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand"
        >
          {heroScene.button}
        </button>
      </div>
    </div>
  )
}
