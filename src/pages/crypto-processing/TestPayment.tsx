import { motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Container } from '../../components/ui/Container'
import { CornerDots } from '../../components/ui/CornerDots'
import { Reveal, RevealLines } from '../../motion/reveal'
import { duration, easeOut } from '../../motion/tokens'
import { useRevealOn } from '../../motion/useReveal'
import { apiContent } from './content'
import { formatAmount, SETTLEMENT_CURRENCY, useSelection } from './demo'
import { testScene } from './sceneText'

/** Seconds from the press of the button to the first event and between the events (the payment is confirmed and settled in turn). */
const FIRST_EVENT = 0.5
const EVENT_GAP = 1.4

const eventCount = testScene.events.length

/**
 * Block 2 of the Crypto Processing page: "Run a test payment". `crypto-processing__api`.
 * Three columns: the request (code with the coin and network picked in block 1), the events Velant sends back, and the log of the visitor's
 * system. The button sends one demo payment: the events come one after another, a dot runs along the dotted line between the columns each time,
 * and the log ends with "marked as paid". It plays once by itself when it comes into view, then on the button.
 * Texts inside the scene are part of the picture: not revealed by words. With reduced motion everything stands in the final state.
 */
export function TestPayment() {
  const selection = useSelection()
  const animated = useRevealOn()
  const reduced = useReducedMotion() ?? false
  const sceneRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sceneRef, { amount: 0.5, once: true })
  const timers = useRef<number[]>([])
  const autoStarted = useRef(false)

  // How many events have come (0 to 3), whether the run is on, and a counter per link that makes its dot run again.
  const [shown, setShown] = useState(animated ? 0 : eventCount)
  const [running, setRunning] = useState(false)
  const [sent, setSent] = useState(!animated)
  const [pulses, setPulses] = useState<[number, number]>([0, 0])

  const run = () => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
    setSent(true)
    if (!animated) {
      setShown(eventCount)
      return
    }
    setShown(0)
    setRunning(true)
    setPulses(([request, events]) => [request + 1, events])
    for (let index = 0; index < eventCount; index++) {
      const at = (FIRST_EVENT + index * EVENT_GAP) * 1000
      timers.current.push(
        window.setTimeout(() => {
          setShown(index + 1)
          setPulses(([request, events]) => [request, events + 1])
          if (index === eventCount - 1) setRunning(false)
        }, at),
      )
    }
  }

  // The first run starts by itself when the scene is seen (once).
  useEffect(() => {
    if (!animated || !inView || autoStarted.current) return
    autoStarted.current = true
    const timer = window.setTimeout(run, 600)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, inView])

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  const done = shown === eventCount
  const label = running ? testScene.sending : done ? testScene.replay : testScene.send

  return (
    <section data-el="crypto-processing__api" aria-labelledby="crypto-processing-api-title" className="border-b border-border-subtle">
      <Container>
        <div className="relative flex flex-col items-center gap-8 py-12 column-lines tablet:gap-10 tablet:px-8 tablet:py-20 desktop:gap-12 desktop:px-10 desktop:py-35">
          <div className="flex flex-col items-center gap-4 text-center tablet:gap-6">
            <RevealLines
              id="crypto-processing-api-title"
              data-el="crypto-processing__api-title"
              className="type-heading-lg max-w-156 text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm"
              lines={[apiContent.title]}
            />
            <RevealLines
              as="p"
              delay={0.3}
              data-el="crypto-processing__api-text"
              className="type-body-md max-w-150 text-typography-secondary tablet:type-body-lead"
              lines={[apiContent.text]}
            />
          </div>

          <Reveal
            variant="card"
            data-el="crypto-processing__api-illustration"
            className="w-full rounded-32 bg-surface-subtle p-4 ring-1 ring-border-subtle ring-inset tablet:p-10 desktop:rounded-48 desktop:p-15"
          >
            <div ref={sceneRef}>
              <div className="grid grid-cols-1 desktop:grid-cols-[1fr_auto_1fr_auto_1fr]">
                <Column data-el="crypto-processing__api-column-request" {...testScene.columns.request}>
                  <pre data-el="crypto-processing__api-code" className="type-code-sm overflow-x-auto whitespace-pre text-typography-primary">
                    <span className="text-typography-brand">POST</span> /v1/payments{'\n'}
                    {'{\n'}
                    {'  '}"amount": {formatAmount(selection.amount)},{'\n'}
                    {'  '}"asset": "{selection.coin}",{'\n'}
                    {'  '}"network": "{selection.network}",{'\n'}
                    {'  '}"settle_in": "{SETTLEMENT_CURRENCY}"{'\n'}
                    {'}'}
                    {sent && (
                      <>
                        {'\n\n'}
                        <span className="text-typography-brand">&lt; 201</span> "status": "pending"
                      </>
                    )}
                  </pre>
                  <p className="type-ui-sm mt-auto text-typography-secondary">{testScene.requestHint}</p>
                </Column>

                <Link pulse={pulses[0]} reduced={reduced} />

                <Column data-el="crypto-processing__api-column-events" {...testScene.columns.events}>
                  <button
                    type="button"
                    data-el="crypto-processing__api-send"
                    disabled={running}
                    onClick={run}
                    className="type-ui-md self-start rounded-pill bg-surface-inverse px-5 py-3 text-typography-inverse transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand disabled:opacity-60"
                  >
                    {label}
                  </button>
                  <ul data-el="crypto-processing__api-feed" aria-live="polite" className="flex flex-col gap-3">
                    {shown === 0 && <li className="type-ui-md text-typography-secondary">{testScene.empty}</li>}
                    {testScene.events.slice(0, shown).map((event) => (
                      <Entry key={event.id} reduced={reduced || !animated} data-el={`crypto-processing__api-feed-${event.id}`}>
                        <span className="type-code-sm text-typography-brand">{event.name}</span>
                        <span className="type-ui-md text-typography-primary">{event.note}</span>
                      </Entry>
                    ))}
                  </ul>
                </Column>

                <Link pulse={pulses[1]} reduced={reduced} />

                <Column data-el="crypto-processing__api-column-system" {...testScene.columns.system}>
                  <ul data-el="crypto-processing__api-log" aria-live="polite" className="flex flex-col gap-3">
                    {shown === 0 && <li className="type-ui-md text-typography-secondary">{testScene.empty}</li>}
                    {testScene.events.slice(0, shown).map((event, index) => (
                      <Entry key={event.id} reduced={reduced || !animated} data-el={`crypto-processing__api-log-${event.id}`}>
                        <span className={`type-ui-md inline-flex items-center gap-2 ${index === eventCount - 1 ? 'text-typography-brand' : 'text-typography-primary'}`}>
                          {index === eventCount - 1 && <Check />}
                          {event.log}
                        </span>
                      </Entry>
                    ))}
                  </ul>
                </Column>
              </div>
            </div>
          </Reveal>

          <CornerDots edge="bottom" block="crypto-processing-api" />
        </div>
      </Container>
    </section>
  )
}

function Column({ title, caption, children, ...rest }: { title: string; caption: string; children: ReactNode; 'data-el': string }) {
  return (
    <div {...rest} className="flex min-h-80 flex-col gap-4 rounded-32 bg-surface-page p-5 ring-1 ring-border-subtle ring-inset tablet:p-6">
      <div className="flex flex-col gap-1">
        <h3 className="type-heading-sm text-typography-primary">{title}</h3>
        <p className="type-ui-sm text-typography-secondary">{caption}</p>
      </div>
      {children}
    </div>
  )
}

/** The dotted line between two columns (down on narrow screens, across on wide ones); a dot runs along it each time `pulse` grows. */
function Link({ pulse, reduced }: { pulse: number; reduced: boolean }) {
  return (
    <div aria-hidden="true" className="relative mx-auto h-10 w-px border-l-2 border-dashed border-typography-tertiary desktop:mx-0 desktop:h-auto desktop:w-14 desktop:border-t-2 desktop:border-l-0 desktop:self-center">
      {pulse > 0 && !reduced && (
        <>
          <motion.span
            key={`down-${pulse}`}
            className="absolute left-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-typography-brand desktop:hidden"
            initial={{ top: '0%', opacity: 1 }}
            animate={{ top: '100%', opacity: [1, 1, 0] }}
            transition={{ duration: duration.reveal, ease: easeOut }}
          />
          <motion.span
            key={`across-${pulse}`}
            className="absolute top-0 hidden size-2 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-typography-brand desktop:block"
            initial={{ left: '0%', opacity: 1 }}
            animate={{ left: '100%', opacity: [1, 1, 0] }}
            transition={{ duration: duration.reveal, ease: easeOut }}
          />
        </>
      )}
    </div>
  )
}

function Entry({ reduced, children, ...rest }: { reduced: boolean; children: ReactNode; 'data-el': string }) {
  return (
    <motion.li
      {...rest}
      className="flex flex-col gap-1 border-t border-border-subtle pt-3"
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.reveal, ease: easeOut }}
    >
      {children}
    </motion.li>
  )
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
