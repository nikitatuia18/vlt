import { motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Container } from '../../components/ui/Container'
import { CornerDots } from '../../components/ui/CornerDots'
import { Reveal, RevealLines } from '../../motion/reveal'
import { duration, easeOut } from '../../motion/tokens'
import { useRevealOn } from '../../motion/useReveal'
import { amounts, coins, formatAmount, networks, RATE, setSelection, SETTLEMENT_CURRENCY, settledAmount, useSelection } from './demo'
import { flowContent } from './content'
import { heroScene, journeyScene } from './sceneText'

/** Seconds one station stays shown while the scene plays by itself. */
const STEP_SECONDS = 3

/** Where the stations stand on the track: the middles of three equal columns. */
const stationLeft = (index: number) => 100 / 6 + index * (100 / 3)

/**
 * Block 1 of the Crypto Processing page: "Follow one payment". `crypto-processing__flow`.
 * One demo payment goes through three stations (Accept, Convert, Settle) along a dotted track; a dot (the payment) travels with it.
 * The scene plays by itself while it is on the screen; a click on a station or on a chip pauses it and shows that station. On the Accept
 * station the visitor picks the coin, the network and the sum: the choice is used by the next stations and by the request of block 2.
 * Texts inside the scene are part of the picture (like the cards of Features): they are not revealed by words.
 */
export function PaymentJourney() {
  const selection = useSelection()
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(true)
  const sceneRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const inView = useInView(sceneRef, { amount: 0.4 })
  const animated = useRevealOn()
  const reduced = useReducedMotion() ?? false

  // By itself: the next station after a few seconds, round and round, while the scene is seen and nobody has touched it.
  useEffect(() => {
    if (!animated || !playing || !inView) return
    const timer = setTimeout(() => setActive((current) => (current + 1) % journeyScene.stations.length), STEP_SECONDS * 1000)
    return () => clearTimeout(timer)
  }, [animated, playing, inView, active])

  const choose = (index: number) => {
    setActive(index)
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
              <div className="flex items-center justify-between gap-4">
                <p className="type-ui-sm text-typography-tertiary">{journeyScene.demo}</p>
                {animated && (
                  <button
                    type="button"
                    data-el="crypto-processing__flow-play"
                    aria-pressed={playing}
                    onClick={() => setPlaying((current) => !current)}
                    className="type-ui-md rounded-pill bg-surface-page px-4 py-2 text-typography-primary ring-1 ring-border-subtle transition-colors ring-inset hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand"
                  >
                    {playing ? journeyScene.pause : journeyScene.play}
                  </button>
                )}
              </div>

              {/* The track: a dotted line through the three stations; the coloured part is the way the payment has made, the ring is the payment. */}
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
                {/* The payment: a ring that travels from station to station (above the circles, it does not catch clicks). */}
                <motion.span
                  aria-hidden="true"
                  data-el="crypto-processing__flow-coin"
                  className="pointer-events-none absolute top-6 size-15 -translate-x-1/2 -translate-y-1/2 rounded-pill ring-2 ring-typography-brand"
                  initial={false}
                  animate={{ left: `${stationLeft(active)}%` }}
                  transition={{ duration: reduced ? 0 : duration.reveal, ease: easeOut }}
                />
              </div>

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
                        <Chip key={coin} selected={coin === selection.coin} onClick={() => { setSelection({ coin }); setPlaying(false) }}>
                          {coin}
                        </Chip>
                      ))}
                    </Choice>
                    <Choice label={journeyScene.panels.accept.network}>
                      {networks.map((network) => (
                        <Chip key={network} selected={network === selection.network} onClick={() => { setSelection({ network }); setPlaying(false) }}>
                          {network}
                        </Chip>
                      ))}
                    </Choice>
                    <Choice label={journeyScene.panels.accept.amount}>
                      {amounts.map((amount) => (
                        <Chip key={amount} selected={amount === selection.amount} onClick={() => { setSelection({ amount }); setPlaying(false) }}>
                          {formatAmount(amount)}
                        </Chip>
                      ))}
                    </Choice>
                    <Status label={heroScene.status.waiting} />
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
                    <Status label={heroScene.status.confirmed} />
                  </>
                )}
                {active === 2 && (
                  <>
                    <PanelTitle>{journeyScene.panels.settle.title}</PanelTitle>
                    <Row label={journeyScene.panels.settle.credited} value={journeyScene.panels.settle.account} />
                    <Row label={journeyScene.panels.settle.amount} value={`${formatAmount(settled)} ${SETTLEMENT_CURRENCY}`} strong />
                    <Status label={heroScene.status.settled} done />
                  </>
                )}
              </motion.div>
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

function Choice({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center tablet:gap-4">
      <p className="type-ui-md text-typography-secondary tablet:w-24">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`type-ui-md rounded-pill px-4 py-2 ring-1 transition-colors ring-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand ${
        selected ? 'bg-surface-inverse text-typography-inverse ring-transparent' : 'bg-surface-subtle text-typography-primary ring-border-subtle hover:bg-surface-hover'
      }`}
    >
      {children}
    </button>
  )
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-border-subtle pt-4">
      <p className="type-ui-md text-typography-secondary">{label}</p>
      <p className={`${strong ? 'type-heading-sm' : 'type-ui-lg'} text-typography-primary`}>{value}</p>
    </div>
  )
}

function Status({ label, done = false }: { label: string; done?: boolean }) {
  return (
    <p className="type-ui-md mt-auto inline-flex items-center gap-2 text-typography-primary">
      <span className={`size-2 rounded-pill ${done ? 'bg-typography-brand' : 'bg-typography-secondary'}`} />
      {label}
    </p>
  )
}
