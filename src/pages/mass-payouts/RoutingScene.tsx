import { LayoutGroup, motion, type PanInfo } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Container } from '../../components/ui/Container'
import { CornerDots } from '../../components/ui/CornerDots'
import { Reveal, RevealLines } from '../../motion/reveal'
import { duration, easeOut } from '../../motion/tokens'
import { useRevealOn } from '../../motion/useReveal'
import { routingContent } from './content'
import { recipientPhoto } from './photos'
import { batchCountries, batchTotal, FAILING_ID, lanes, railLabel, recipients, usdt, type Lane, type Recipient } from './demo'
import { routingScene } from './sceneText'

type Phase = 'ready' | 'paying' | 'done'
type Status = 'ready' | 'sending' | 'paid' | 'failed' | 'retrying'

/** Where each recipient stands, by lane: the default lane of the rule, and whether the visitor has moved them. */
type Placement = Record<string, { lane: Lane; manual: boolean }>

const initial = (): Placement => Object.fromEntries(recipients.map((item) => [item.id, { lane: item.lane, manual: false }]))

/**
 * The hint for a visitor who does not know that the cards can be dragged: once the block is in view, two cards are carried slowly to another lane and back
 * (nothing stays moved). Each step is `[milliseconds from the start of the move, what happens]`; the touch of the visitor stops it at once.
 */
const DEMO_START = 1100
const DEMO_MOVES: { id: string; to: Lane }[] = [
  { id: 'r2', to: 'crypto' },
  { id: 'r4', to: 'card' },
]
/** Seconds one card needs to glide to the other lane in the demo (slower than the usual move: it is a show, not a reaction). */
const DEMO_GLIDE = 1.1
const DEMO_STEP = 6200

/** Milliseconds: the first payment of a lane starts after `FIRST`, the next ones every `GAP`; a payment takes `SEND`, a failed one is shown for `FAIL` and retried for `RETRY`. */
const FIRST = 350
const GAP = 260
const SEND = 750
const FAIL = 900
const RETRY = 900

const pill =
  'type-ui-md rounded-pill px-5 py-3 whitespace-nowrap transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand disabled:opacity-50'
const dark = `${pill} bg-surface-inverse text-typography-inverse hover:opacity-90`
const light = `${pill} bg-surface-subtle text-typography-primary ring-1 ring-border-subtle ring-inset hover:bg-surface-hover`

/** The status of one recipient `clock` milliseconds after "Pay", given its place in the lane (the order they are paid in). */
function statusAt(id: string, order: number, clock: number): Status {
  const start = FIRST + order * GAP
  if (clock < start) return 'ready'
  const sent = clock - start
  if (sent < SEND) return 'sending'
  if (id !== FAILING_ID) return 'paid'
  if (sent < SEND + FAIL) return 'failed'
  if (sent < SEND + FAIL + RETRY) return 'retrying'
  return 'paid'
}

/**
 * Block 2 of the Mass Payouts page: "Everyone is paid their way." `mass-payouts__routing`.
 * Three lanes (Bank transfer, Crypto, Card); the recipients stand in the lanes the rule "by country" puts them in. The visitor can drag
 * anyone to another lane (or pick the lane in a menu: keyboard, phone). "Pay": the lanes pay side by side, one payment fails once and is retried by itself,
 * and the result says "Paid 10 · Retried 1". Texts inside the scene are part of the picture: they are not revealed by words.
 */
export function RoutingScene() {
  const animated = useRevealOn()
  const [placement, setPlacement] = useState<Placement>(initial)
  const [phase, setPhase] = useState<Phase>('ready')
  const [clock, setClock] = useState(0)
  const [moved, setMoved] = useState(false)
  const [over, setOver] = useState<Lane | null>(null)
  /** The card that is picked up (white, with a shadow), and the card whose place in its lane is closed up: the next ones rise into it. */
  const [lifted, setLifted] = useState<string | null>(null)
  const [closed, setClosed] = useState<string | null>(null)
  const [demo, setDemo] = useState<'idle' | 'running' | 'done'>('idle')
  const demoTimers = useRef<number[]>([])
  const demoRunning = useRef(false)
  const sceneRef = useRef<HTMLDivElement>(null)
  const laneRefs = useRef<Record<Lane, HTMLDivElement | null>>({ bank: null, crypto: null, card: null })

  // The clock of the payment: it counts milliseconds while the lanes pay.
  const lastEnd = useMemo(() => {
    const longest = Math.max(...lanes.map((lane) => recipients.filter((item) => placement[item.id].lane === lane).length), 1)
    return FIRST + (longest - 1) * GAP + SEND + FAIL + RETRY
  }, [placement])
  useEffect(() => {
    if (phase !== 'paying') return
    const begun = performance.now()
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - begun
      if (elapsed >= lastEnd + 150) {
        window.clearInterval(timer)
        setClock(lastEnd + 150)
        setPhase('done')
      } else setClock(elapsed)
    }, 80)
    return () => window.clearInterval(timer)
  }, [phase, lastEnd])

  const inLane = (lane: Lane) => recipients.filter((item) => placement[item.id].lane === lane)
  const orderOf = (item: Recipient) => inLane(placement[item.id].lane).findIndex((other) => other.id === item.id)
  const statusOf = (item: Recipient): Status => (phase === 'ready' ? 'ready' : phase === 'done' ? 'paid' : statusAt(item.id, orderOf(item), clock))
  const paidCount = recipients.filter((item) => statusOf(item) === 'paid').length

  const move = (id: string, lane: Lane) => {
    if (phase !== 'ready' || placement[id].lane === lane) return
    setPlacement((current) => ({ ...current, [id]: { lane, manual: lane !== recipients.find((item) => item.id === id)?.lane } }))
    setMoved(true)
  }
  const laneAt = (x: number, y: number): Lane | null => {
    for (const lane of lanes) {
      const rect = laneRefs.current[lane]?.getBoundingClientRect()
      if (rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return lane
    }
    return null
  }
  const onDrag = (event: MouseEvent | TouchEvent | PointerEvent) => {
    const point = 'clientX' in event ? event : event.touches[0]
    setOver(laneAt(point.clientX, point.clientY))
  }
  const onDragStart = (id: string) => () => {
    setLifted(id)
    setClosed(id)
  }
  const onDragEnd = (id: string) => (event: MouseEvent | TouchEvent | PointerEvent, _info: PanInfo) => {
    const point = 'clientX' in event ? event : event.changedTouches[0]
    const lane = laneAt(point.clientX, point.clientY)
    setOver(null)
    setLifted(null)
    setClosed(null)
    if (lane) move(id, lane)
  }

  const stopDemo = () => {
    if (!demoRunning.current) return
    demoRunning.current = false
    demoTimers.current.forEach((timer) => window.clearTimeout(timer))
    demoTimers.current = []
    setPlacement(initial())
    setDemo('done')
    setLifted(null)
    setClosed(null)
    setOver(null)
  }

  // Once the block is in view: two cards are picked up, carried to another lane, put down, and carried back.
  useEffect(() => {
    const scene = sceneRef.current
    if (!animated || !scene) return
    const at = (delay: number, action: () => void) => void demoTimers.current.push(window.setTimeout(action, delay))
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        demoRunning.current = true
        setDemo('running')
        DEMO_MOVES.forEach(({ id, to }, step) => {
          const home = recipients.find((item) => item.id === id)!.lane
          const put = (lane: Lane) => setPlacement((current) => ({ ...current, [id]: { lane, manual: false } }))
          const begin = DEMO_START + step * DEMO_STEP
          const glide = DEMO_GLIDE * 1000
          // There and back: pick up, the lane under the card lights up, the card glides over, the place closes behind it and opens in the new lane.
          at(begin, () => (setLifted(id), setClosed(id)))
          at(begin + 700, () => setOver(to))
          at(begin + 1100, () => (setOver(null), setClosed(null), put(to)))
          at(begin + 1100 + glide + 100, () => setLifted(null))
          at(begin + 3000, () => (setLifted(id), setClosed(id)))
          at(begin + 3600, () => setOver(home))
          at(begin + 4000, () => (setOver(null), setClosed(null), put(home)))
          at(begin + 4000 + glide + 100, () => setLifted(null))
        })
        at(DEMO_START + DEMO_MOVES.length * DEMO_STEP, () => ((demoRunning.current = false), setDemo('done')))
      },
      { threshold: 0.7 },
    )
    observer.observe(scene)
    return () => {
      observer.disconnect()
      demoTimers.current.forEach((timer) => window.clearTimeout(timer))
      demoTimers.current = []
    }
  }, [animated])

  const pay = () => {
    if (phase !== 'ready') return
    setClock(0)
    setPhase(animated ? 'paying' : 'done')
  }
  const reset = () => {
    setPlacement(initial())
    setMoved(false)
    setPhase('ready')
    setClock(0)
  }
  const resetChoices = () => {
    setPlacement(initial())
    setMoved(false)
  }
  const manualAny = recipients.some((item) => placement[item.id].manual)
  const chip = (item: Recipient, lane: Lane | null) => {
    const status = statusOf(item)
    const manual = lane ? placement[item.id].manual : false
    const rail = lane ? railLabel(item, lane) : item.rail
    const canDrag = phase === 'ready'
    const photo = recipientPhoto(recipients.findIndex((other) => other.id === item.id))
    const isLifted = lifted === item.id
    const glide = isLifted && demo === 'running' ? DEMO_GLIDE : animated ? duration.reveal : 0
    return (
      // The outer box owns the place in the lane (it moves between lanes, and closes up while the card is picked up); the inner one is the card itself.
      <motion.div
        key={item.id}
        layout="position"
        layoutId={`chip-${item.id}`}
        initial={false}
        animate={{ height: closed === item.id ? 0 : 'auto', marginBottom: closed === item.id ? '-0.5rem' : 0 }}
        transition={{ layout: { duration: glide, ease: easeOut }, height: { duration: animated ? 0.45 : 0, ease: easeOut }, marginBottom: { duration: animated ? 0.45 : 0, ease: easeOut } }}
        style={{ zIndex: isLifted ? 30 : 1 }}
        className="relative"
      >
      <motion.div
        data-el={`mass-payouts__routing-chip-${item.id}`}
        data-lane={lane ?? 'pool'}
        data-status={status}
        data-lifted={isLifted}
        drag={canDrag}
        dragSnapToOrigin
        dragElastic={0.2}
        onDragStart={onDragStart(item.id)}
        onDrag={onDrag}
        onDragEnd={onDragEnd(item.id)}
        animate={{ scale: isLifted ? 1.04 : 1 }}
        transition={{ duration: animated ? 0.3 : 0, ease: easeOut }}
        className={`relative flex flex-col gap-1 rounded-16 px-3 py-2 ring-1 ring-inset transition-[background-color,box-shadow] duration-300 ${isLifted ? 'bg-surface-subtle shadow-lifted' : 'bg-surface-page'} ${status === 'failed' ? 'ring-typography-brand' : 'ring-border-subtle'} ${canDrag ? 'cursor-grab touch-none active:cursor-grabbing' : ''}`}
      >
        <span className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-pill bg-surface-hover">
            {photo ? (
              <img src={photo} alt="" width={40} height={40} draggable={false} data-el={`mass-payouts__routing-photo-${item.id}`} className="pointer-events-none size-full object-cover" />
            ) : (
              <span className="type-ui-sm text-typography-secondary">{item.name.split(' ').map((part) => part[0]).join('')}</span>
            )}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="type-ui-md whitespace-nowrap text-typography-primary">{item.name}</span>
        <span className="type-ui-sm flex flex-wrap items-center gap-x-2 text-typography-secondary">
          <span className="tabular-nums whitespace-nowrap">{usdt(item.amount)}</span>
          {rail && <span>{rail}</span>}
          {lane && (
            <span title={manual ? routingScene.manualFull : routingScene.autoFull} className={manual ? 'text-typography-brand' : ''}>
              {manual ? routingScene.manual : routingScene.auto}
            </span>
          )}
          {phase !== 'ready' && (
            <span data-el={`mass-payouts__routing-status-${item.id}`} className={status === 'paid' ? 'text-typography-primary' : status === 'failed' ? 'text-typography-brand' : ''}>
              {status === 'paid' && item.id === FAILING_ID ? routingScene.paidRetried : routingScene.status[status]}
              {status === 'retrying' ? ` · ${routingScene.retryingNote}` : ''}
            </span>
          )}
        </span>
          </span>
        </span>
        {canDrag && lane && (
          <select
            aria-label={routingScene.moveAria(item.name)}
            value={lane}
            onChange={(event) => move(item.id, event.target.value as Lane)}
            className="type-ui-sm sr-only focus:not-sr-only focus:rounded-pill focus:bg-surface-subtle focus:px-2 focus:py-1"
          >
            {lanes.map((value) => (
              <option key={value} value={value}>
                {routingScene.moveTo(routingScene.lanes[value].name)}
              </option>
            ))}
          </select>
        )}
      </motion.div>
      </motion.div>
    )
  }

  const retried = 1

  return (
    <section data-el="mass-payouts__routing" aria-labelledby="mass-payouts-routing-title" className="border-b border-border-subtle">
      <Container>
        <div className="relative flex flex-col items-center gap-8 py-12 column-lines tablet:gap-10 tablet:px-8 tablet:py-20 desktop:gap-12 desktop:px-10 desktop:py-35">
          <div className="flex flex-col items-center gap-4 text-center tablet:gap-6">
            <RevealLines
              id="mass-payouts-routing-title"
              data-el="mass-payouts__routing-title"
              className="type-heading-lg max-w-156 text-balance text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm"
              lines={[routingContent.title]}
            />
            <RevealLines as="p" delay={0.3} data-el="mass-payouts__routing-intro" className="type-body-md max-w-150 text-typography-secondary tablet:type-body-lead" lines={[routingContent.intro]} />
          </div>

          <Reveal
            variant="card"
            data-el="mass-payouts__routing-illustration"
            className="w-full rounded-32 bg-surface-subtle p-4 ring-1 ring-border-subtle ring-inset tablet:p-10 desktop:rounded-48 desktop:p-15"
          >
            <div ref={sceneRef} data-demo={demo} onPointerDownCapture={stopDemo} onKeyDownCapture={stopDemo} className="mx-auto flex w-full max-w-240 flex-col gap-6">
              <LayoutGroup>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p data-el="mass-payouts__routing-legend" className="type-ui-md text-typography-secondary">
                    {routingScene.legend}
                  </p>
                  {manualAny && phase === 'ready' && (
                    <button type="button" data-el="mass-payouts__routing-reset-choices" onClick={resetChoices} className="type-ui-sm rounded-pill bg-surface-page px-3 py-1 text-typography-primary ring-1 ring-border-subtle ring-inset hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand">
                      {routingScene.resetChoices}
                    </button>
                  )}
                </div>

                <div className="grid gap-4 desktop:grid-cols-3">
                  {lanes.map((lane) => {
                    const members = inLane(lane)
                    const laneTotal = members.reduce((sum, item) => sum + item.amount, 0)
                    const laneAll = inLane(lane)
                    return (
                      <div
                        key={lane}
                        ref={(element) => void (laneRefs.current[lane] = element)}
                        data-el={`mass-payouts__routing-lane-${lane}`}
                        className={`flex min-h-48 flex-col gap-3 rounded-24 bg-surface-page p-4 ring-1 ring-inset transition-colors ${over === lane ? 'ring-typography-brand' : 'ring-border-subtle'}`}
                      >
                        <div className="flex flex-col gap-1">
                          <p className="type-heading-sm text-typography-primary">{routingScene.lanes[lane].name}</p>
                          <p className="type-ui-sm text-typography-secondary">{routingScene.lanes[lane].caption}</p>
                          <p data-el={`mass-payouts__routing-lane-count-${lane}`} className="type-ui-md tabular-nums text-typography-primary">
                            {phase === 'ready'
                              ? routingScene.count(members.length, usdt(laneTotal))
                              : routingScene.laneProgress(laneAll.filter((item) => statusOf(item) === 'paid').length, laneAll.length)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {members.map((item) => chip(item, lane))}
                          {members.length === 0 && (
                            <p data-el={`mass-payouts__routing-lane-empty-${lane}`} className="type-ui-sm rounded-16 border-2 border-dashed border-border-medium p-4 text-center text-typography-secondary">
                              {routingScene.empty}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </LayoutGroup>

              <div className="flex flex-col gap-4 rounded-24 bg-surface-page p-5 ring-1 ring-border-subtle ring-inset tablet:p-6" aria-live="polite">
                {phase === 'done' ? (
                  <>
                    <div className="flex flex-col gap-1">
                      <p data-el="mass-payouts__routing-result-title" className="type-heading-sm text-typography-primary">
                        {routingScene.resultTitle(recipients.length, retried)}
                      </p>
                      <p data-el="mass-payouts__routing-result-text" className="type-ui-md text-typography-secondary">
                        {routingScene.resultText(usdt(batchTotal), batchCountries)}
                      </p>
                      <p data-el="mass-payouts__routing-result-retry" className="type-ui-sm text-typography-secondary">
                        {routingScene.resultRetry}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button type="button" data-el="mass-payouts__routing-reset" onClick={reset} className={light}>
                        {routingScene.reset}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <p data-el="mass-payouts__routing-progress" className="type-ui-lg tabular-nums text-typography-primary">
                        {phase === 'paying' ? routingScene.progress(paidCount, recipients.length) : routingScene.count(recipients.length, usdt(batchTotal))}
                      </p>
                      <p data-el="mass-payouts__routing-hint" className="type-ui-sm text-typography-secondary">
                        {moved ? routingScene.hintMoved : routingScene.hint}
                      </p>
                    </div>
                    <button type="button" data-el="mass-payouts__routing-pay" disabled={phase === 'paying'} onClick={pay} className={dark}>
                      {phase === 'paying' ? routingScene.paying : routingScene.pay(recipients.length)}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          <CornerDots edge="top" block="mass-payouts-routing" />
          <CornerDots edge="bottom" block="mass-payouts-routing" />
        </div>
      </Container>
    </section>
  )
}

