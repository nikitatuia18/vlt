import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../../lib/media'
import { useTheme } from '../../lib/theme'
import { useRevealOn } from '../../motion/useReveal'
import { COIN, EXAMPLE, formatAmount, formatRate, getText, quote, sendText, type Direction } from './demo'
import { Cloud, type Palette, type Side } from './particles'
import { AmountField, DirectionSwitch, ReceiptCell } from './parts'
import { heroScene, receiptLabels } from './sceneText'

/*
 * The scene of the hero of the ramp page: one swarm of dots that is the euro on the left (the bank) and, after it has crossed the door in the
 * middle, the ₮ on the right (the wallet), and back. The dots float like the dots of the site (slow orbits, a spring that overshoots, the mouse
 * pushes them away); a few of them turn orange at the door and rise: that is the fee, said in words in the caption and in the receipt below.
 * It plays by itself, there and back, until the visitor touches something; the switch of the direction and "Convert" play it again.
 * It runs only while it is on the screen; with reduced motion (or with the appearance animations off) it stands still on the finished picture.
 */

/** Seconds the finished picture stays before the next crossing (the other way) starts by itself. */
const REST_SECONDS = 2.6
const OFFSCREEN = -1000

const sideOf = (direction: Direction): Side => (direction === 'on' ? 0 : 1)

export function RampScene() {
  const animated = useRevealOn()
  const { theme } = useTheme()
  const [direction, setDirection] = useState<Direction>('on')
  const [amount, setAmount] = useState<number>(EXAMPLE.amount)
  // Pressing "Convert" plays the crossing again in the same direction.
  const [round, setRound] = useState(0)
  const [touch] = useState(() => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const probes = useRef<Record<keyof Palette, HTMLSpanElement | null>>({ ink: null, dot: null, brand: null, mute: null })
  const palette = useRef<Palette>({ ink: '#111', dot: '#666', brand: '#b63b12', mute: '#999' })
  const redrawRef = useRef<() => void>(() => {})
  const playRef = useRef<(next: Direction) => void>(() => {})
  const autoRef = useRef<() => void>(() => {})
  const timer = useRef(0)
  const touched = useRef(false)
  // The sum of the fee, written in the currency that is sent: the caption at the door says it.
  const feeText = useRef('')

  // The colors come from the tokens (read from probe elements), so the picture follows the theme.
  useEffect(() => {
    const read = (element: HTMLSpanElement | null, fallback: string) => (element ? getComputedStyle(element).color : fallback)
    palette.current = { ink: read(probes.current.ink, '#111'), dot: read(probes.current.dot, '#666'), brand: read(probes.current.brand, '#b63b12'), mute: read(probes.current.mute, '#999') }
    redrawRef.current()
  }, [theme])

  // The visitor has taken over: the crossing no longer starts by itself.
  const takeOver = () => {
    touched.current = true
    window.clearTimeout(timer.current)
  }

  // By itself, there and back: when a crossing is done, a pause and the same crossing the other way.
  useEffect(() => {
    autoRef.current = () => {
      if (touched.current) return
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setDirection((current) => (current === 'on' ? 'off' : 'on')), REST_SECONDS * 1000)
    }
    return () => window.clearTimeout(timer.current)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const cloud = new Cloud()
    cloud.onDone = () => autoRef.current()
    let frame = 0
    let running = false
    let visible = false
    let seen = false
    let pending: Direction | null = null
    let last = 0
    let mouse = { x: OFFSCREEN, y: OFFSCREEN }
    // The last direction asked for: where the dots stand when nothing moves.
    let wanted: Direction = 'on'

    const labels = (now: number) => {
      const family = getComputedStyle(canvas).fontFamily
      const small = cloud.width < 600
      const below = cloud.middleY + cloud.size / 2 + (small ? 22 : 30)
      const text = (value: string, x: number, y: number, size: number, color: string, weight: number, alpha = 1) => {
        context.font = `${weight} ${size}px ${family}`
        context.textAlign = 'center'
        context.textBaseline = 'alphabetic'
        context.fillStyle = color
        context.globalAlpha = alpha
        context.fillText(value, x, y)
        context.globalAlpha = 1
      }
      const { ink, dot, brand } = palette.current
      const body = small ? 12 : 14
      const caption = small ? 11 : 12
      text(heroScene.bank, cloud.leftX, below, body, ink, 600)
      text(heroScene.bankCaption, cloud.leftX, below + 18, caption, dot, 500)
      text(heroScene.wallet, cloud.rightX, below, body, ink, 600)
      text(heroScene.walletCaption, cloud.rightX, below + 18, caption, dot, 500)
      // Inside the door: whose it is and what it takes (a small door only has room for the fee).
      const middleX = cloud.width / 2
      const active = cloud.glow > 0.2
      if (small) {
        text('0.5%', middleX, cloud.middleY - 1, caption, active ? brand : ink, 600)
        text('fee', middleX, cloud.middleY + 13, caption - 1, dot, 500)
      } else {
        text(heroScene.door, middleX, cloud.middleY - 2, body - 1, ink, 600)
        text(heroScene.doorFee, middleX, cloud.middleY + 16, caption, active ? brand : dot, 600)
      }
      const fee = cloud.feeVisible(now)
      if (fee > 0) text(heroScene.feeCaption(feeText.current), middleX, cloud.middleY - cloud.doorRadius - 16, body, brand, 600, fee)
    }

    const draw = (now: number) => {
      context.clearRect(0, 0, cloud.width, cloud.height)
      cloud.draw(context, palette.current, now)
      labels(now)
    }

    const tick = (time: number) => {
      const now = time / 1000
      const dt = last ? Math.min(0.05, now - last) : 1 / 60
      last = now
      cloud.step(dt, now, mouse.x, mouse.y)
      draw(now)
      running = visible
      frame = running ? requestAnimationFrame(tick) : 0
    }
    const start = () => {
      if (running || !visible) return
      running = true
      last = 0
      frame = requestAnimationFrame(tick)
    }

    const resize = () => {
      // The layout size, not the one on the screen: the card grows into place with a scale when the page appears.
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      cloud.layout(width, height)
      if (!animated) cloud.settle(wanted === 'on' ? 1 : 0)
      draw(performance.now() / 1000)
    }

    const play = (next: Direction) => {
      wanted = next
      if (!animated) {
        cloud.settle(next === 'on' ? 1 : 0)
        draw(performance.now() / 1000)
        return
      }
      if (!visible) {
        pending = next
        return
      }
      cloud.play(sideOf(next), performance.now() / 1000)
      start()
    }
    playRef.current = play
    redrawRef.current = () => draw(performance.now() / 1000)

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (!visible || !animated) return
      if (pending || !seen) {
        // The first time the picture is seen (or when a crossing was asked for out of sight): it starts now.
        cloud.play(sideOf(pending ?? wanted), performance.now() / 1000)
        pending = null
        seen = true
      }
      start()
    })
    visibility.observe(canvas)

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const rect = canvas.getBoundingClientRect()
      const k = canvas.clientWidth / (rect.width || 1)
      mouse = { x: (event.clientX - rect.left) * k, y: (event.clientY - rect.top) * k }
    }
    const onLeave = () => {
      mouse = { x: OFFSCREEN, y: OFFSCREEN }
    }
    if (animated && !prefersReducedMotion()) {
      canvas.addEventListener('pointermove', onMove, { passive: true })
      canvas.addEventListener('pointerleave', onLeave)
    }

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      playRef.current = () => {}
      redrawRef.current = () => {}
    }
  }, [animated])

  // A new direction (the switch, or the automatic turn) or "Convert": the crossing plays again.
  useEffect(() => {
    playRef.current(direction)
  }, [direction, round, animated])

  const valid = amount > 0
  const result = quote(direction, amount, EXAMPLE.rate)
  const code = EXAMPLE.code
  useEffect(() => {
    feeText.current = valid ? sendText(direction, code, result.fee) : ''
  }, [valid, direction, code, result.fee])

  return (
    <div data-el="ramp__hero-scene-illustration" className="flex size-full flex-col">
      <span ref={(element) => void (probes.current.ink = element)} className="hidden text-typography-primary" />
      <span ref={(element) => void (probes.current.brand = element)} className="hidden text-typography-brand" />
      <span ref={(element) => void (probes.current.dot = element)} className="hidden text-typography-secondary" />
      <span ref={(element) => void (probes.current.mute = element)} className="hidden text-typography-tertiary" />
      <div className="relative h-72 tablet:h-96 desktop:h-auto desktop:min-h-0 desktop:flex-1">
        <canvas ref={canvasRef} aria-hidden="true" className="block size-full font-sans" />
      </div>

      <div className="px-4 pb-4 tablet:px-8 tablet:pb-8">
        <div
          data-el="ramp__hero-scene-panel"
          className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-32 bg-surface-page p-4 ring-1 ring-border-subtle ring-inset tablet:p-6"
          aria-live="polite"
        >
          <div className="flex flex-col gap-4 tablet:flex-row tablet:items-start tablet:justify-between">
            <DirectionSwitch
              name="ramp__hero-scene"
              direction={direction}
              onChange={(next) => {
                takeOver()
                setDirection(next)
              }}
            />
            <div className="flex w-full flex-col gap-2 tablet:w-auto tablet:flex-row tablet:items-center tablet:gap-3">
              <label className="type-ui-sm whitespace-nowrap text-typography-secondary" htmlFor="ramp-hero-amount">
                {receiptLabels.send}
              </label>
              <div className="flex items-center gap-3">
                <AmountField
                  id="ramp-hero-amount"
                  dataEl="ramp__hero-scene-amount"
                  amount={amount}
                  code={direction === 'on' ? code : COIN}
                  codeFirst={direction === 'on'}
                  placeholder={heroScene.empty}
                  format={formatAmount}
                  onChange={(value) => {
                    takeOver()
                    setAmount(value)
                  }}
                />
                <button
                  type="button"
                  data-el="ramp__hero-scene-convert"
                  onClick={() => {
                    takeOver()
                    setRound((current) => current + 1)
                  }}
                  className="type-ui-md rounded-pill bg-surface-inverse px-5 py-3 whitespace-nowrap text-typography-inverse transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand"
                >
                  {heroScene.convert}
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-border-subtle pt-4 tablet:grid-cols-4">
            <ReceiptCell label={receiptLabels.send} value={valid ? sendText(direction, code, result.send) : heroScene.dash} name="ramp__hero-scene-send" />
            <ReceiptCell label={receiptLabels.fee} value={valid ? sendText(direction, code, result.fee) : heroScene.dash} name="ramp__hero-scene-fee" />
            <ReceiptCell label={receiptLabels.rate} value={`1 ${COIN} = ${code} ${formatRate(EXAMPLE.rate)}`} name="ramp__hero-scene-rate" className="col-span-2 tablet:col-span-1" />
            <ReceiptCell label={receiptLabels.get} value={valid ? getText(direction, code, result.get) : heroScene.dash} name="ramp__hero-scene-get" strong />
          </div>
          <p data-el="ramp__hero-scene-hint" className="type-ui-sm text-typography-secondary">
            {valid ? (touch ? heroScene.hintTouch : heroScene.hint) : heroScene.emptyLong}
          </p>
        </div>
      </div>
    </div>
  )
}
