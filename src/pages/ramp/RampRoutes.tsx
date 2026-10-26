import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { pins } from '../../components/blocks/Global/pins'
import { Container } from '../../components/ui/Container'
import { CornerDots } from '../../components/ui/CornerDots'
import { prefersReducedMotion } from '../../lib/media'
import { useTheme } from '../../lib/theme'
import { Reveal, RevealLines } from '../../motion/reveal'
import { useRevealOn } from '../../motion/useReveal'
import { Cables, type Palette, type PlugKind, type Pt } from './cables'
import { routesContent } from './content'
import { COIN, currencies, currencyOf, mainRail, networks, type CurrencyId, type Direction, type Network } from './demo'
import { DirectionSwitch } from './parts'
import { routesScene } from './sceneText'

/**
 * Block 1 of the ramp page: "Pick your route." `ramp__routes`.
 * A cable of dots runs from the plug in the chosen bank to the door, and from the door to the plug in the chosen network; the plugs can be dragged
 * to another socket (and a click on a card does the same), a plug that snaps into a socket throws a few sparks, and a signal runs along the cables in
 * the direction of the transfer. A line under the scene says the route in words. The choice is the block's own: the other scenes do not follow it.
 * Texts inside the scene are part of the picture: they are not revealed by words.
 */
export function RampRoutes() {
  const [direction, setDirection] = useState<Direction>('on')
  const [currency, setCurrency] = useState<CurrencyId>('eu')
  const [network, setNetwork] = useState<Network>('Tron')
  // The socket a dragged plug is over: `bank:eu` or `net:Tron`.
  const [over, setOver] = useState<string | null>(null)
  const animated = useRevealOn()
  const { theme } = useTheme()
  const [touch] = useState(() => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches)

  const sceneRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const doorRef = useRef<HTMLDivElement>(null)
  const bankRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const netRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const plugRefs = useRef<(HTMLDivElement | null)[]>([null, null])
  const probes = useRef<Record<keyof Palette, HTMLSpanElement | null>>({ dot: null, brand: null, mute: null })
  const palette = useRef<Palette>({ dot: '#666', brand: '#b63b12', mute: '#999' })
  const cables = useRef<Cables | null>(null)
  const refresh = useRef<() => void>(() => {})
  const live = useRef({ currency, network, direction })
  const dragging = useRef<PlugKind | null>(null)

  const chosen = currencyOf(currency)
  const pin = pins.find((item) => item.id === currency)
  const rail = mainRail(pin?.rails ?? '')

  useEffect(() => {
    live.current = { currency, network, direction }
    refresh.current()
  }, [currency, network, direction])

  useEffect(() => {
    const read = (element: HTMLSpanElement | null, fallback: string) => (element ? getComputedStyle(element).color : fallback)
    palette.current = { dot: read(probes.current.dot, '#666'), brand: read(probes.current.brand, '#b63b12'), mute: read(probes.current.mute, '#999') }
    refresh.current()
  }, [theme])

  useEffect(() => {
    const scene = sceneRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!scene || !canvas || !context) return

    const engine = new Cables()
    cables.current = engine
    const still = !animated || prefersReducedMotion()
    let frame = 0
    let running = false
    let visible = false
    let last = 0
    let measuredAt = 0
    let mouse: Pt | null = null

    const syncPlugs = () => {
      for (const kind of [0, 1] as const) {
        const element = plugRefs.current[kind]
        if (element) element.style.transform = `translate(${engine.plug[kind].x - 13}px, ${engine.plug[kind].y - 13}px)`
      }
    }

    const draw = (now: number) => {
      context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
      engine.draw(context, palette.current, now, live.current.direction, !still)
    }

    /** Where the sockets, the door and the plugs stand now, read from the page: the columns become rows on a narrow screen. */
    const measure = (snap: boolean) => {
      const door = doorRef.current
      if (!door) return
      const origin = scene.getBoundingClientRect()
      // The card grows into place with a scale: the places are turned back into layout px.
      const k = scene.clientWidth / (origin.width || 1)
      const box = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect()
        const left = (rect.left - origin.left) * k
        const top = (rect.top - origin.top) * k
        return { left, right: left + rect.width * k, top, bottom: top + rect.height * k, midX: left + (rect.width * k) / 2, midY: top + (rect.height * k) / 2 }
      }
      const doorBox = box(door)
      const firstBank = bankRefs.current[currencies[0].id]
      if (!firstBank) return
      const wide = doorBox.left > box(firstBank).right
      const banks: Record<string, Pt> = {}
      for (const item of currencies) {
        const element = bankRefs.current[item.id]
        if (!element) continue
        const b = box(element)
        banks[item.id] = wide ? { x: b.right, y: b.midY } : { x: b.midX, y: b.bottom }
      }
      const nets: Record<string, Pt> = {}
      for (const name of networks) {
        const element = netRefs.current[name]
        if (!element) continue
        const b = box(element)
        nets[name] = wide ? { x: b.left, y: b.midY } : { x: b.midX, y: b.top }
      }
      engine.setPorts(
        {
          wide,
          doorIn: wide ? { x: doorBox.left, y: doorBox.midY } : { x: doorBox.midX, y: doorBox.top },
          doorOut: wide ? { x: doorBox.right, y: doorBox.midY } : { x: doorBox.midX, y: doorBox.bottom },
          door: { x: doorBox.midX, y: doorBox.midY, radius: (doorBox.right - doorBox.left) / 2 },
          banks,
          nets,
        },
        live.current.currency,
        live.current.network,
        snap,
      )
      syncPlugs()
      for (const element of plugRefs.current) if (element) element.style.opacity = '1'
    }

    const tick = (time: number) => {
      const now = time / 1000
      const dt = last ? Math.min(0.05, now - last) : 1 / 60
      last = now
      // The card grows into place when the page appears (a scale, which no resize is told about): the sockets are read again twice a second.
      if (now - measuredAt > 0.5) {
        measuredAt = now
        measure(false)
      }
      engine.step(dt, now, mouse, live.current.direction)
      syncPlugs()
      draw(now)
      running = visible
      frame = running ? requestAnimationFrame(tick) : 0
    }
    const start = () => {
      if (running || !visible || still) return
      running = true
      last = 0
      frame = requestAnimationFrame(tick)
    }

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(canvas.clientWidth * pixelRatio)
      canvas.height = Math.round(canvas.clientHeight * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      measure(true)
      draw(performance.now() / 1000)
    }

    // A new choice (or direction, or theme): the plugs go to their sockets (at once when nothing moves), and the picture is drawn again.
    refresh.current = () => {
      engine.select(0, live.current.currency)
      engine.select(1, live.current.network)
      if (still) {
        measure(true)
        draw(performance.now() / 1000)
      } else start()
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(scene)
    void document.fonts?.ready.then(resize)
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) {
        measure(false)
        start()
      }
    })
    visibility.observe(scene)

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const rect = scene.getBoundingClientRect()
      const k = scene.clientWidth / (rect.width || 1)
      mouse = { x: (event.clientX - rect.left) * k, y: (event.clientY - rect.top) * k }
    }
    const onLeave = () => {
      mouse = null
    }
    if (!still) {
      scene.addEventListener('pointermove', onMove, { passive: true })
      scene.addEventListener('pointerleave', onLeave)
    }

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
      scene.removeEventListener('pointermove', onMove)
      scene.removeEventListener('pointerleave', onLeave)
      refresh.current = () => {}
      cables.current = null
    }
  }, [animated])

  /** A socket is chosen (by a click or by a plug dropped on it): the plug goes there and throws sparks. */
  const choose = useCallback((kind: PlugKind, id: string) => {
    const engine = cables.current
    const place = kind === 0 ? engine?.ports?.banks[id] : engine?.ports?.nets[id]
    if (place) engine?.spark(place, performance.now() / 1000)
    if (kind === 0) setCurrency(id as CurrencyId)
    else setNetwork(id as Network)
  }, [])

  const scenePoint = (event: ReactPointerEvent): Pt => {
    const scene = sceneRef.current
    const rect = scene?.getBoundingClientRect()
    const k = scene && rect ? scene.clientWidth / (rect.width || 1) : 1
    return { x: (event.clientX - (rect?.left ?? 0)) * k, y: (event.clientY - (rect?.top ?? 0)) * k }
  }
  const plugDown = (kind: PlugKind) => (event: ReactPointerEvent) => {
    dragging.current = kind
    event.currentTarget.setPointerCapture(event.pointerId)
    cables.current?.hold(kind, scenePoint(event))
  }
  const plugMove = (kind: PlugKind) => (event: ReactPointerEvent) => {
    if (dragging.current !== kind) return
    const point = scenePoint(event)
    cables.current?.hold(kind, point)
    const id = cables.current?.nearest(kind, point)
    setOver(id ? `${kind === 0 ? 'bank' : 'net'}:${id}` : null)
  }
  const plugUp = (kind: PlugKind) => (event: ReactPointerEvent) => {
    if (dragging.current !== kind) return
    dragging.current = null
    const id = cables.current?.nearest(kind, scenePoint(event))
    cables.current?.hold(kind, null)
    setOver(null)
    if (id) choose(kind, id)
  }

  const summary = routesScene.summary[direction](chosen.code, rail, network)
  const draggable = animated && !prefersReducedMotion()
  const plugClass = `absolute top-0 left-0 z-30 size-[26px] rounded-pill bg-surface-page opacity-0 ring-2 ring-typography-brand ring-inset ${
    draggable ? 'cursor-grab touch-none active:cursor-grabbing' : 'pointer-events-none'
  }`

  return (
    <section id="how-it-works" data-el="ramp__routes" aria-labelledby="ramp-routes-title" className="border-y border-border-subtle">
      <Container>
        <div className="relative flex flex-col items-center gap-8 py-12 column-lines tablet:gap-10 tablet:px-8 tablet:py-20 desktop:gap-12 desktop:px-10 desktop:py-35">
          <div className="flex flex-col items-center gap-4 text-center tablet:gap-6">
            <RevealLines
              id="ramp-routes-title"
              data-el="ramp__routes-title"
              className="type-heading-lg max-w-156 text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm"
              lines={[routesContent.title]}
            />
            <RevealLines as="p" delay={0.3} data-el="ramp__routes-intro" className="type-body-md max-w-150 text-typography-secondary tablet:type-body-lead" lines={[routesContent.intro]} />
          </div>

          <Reveal
            variant="card"
            data-el="ramp__routes-illustration"
            className="w-full rounded-32 bg-surface-subtle p-4 ring-1 ring-border-subtle ring-inset tablet:p-10 desktop:rounded-48 desktop:p-15"
          >
            <div className="mx-auto flex w-full max-w-240 flex-col gap-8">
              <div className="flex justify-center">
                <DirectionSwitch name="ramp__routes" direction={direction} onChange={setDirection} />
              </div>

              <div ref={sceneRef} className="relative grid gap-24 tablet:grid-cols-[1fr_auto_1fr] tablet:items-center tablet:gap-x-28 tablet:gap-y-0">
                <span ref={(element) => void (probes.current.dot = element)} className="hidden text-typography-secondary" />
                <span ref={(element) => void (probes.current.brand = element)} className="hidden text-typography-brand" />
                <span ref={(element) => void (probes.current.mute = element)} className="hidden text-typography-tertiary" />
                <canvas ref={canvasRef} aria-hidden="true" data-el="ramp__routes-cables" className="pointer-events-none absolute inset-0 z-20 size-full" />
                <div
                  ref={(element) => void (plugRefs.current[0] = element)}
                  aria-hidden="true"
                  data-el="ramp__routes-plug-bank"
                  className={plugClass}
                  onPointerDown={plugDown(0)}
                  onPointerMove={plugMove(0)}
                  onPointerUp={plugUp(0)}
                  onPointerCancel={plugUp(0)}
                >
                  <span className="absolute inset-[7px] rounded-pill bg-typography-brand" />
                </div>
                <div
                  ref={(element) => void (plugRefs.current[1] = element)}
                  aria-hidden="true"
                  data-el="ramp__routes-plug-network"
                  className={plugClass}
                  onPointerDown={plugDown(1)}
                  onPointerMove={plugMove(1)}
                  onPointerUp={plugUp(1)}
                  onPointerCancel={plugUp(1)}
                >
                  <span className="absolute inset-[7px] rounded-pill bg-typography-brand" />
                </div>

                <div className="relative z-10 flex flex-col gap-3">
                  <p className="type-ui-md text-typography-secondary">{routesScene.bankTitle}</p>
                  <ul className="grid grid-cols-2 gap-2 tablet:grid-cols-1">
                    {currencies.map((item) => {
                      const card = pins.find((entry) => entry.id === item.id)
                      const selected = item.id === currency
                      const hovered = over === `bank:${item.id}`
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            ref={(element) => void (bankRefs.current[item.id] = element)}
                            data-el={`ramp__routes-rail-${item.id}`}
                            aria-pressed={selected}
                            onClick={() => choose(0, item.id)}
                            className={`flex w-full min-w-0 items-center gap-3 rounded-pill px-3 py-2 text-left ring-1 transition-colors ring-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand ${
                              selected || hovered ? 'bg-surface-page ring-typography-brand' : 'bg-surface-page ring-border-subtle hover:bg-surface-hover'
                            }`}
                          >
                            {card && <img src={card.flag} alt="" width={24} height={24} className="size-6 shrink-0 rounded-pill object-cover" />}
                            <span className="type-ui-md text-typography-primary">{item.code}</span>
                            <span className="type-ui-sm min-w-0 truncate text-typography-secondary">{card?.rails}</span>
                          </button>
                        </li>
                      )
                    })}
                    <li className="type-ui-sm col-span-2 px-3 py-1 text-typography-secondary tablet:col-span-1">{routesScene.moreRails}</li>
                  </ul>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div
                    ref={doorRef}
                    data-el="ramp__routes-door"
                    className="type-ui-md flex size-24 items-center justify-center rounded-pill bg-surface-page text-center text-typography-primary ring-1 ring-border-medium ring-inset"
                  >
                    {routesScene.door}
                  </div>
                  <p data-el="ramp__routes-door-caption" className="type-ui-sm text-typography-secondary">
                    {direction === 'on' ? `${chosen.code} → ${COIN}` : `${COIN} → ${chosen.code}`}
                  </p>
                </div>

                <div className="relative z-10 flex flex-col gap-3">
                  <p className="type-ui-md text-typography-secondary">{routesScene.walletTitle}</p>
                  <ul className="grid grid-cols-3 gap-2 tablet:grid-cols-1">
                    {networks.map((item) => {
                      const selected = item === network
                      const hovered = over === `net:${item}`
                      return (
                        <li key={item}>
                          <button
                            type="button"
                            ref={(element) => void (netRefs.current[item] = element)}
                            data-el={`ramp__routes-network-${item.toLowerCase()}`}
                            aria-pressed={selected}
                            onClick={() => choose(1, item)}
                            className={`flex w-full flex-col rounded-32 px-4 py-2 text-left ring-1 transition-colors ring-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand ${
                              selected || hovered ? 'bg-surface-page ring-typography-brand' : 'bg-surface-page ring-border-subtle hover:bg-surface-hover'
                            }`}
                          >
                            <span className="type-ui-md text-typography-primary">{item}</span>
                            <span className="type-ui-sm text-typography-secondary">{routesScene.coin}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>

              <div data-el="ramp__routes-result" className="flex flex-col gap-3 rounded-32 bg-surface-page p-5 ring-1 ring-border-subtle ring-inset tablet:p-6" aria-live="polite">
                <p data-el="ramp__routes-summary" className="type-heading-sm text-typography-primary">
                  {summary}
                </p>
                <div className="grid gap-1 tablet:grid-cols-2 tablet:gap-6">
                  <p className="type-ui-md text-typography-secondary">{routesScene.payFrom[direction](chosen.code, rail, network)}</p>
                  <p className="type-ui-md text-typography-secondary">{routesScene.receive[direction](chosen.code, rail, network)}</p>
                </div>
                <p data-el="ramp__routes-hint" className="type-ui-sm text-typography-secondary">
                  {draggable && !touch ? routesScene.hintDrag : routesScene.hint}
                </p>
              </div>
            </div>
          </Reveal>

          <CornerDots edge="top" block="ramp-routes" />
          <CornerDots edge="bottom" block="ramp-routes" />
        </div>
      </Container>
    </section>
  )
}
