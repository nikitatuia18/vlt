import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../../lib/media'
import { useTheme } from '../../lib/theme'
import { useRevealOn } from '../../motion/useReveal'
import avatarBank from '../../assets/features/avatar-bank.png'
import avatarCard from '../../assets/features/avatar-card.png'
import avatarCrypto from '../../assets/features/avatar-crypto.png'
import { Crowd, headsFor, type Palette } from './crowd'
import { heroCounts, heroNumbers, integer, PER_RECIPIENT, START_BALANCE, usdt, type HeroCount } from './demo'
import { heroPhotos } from './photos'
import { heroScene } from './sceneText'

/*
 * The scene of the hero of the Mass Payouts page: a balance (a round cloud of dots) on the left and a floating crowd of recipients on the right.
 * The slider sets how many recipients there are (10 … 10,000), "Pay everyone" sends a packet from the balance to each of them, and every recipient that is
 * reached lights up and turns dark; the counter and the balance follow. One press, any number: the effort does not grow. The dots float like the dots of the
 * site. It pays once by itself when it is first seen, then waits for the visitor. It runs only while it is on the screen; with reduced motion (or with the
 * appearance animations off) the crowd stands still, already paid.
 */

const OFFSCREEN = -1000
type Phase = 'idle' | 'running' | 'done'

/** Seconds after everything is paid that the scene goes back to the start by itself. */
const RESET_SECONDS = 14

const standIns = [avatarBank, avatarCrypto, avatarCard]
// Every photo of the folder takes part in the random choice; if there are fewer than 12, the portraits of the home page fill the rest.
const faceUrls = Array.from({ length: Math.max(12, heroPhotos.length) }, (_, index) => (index < heroPhotos.length ? heroPhotos[index] : standIns[(index - heroPhotos.length) % standIns.length]))

export function CrowdScene() {
  const animated = useRevealOn()
  const { theme } = useTheme()
  const [index, setIndex] = useState(2)
  const [phase, setPhase] = useState<Phase>(animated ? 'idle' : 'done')
  const [paid, setPaid] = useState(0)
  const [heads, setHeads] = useState(headsFor(1000))
  const count: HeroCount = heroCounts[index]
  const numbers = heroNumbers(count)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const probes = useRef<Record<keyof Palette, HTMLSpanElement | null>>({ ink: null, dot: null, brand: null, mute: null, disc: null })
  const palette = useRef<Palette>({ ink: '#111', dot: '#666', brand: '#b63b12', mute: '#999', disc: '#eee' })
  const engine = useRef<Crowd | null>(null)
  const redraw = useRef<() => void>(() => {})
  const start = useRef<() => void>(() => {})
  // What the picture writes under the clouds: it changes without the scene being built again.
  const labels = useRef({ balance: '', recipients: '' })
  const reported = useRef(0)
  const seen = useRef(false)
  const touched = useRef(false)
  const phaseNow = useRef<Phase>(phase)
  useEffect(() => {
    phaseNow.current = phase
  }, [phase])

  const paidNow = phase === 'done' ? count : paid
  const balance = START_BALANCE - paidNow * PER_RECIPIENT
  useEffect(() => {
    labels.current = { balance: usdt(balance), recipients: heroScene.countries(numbers.countries) }
    redraw.current()
  }, [balance, numbers.countries])

  useEffect(() => {
    const read = (element: HTMLSpanElement | null, fallback: string) => (element ? getComputedStyle(element).color : fallback)
    palette.current = { ink: read(probes.current.ink, '#111'), dot: read(probes.current.dot, '#666'), brand: read(probes.current.brand, '#b63b12'), mute: read(probes.current.mute, '#999'), disc: read(probes.current.disc, '#eee') }
    redraw.current()
  }, [theme])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const crowd = new Crowd()
    engine.current = crowd
    // The photos, round and round; when one has loaded, the picture is drawn again.
    crowd.faces = faceUrls.map((source) => {
      const image = new Image()
      image.onload = () => redraw.current()
      image.src = source
      return image
    })
    const still = !animated || prefersReducedMotion()
    let frame = 0
    let running = false
    let visible = false
    let last = 0
    let mouse = { x: OFFSCREEN, y: OFFSCREEN }

    const caption = (value: string, x: number, y: number, size: number, color: string, weight: number, alpha = 1) => {
      context.font = `${weight} ${size}px ${getComputedStyle(canvas).fontFamily}`
      context.textAlign = 'center'
      context.textBaseline = 'alphabetic'
      context.fillStyle = color
      context.globalAlpha = alpha
      context.fillText(value, x, y)
      context.globalAlpha = 1
    }

    const draw = (now: number) => {
      context.clearRect(0, 0, crowd.width, crowd.height)
      crowd.draw(context, palette.current, now)
      const { ink, dot } = palette.current
      const small = crowd.width < 600
      const body = small ? 12 : 14
      const note = small ? 11 : 12
      const lowest = Math.max(crowd.bottom, crowd.balance.y + crowd.balance.radius) + (small ? 26 : 34)
      caption(heroScene.balance, crowd.balance.x, lowest, body, ink, 600)
      caption(labels.current.balance, crowd.balance.x, lowest + 18, note, dot, 500)
      caption(heroScene.recipients, crowd.center, lowest, body, ink, 600)
      caption(labels.current.recipients, crowd.center, lowest + 18, note, dot, 500)
    }

    const tick = (time: number) => {
      const now = time / 1000
      const dt = last ? Math.min(0.05, now - last) : 1 / 60
      last = now
      crowd.step(dt, now, mouse.x, mouse.y)
      draw(now)
      running = visible
      frame = running ? requestAnimationFrame(tick) : 0
    }
    const wake = () => {
      if (running || !visible || still) return
      running = true
      last = 0
      frame = requestAnimationFrame(tick)
    }

    crowd.onProgress = (fraction) => {
      // The counter is told a few times a second, not every frame.
      const at = performance.now()
      if (at - reported.current < 70 && fraction < 1) return
      reported.current = at
      setPaid(Math.round(fraction * crowd.count))
    }
    crowd.onDone = () => setPhase('done')

    const resize = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      crowd.layout(width, height)
      setHeads(crowd.headCount)
      // A new size remakes the picture: if everything was paid, it stands paid again.
      if (still || phaseNow.current === 'done') crowd.finish()
      draw(performance.now() / 1000)
    }

    start.current = () => {
      if (still) {
        crowd.finish()
        setPaid(crowd.count)
        setPhase('done')
        draw(performance.now() / 1000)
        return
      }
      crowd.pay(performance.now() / 1000)
      setPhase('running')
      wake()
    }
    redraw.current = () => draw(performance.now() / 1000)

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (!visible) return
      wake()
      // The first time it is seen it pays once by itself, so that the picture explains itself.
      if (!seen.current && !still) {
        seen.current = true
        window.setTimeout(() => {
          if (!touched.current) start.current()
        }, 900)
      }
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
    if (!still) {
      canvas.addEventListener('pointermove', onMove, { passive: true })
      canvas.addEventListener('pointerleave', onLeave)
    }

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      engine.current = null
      start.current = () => {}
      redraw.current = () => {}
    }
  }, [animated])

  // A while after everything is paid the scene goes back to the start by itself (the money is back in the balance, the heads are dim again).
  useEffect(() => {
    if (phase !== 'done' || !animated) return
    const timer = window.setTimeout(() => {
      engine.current?.reset(performance.now() / 1000)
      setPaid(0)
      setPhase('idle')
    }, RESET_SECONDS * 1000)
    return () => window.clearTimeout(timer)
  }, [phase, animated])

  const choose = (next: number) => {
    if (phase === 'running') return
    touched.current = true
    setIndex(next)
    setPaid(0)
    const crowd = engine.current
    if (animated && !prefersReducedMotion()) {
      crowd?.setCount(heroCounts[next])
      setPhase('idle')
    } else {
      crowd?.setCount(heroCounts[next])
      crowd?.finish()
      setPaid(heroCounts[next])
      setPhase('done')
    }
    if (crowd) setHeads(crowd.headCount)
    redraw.current()
  }

  const pay = () => {
    if (phase === 'running') return
    touched.current = true
    if (phase === 'done') {
      engine.current?.reset(performance.now() / 1000)
      setPaid(0)
    }
    start.current()
  }

  const counter = heroScene.counter(integer(paidNow), integer(count))
  const status = phase === 'running' ? heroScene.running(integer(count)) : phase === 'done' ? heroScene.done(integer(count)) : heroScene.hint

  return (
    <div data-el="mass-payouts__hero-scene-illustration" data-heads={heads} className="flex size-full flex-col">
      <span ref={(element) => void (probes.current.ink = element)} className="hidden text-typography-primary" />
      <span ref={(element) => void (probes.current.dot = element)} className="hidden text-typography-secondary" />
      <span ref={(element) => void (probes.current.brand = element)} className="hidden text-typography-brand" />
      <span ref={(element) => void (probes.current.mute = element)} className="hidden text-typography-tertiary" />
      <span ref={(element) => void (probes.current.disc = element)} className="hidden text-surface-hover" />
      <div className="relative h-72 tablet:h-96 desktop:h-auto desktop:min-h-0 desktop:flex-1">
        <canvas ref={canvasRef} aria-hidden="true" data-el="mass-payouts__hero-scene-canvas" className="block size-full font-sans" />
      </div>

      <div className="px-4 pb-4 tablet:px-8 tablet:pb-8">
        <div
          data-el="mass-payouts__hero-scene-panel"
          className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-32 bg-surface-page p-4 ring-1 ring-border-subtle ring-inset tablet:p-6"
          aria-live="polite"
        >
          <div className="flex flex-col gap-4 tablet:flex-row tablet:items-start tablet:justify-between tablet:gap-8">
            <div className="flex w-full flex-col gap-2 tablet:max-w-sm">
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor="mass-payouts-recipients" className="type-ui-md text-typography-secondary">
                  {heroScene.slider}
                </label>
                <span data-el="mass-payouts__hero-scene-slider-value" className="type-ui-lg tabular-nums text-typography-primary">
                  {integer(count)}
                </span>
              </div>
              <input
                id="mass-payouts-recipients"
                data-el="mass-payouts__hero-scene-slider"
                type="range"
                min={0}
                max={heroCounts.length - 1}
                step={1}
                value={index}
                disabled={phase === 'running'}
                aria-label={heroScene.sliderAria}
                aria-valuetext={integer(count)}
                onChange={(event) => choose(Number(event.target.value))}
                className="w-full accent-typography-brand disabled:opacity-50"
              />
              <div className="type-ui-sm flex justify-between text-typography-secondary" aria-hidden="true">
                {heroCounts.map((value, position) => (
                  <button key={value} type="button" tabIndex={-1} disabled={phase === 'running'} onClick={() => choose(position)} className="tabular-nums transition-colors hover:text-typography-primary">
                    {integer(value)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 tablet:items-end tablet:gap-2">
              <button
                type="button"
                data-el="mass-payouts__hero-scene-pay"
                disabled={phase === 'running'}
                onClick={pay}
                className="type-ui-md w-full rounded-pill tablet:w-auto tablet:min-w-36 bg-surface-inverse px-5 py-3 whitespace-nowrap text-typography-inverse transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand disabled:opacity-60"
              >
                {phase === 'running' ? heroScene.paying : phase === 'done' ? heroScene.payAgain : heroScene.pay}
              </button>
              <p data-el="mass-payouts__hero-scene-counter" className="type-ui-lg tabular-nums text-typography-primary tablet:min-w-48 tablet:text-right">
                {counter}
              </p>
            </div>
          </div>
          <div className="border-t border-border-subtle pt-4">
            <p data-el="mass-payouts__hero-scene-total" className="type-ui-md text-typography-primary">
              {heroScene.total(usdt(numbers.total), integer(count), numbers.countries)}
            </p>
            <p data-el="mass-payouts__hero-scene-status" className="type-ui-sm pt-1 text-typography-secondary">
              {status}
            </p>
          </div>
        </div>
        <p data-el="mass-payouts__hero-scene-footnote" className="type-ui-sm mx-auto w-full max-w-3xl pt-3 text-center text-typography-secondary">
          {heroScene.footnote}
        </p>
      </div>
    </div>
  )
}
