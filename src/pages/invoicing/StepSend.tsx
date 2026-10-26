import { motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Chip } from '../../components/ui/Chip'
import { duration, easeOut } from '../../motion/tokens'
import { useRevealOn } from '../../motion/useReveal'
import { CLIENT, coinMoney, coins, INVOICE_NO, money, payLink, totals, useDraft, type Coin } from './demo'
import { CheckIcon, EyeIcon } from './parts'
import { sendScene } from './sceneText'

/** Seconds from the press of "Send invoice" to the events "sent" and "delivered", and to the client opening it on the first, automatic run. */
const EVENT_AT = [0.5, 1.4] as const
const OPEN_AT = 2.8
const EVENT_COUNT = sendScene.timeline.length

type Channel = 'link' | 'email' | 'pdf'

/**
 * Step 2 of the Invoicing page: "Send". `invoicing__step-send-illustration`.
 * The invoice of step 1 goes to the client as a payment link, an e-mail or a PDF (the visitor picks). "Send invoice" brings the events "sent" and
 * "delivered"; then the visitor presses "Open as client" and the third one comes: the sender sees the moment the client opened the invoice.
 * On the right is the payment page the client sees: dim until the invoice is sent, with an eye on it once it is opened.
 * The first run plays by itself when the step comes into view (the opening included), later ones wait for the button.
 */
export function StepSend() {
  const draft = useDraft()
  const sums = totals(draft)
  const animated = useRevealOn()
  const reduced = useReducedMotion() ?? false
  const sceneRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sceneRef, { amount: 0.5, once: true })
  const timers = useRef<number[]>([])
  const autoStarted = useRef(false)

  const [channel, setChannel] = useState<Channel>('link')
  const [coin, setCoin] = useState<Coin>('USDT')
  // How many events have come (0 to 3), and whether the run is on.
  const [shown, setShown] = useState(animated ? 0 : EVENT_COUNT)
  const [running, setRunning] = useState(false)

  const clear = () => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
  }

  const open = () => {
    setShown(EVENT_COUNT)
    setRunning(false)
  }

  const run = (withOpen: boolean) => {
    clear()
    if (!animated) {
      setShown(EVENT_COUNT)
      return
    }
    setShown(0)
    setRunning(true)
    EVENT_AT.forEach((at, index) => {
      timers.current.push(
        window.setTimeout(() => {
          setShown(index + 1)
          if (index === EVENT_AT.length - 1 && !withOpen) setRunning(false)
        }, at * 1000),
      )
    })
    if (withOpen) timers.current.push(window.setTimeout(open, OPEN_AT * 1000))
  }

  useEffect(() => {
    if (!animated || !inView || autoStarted.current) return
    autoStarted.current = true
    const timer = window.setTimeout(() => run(true), 600)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, inView])

  useEffect(() => clear, [])

  const sent = shown > 0
  const waitingToOpen = shown === EVENT_AT.length && !running
  const viewed = shown === EVENT_COUNT
  const target = channel === 'link' ? payLink(INVOICE_NO) : channel === 'email' ? CLIENT : `${INVOICE_NO}.pdf`
  const label = running && !sent ? sendScene.sending : sent ? sendScene.sentLabel : sendScene.send

  return (
    <div ref={sceneRef} data-el="invoicing__step-send-illustration" className="grid grid-cols-[minmax(0,1fr)] gap-4 tablet:grid-cols-2 tablet:gap-6">
      <div className="flex flex-col gap-5">
        <h4 className="type-heading-sm text-typography-primary">{sendScene.title}</h4>
        <div className="flex flex-col gap-2">
          <p className="type-ui-md text-typography-secondary">{sendScene.sendAs}</p>
          <div className="flex flex-wrap gap-2">
            <Chip selected={channel === 'link'} onClick={() => setChannel('link')}>
              {sendScene.link}
            </Chip>
            <Chip selected={channel === 'email'} onClick={() => setChannel('email')}>
              {sendScene.email}
            </Chip>
            <Chip selected={channel === 'pdf'} onClick={() => setChannel('pdf')}>
              {sendScene.pdf}
            </Chip>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-pill bg-surface-subtle py-2 pr-2 pl-5 ring-1 ring-border-subtle ring-inset">
          <span className="type-ui-md min-w-0 truncate text-typography-secondary">
            {channel === 'link' ? '' : `${sendScene.to} `}
            <span data-el="invoicing__step-send-target" className={channel === 'email' ? 'text-typography-primary' : 'type-code-sm text-typography-primary'}>
              {target}
            </span>
          </span>
          <button
            type="button"
            data-el="invoicing__step-send-button"
            disabled={running}
            onClick={() => run(false)}
            className="type-ui-md rounded-pill bg-surface-inverse px-5 py-2 whitespace-nowrap text-typography-inverse transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand disabled:opacity-60"
          >
            {label}
          </button>
        </div>

        <ul data-el="invoicing__step-send-events" aria-live="polite" className="flex flex-col gap-3">
          {sendScene.timeline.slice(0, shown).map((event) => (
            <motion.li
              key={event.id}
              initial={reduced || !animated ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: duration.reveal, ease: easeOut }}
              data-event={event.id}
              className="flex items-center gap-3 border-t border-border-subtle pt-3"
            >
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-pill ${event.id === 'viewed' ? 'bg-surface-brand-light text-typography-brand' : 'bg-surface-success-secondary text-typography-success'}`}>
                {event.id === 'viewed' ? <EyeIcon /> : <CheckIcon />}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="type-ui-md text-typography-primary">{event.title}</span>
                <span className="type-ui-sm text-typography-secondary">{event.id === 'viewed' ? `${CLIENT} ${sendScene.opened} ${INVOICE_NO}` : event.note}</span>
              </span>
              <span className="type-ui-sm text-typography-secondary tabular-nums">{event.time}</span>
            </motion.li>
          ))}
          {!viewed && (
            <li className="flex items-center gap-3 border-t border-border-subtle pt-3">
              <span className="type-ui-md flex-1 text-typography-secondary">{sent ? sendScene.notOpened : sendScene.hint}</span>
              {waitingToOpen && (
                <button
                  type="button"
                  data-el="invoicing__step-send-open"
                  onClick={open}
                  className="type-ui-md inline-flex items-center gap-2 rounded-pill bg-surface-brand-default px-4 py-2 whitespace-nowrap text-typography-static-w transition-colors hover:bg-surface-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand"
                >
                  <EyeIcon />
                  {sendScene.openAsClient}
                </button>
              )}
            </li>
          )}
        </ul>
      </div>

      {/* The payment page of the client. */}
      <div className="flex flex-col gap-2">
        <p className="type-ui-sm text-typography-secondary">{sendScene.pageTitle}</p>
        <div
          data-el="invoicing__step-send-page"
          data-sent={sent}
          className={`relative flex flex-1 flex-col gap-4 rounded-32 bg-surface-subtle p-5 ring-1 ring-inset transition-opacity duration-500 tablet:p-6 ${
            sent ? 'opacity-100 ring-border-medium' : 'opacity-50 ring-border-subtle'
          }`}
        >
          <div className="flex flex-col gap-1">
            <p className="type-ui-sm text-typography-secondary">
              {sendScene.pageInvoice} {INVOICE_NO}
            </p>
            <p className="type-ui-sm text-typography-secondary">{sendScene.amountDue}</p>
            <p className="type-heading-md text-typography-primary tabular-nums">{money(sums.total, draft.currency)}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="type-ui-sm text-typography-secondary">{sendScene.payWith}</p>
            <div className="flex gap-2">
              {coins.map((option) => (
                <Chip key={option} selected={option === coin} onClick={() => setCoin(option)}>
                  {option}
                </Chip>
              ))}
            </div>
          </div>
          <div className="type-ui-md mt-auto flex items-center justify-center rounded-pill bg-surface-brand-default px-5 py-3 text-typography-static-w tabular-nums">
            {sendScene.pay} {coinMoney(sums.coin, coin)}
          </div>

          {viewed && (
            <motion.span
              key="eye"
              data-el="invoicing__step-send-eye"
              initial={reduced || !animated ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: duration.reveal, ease: easeOut }}
              className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-pill bg-surface-inverse text-typography-inverse"
            >
              <EyeIcon />
            </motion.span>
          )}
        </div>
      </div>
    </div>
  )
}
