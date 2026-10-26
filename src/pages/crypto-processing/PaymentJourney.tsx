import { motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Chip, Choice } from '../../components/ui/Chip'
import { Container } from '../../components/ui/Container'
import { CornerDots } from '../../components/ui/CornerDots'
import { TypedLog, type LogLine } from '../../components/ui/TypedLog'
import { Reveal, RevealLines } from '../../motion/reveal'
import { duration, easeOut } from '../../motion/tokens'
import { useRevealOn } from '../../motion/useReveal'
import { amounts, coins, formatAmount, networks, RATE, setSelection, SETTLEMENT_CURRENCY, settledAmount, useSelection } from './demo'
import { flowContent } from './content'
import { journeyScene } from './sceneText'

/** Seconds the scene waits on a station, once its log is written, before it goes to the next one by itself. */
const STEP_PAUSE = 1.6

type Selection = ReturnType<typeof useSelection>

/** What each station writes in its console: the coin, the network and the sums come from the choice of the visitor. */
function logLines(station: number, { coin, network, amount }: Selection): readonly LogLine[] {
  const sent = `${formatAmount(amount)} ${coin}`
  const received = `${formatAmount(settledAmount(amount))} ${SETTLEMENT_CURRENCY}`
  const { log } = journeyScene
  if (station === 0) {
    return [
      { text: 'payment.created', tone: 'event' },
      { text: `${sent} on ${network}`, tone: 'text' },
      { text: log.waiting, tone: 'muted' },
      { text: 'payment.confirmed', tone: 'ok' },
    ]
  }
  if (station === 1) {
    return [
      { text: log.locking, tone: 'muted' },
      { text: `1 ${coin} = ${RATE} ${SETTLEMENT_CURRENCY}`, tone: 'text' },
      { text: `${sent} → ${received}`, tone: 'text' },
      { text: log.converted, tone: 'ok' },
    ]
  }
  return [
    { text: log.sending, tone: 'muted' },
    { text: `${received} → ${journeyScene.panels.settle.account}`, tone: 'text' },
    { text: 'payment.settled', tone: 'ok' },
  ]
}

/**
 * Block 1 of the Crypto Processing page: "Follow one payment". `crypto-processing__flow`.
 * One demo payment goes through three stations (Accept, Convert, Settle) along a dotted track; a dot (the payment) travels with it.
 * The scene plays by itself while it is on the screen: each station writes its log (a typing console), and when the log is done the payment
 * goes on to the next station. A click on a station or on a chip pauses the round and shows that station (its log is written again);
 * Play goes on from there at once. On the Accept station the visitor picks the coin, the network and the sum: the choice is used by
 * the next stations and by the request of block 2.
 * Texts inside the scene are part of the picture (like the cards of Features): they are not revealed by words.
 */
export function PaymentJourney() {
  const selection = useSelection()
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(true)
  // The log of the shown station is written anew when `run` changes (a new station, Play, a new choice).
  const [run, setRun] = useState(0)
  const [logDone, setLogDone] = useState(false)
  const sceneRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const inView = useInView(sceneRef, { amount: 0.4 })
  const animated = useRevealOn()
  const reduced = useReducedMotion() ?? false

  // By itself: when the log of the station is written, a short pause and the next station, round and round, while the scene is seen
  // and nobody has touched it.
  useEffect(() => {
    if (!animated || !playing || !inView || !logDone) return
    const timer = setTimeout(() => {
      setActive((current) => (current + 1) % journeyScene.stations.length)
      setRun((current) => current + 1)
    }, STEP_PAUSE * 1000)
    return () => clearTimeout(timer)
  }, [animated, playing, inView, logDone, active])

  const choose = (index: number) => {
    setActive(index)
    setRun((current) => current + 1)
    setPlaying(false)
  }

  // Play writes the log of the shown station again at once, so that something happens the moment it is pressed.
  const togglePlaying = () => {
    if (!playing) setRun((current) => current + 1)
    setPlaying(!playing)
  }

  // A new choice on Accept: the log is written again with the new sum, and the round stops.
  const pick = (change: Partial<Selection>) => {
    setSelection(change)
    setRun((current) => current + 1)
    setPlaying(false)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const last = journeyScene.stations.length - 1
    const next = event.key === 'ArrowRight' ? Math.min(last, active + 1) : event.key === 'ArrowLeft' ? Math.max(0, active - 1) : null
    if (next === null) return
    event.preventDefault()
    choose(next)
    tabRefs.current[next]?.focus()
  }

  const settled = settledAmount(selection.amount)
  const stationId = journeyScene.stations[active].id

  // Not a component: a function defined here would be a new component type on every render and remount the console.
  const stationLog = (
    <>
      <TypedLog
        key={`${active}-${run}`}
        data-el={`crypto-processing__flow-log-${stationId}`}
        lines={logLines(active, selection)}
        instant={reduced || !animated}
        onDone={setLogDone}
      />
      <Status label={logDone ? journeyScene.progress[stationId].done : journeyScene.progress[stationId].working} done={logDone} working={!logDone} />
    </>
  )

  return (
    <section id="how-it-works" data-el="crypto-processing__flow" aria-labelledby="crypto-processing-flow-title" className="border-y border-border-subtle">
      <Container>
        <div className="relative flex flex-col items-center gap-8 py-12 column-lines tablet:gap-10 tablet:px-8 tablet:py-20 desktop:gap-12 desktop:px-10 desktop:py-35">
          <div className="flex flex-col items-center gap-4 text-center tablet:gap-6">
            <RevealLines
              id="crypto-processing-flow-title"
              data-el="crypto-processing__flow-title"
              className="type-heading-lg max-w-156 text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm"
              lines={[flowContent.title]}
            />
            <RevealLines
              as="p"
              delay={0.3}
              data-el="crypto-processing__flow-intro"
              className="type-body-md max-w-150 text-typography-secondary tablet:type-body-lead"
              lines={[flowContent.intro]}
            />
          </div>

          <Reveal
            variant="card"
            data-el="crypto-processing__flow-illustration"
            className="w-full rounded-32 bg-surface-subtle p-4 ring-1 ring-border-subtle ring-inset tablet:p-10 desktop:rounded-48 desktop:p-15"
          >
            <div ref={sceneRef} className="mx-auto flex w-full max-w-200 flex-col gap-8">
              {/* The track: a dotted line through the three stations; the coloured part is the way the payment has made. */}
              <div className="relative">
                <div aria-hidden="true" className="absolute top-6 right-[16.67%] left-[16.67%] border-t-2 border-dashed border-typography-tertiary" />
                <motion.div
                  aria-hidden="true"
                  className="absolute top-6 left-[16.67%] border-t-2 border-dashed border-typography-brand"
                  initial={false}
                  animate={{ width: `${active * (100 / 3)}%` }}
                  transition={{ duration: reduced ? 0 : duration.reveal, ease: easeOut }}
                />
                <ol role="tablist" aria-label={flowContent.title} onKeyDown={onKeyDown} className="relative grid grid-cols-3">
                  {journeyScene.stations.map((station, index) => (
                    <li key={station.id} role="presentation" className="flex justify-center">
                      <button
                        type="button"
                        role="tab"
                        id={`flow-tab-${station.id}`}
                        aria-selected={index === active}
                        aria-controls="flow-panel"
                        tabIndex={index === active ? 0 : -1}
                        ref={(element) => void (tabRefs.current[index] = element)}
                        data-el={`crypto-processing__flow-station-${station.id}`}
                        onClick={() => choose(index)}
                        className="group flex flex-col items-center gap-2 rounded-32 px-2 py-1 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand"
                      >
                        <span
                          className={`type-ui-lg flex size-12 items-center justify-center rounded-pill ring-1 ring-inset transition-colors ${
                            index === active
                              ? 'bg-surface-inverse text-typography-inverse ring-transparent'
                              : index < active
                                ? 'bg-surface-page text-typography-brand ring-typography-brand'
                                : 'bg-surface-page text-typography-secondary ring-border-medium group-hover:bg-surface-hover'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="type-ui-lg text-typography-primary">{station.title}</span>
                        <span className="type-ui-sm text-typography-secondary">{station.caption}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Play / Pause sits in the corner of the panel (outside the animated panel, so it does not blink when the station changes). */}
              <div className="relative">
              {animated && (
                <button
                  type="button"
                  data-el="crypto-processing__flow-play"
                  aria-pressed={playing}
                  onClick={togglePlaying}
                  className="type-ui-md absolute top-4 right-4 z-10 rounded-pill bg-surface-subtle px-4 py-2 text-typography-primary ring-1 ring-border-subtle transition-colors ring-inset hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand tablet:top-6 tablet:right-6"
                >
                  {playing ? journeyScene.pause : journeyScene.play}
                </button>
              )}
              <motion.div
                key={active}
                id="flow-panel"
                role="tabpanel"
                aria-labelledby={`flow-tab-${journeyScene.stations[active].id}`}
                data-el={`crypto-processing__flow-panel-${journeyScene.stations[active].id}`}
                className="flex min-h-72 flex-col gap-5 rounded-32 bg-surface-page p-5 ring-1 ring-border-subtle ring-inset tablet:p-8"
                initial={reduced || !animated ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: duration.reveal, ease: easeOut }}
              >
                {active === 0 && (
                  <>
                    <PanelTitle>{journeyScene.panels.accept.title}</PanelTitle>
                    <Choice label={journeyScene.panels.accept.coin}>
                      {coins.map((coin) => (
                        <Chip key={coin} selected={coin === selection.coin} onClick={() => pick({ coin })}>
                          {coin}
                        </Chip>
                      ))}
                    </Choice>
                    <Choice label={journeyScene.panels.accept.network}>
                      {networks.map((network) => (
                        <Chip key={network} selected={network === selection.network} onClick={() => pick({ network })}>
                          {network}
                        </Chip>
                      ))}
                    </Choice>
                    <Choice label={journeyScene.panels.accept.amount}>
                      {amounts.map((amount) => (
                        <Chip key={amount} selected={amount === selection.amount} onClick={() => pick({ amount })}>
                          {formatAmount(amount)}
                        </Chip>
                      ))}
                    </Choice>
                    {stationLog}
                    <p data-el="crypto-processing__flow-hint" className="type-ui-sm text-typography-secondary">
                      {journeyScene.hint}
                    </p>
                  </>
                )}
                {active === 1 && (
                  <>
                    <PanelTitle>{journeyScene.panels.convert.title}</PanelTitle>
                    <Row label={journeyScene.panels.convert.sends} value={`${formatAmount(selection.amount)} ${selection.coin}`} />
                    <Row label={journeyScene.panels.convert.rate} value={`1 ${selection.coin} = ${RATE} ${SETTLEMENT_CURRENCY}`} />
                    <Row label={journeyScene.panels.convert.receives} value={`${formatAmount(settled)} ${SETTLEMENT_CURRENCY}`} strong />
                    {stationLog}
                  </>
                )}
                {active === 2 && (
                  <>
                    <PanelTitle>{journeyScene.panels.settle.title}</PanelTitle>
                    <Row label={journeyScene.panels.settle.credited} value={journeyScene.panels.settle.account} />
                    <Row label={journeyScene.panels.settle.amount} value={`${formatAmount(settled)} ${SETTLEMENT_CURRENCY}`} strong />
                    {stationLog}
                  </>
                )}
              </motion.div>
              </div>
            </div>
          </Reveal>

          <CornerDots edge="top" block="crypto-processing-flow" />
          <CornerDots edge="bottom" block="crypto-processing-flow" />
        </div>
      </Container>
    </section>
  )
}

function PanelTitle({ children }: { children: ReactNode }) {
  return <h3 className="type-heading-sm text-typography-primary">{children}</h3>
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-border-subtle pt-4">
      <p className="type-ui-md text-typography-secondary">{label}</p>
      <p className={`${strong ? 'type-heading-sm' : 'type-ui-lg'} text-typography-primary`}>{value}</p>
    </div>
  )
}

function Status({ label, done = false, working = false }: { label: string; done?: boolean; working?: boolean }) {
  return (
    <p data-el="crypto-processing__flow-status" className="type-ui-md mt-auto inline-flex items-center gap-2 text-typography-primary">
      <span className={`size-2 rounded-pill ${done ? 'bg-typography-brand' : 'bg-typography-secondary'} ${working ? 'animate-pulse' : ''}`} />
      {label}
    </p>
  )
}
