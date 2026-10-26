import { motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Chip, Choice } from '../../components/ui/Chip'
import { TypedLog, type LogLine } from '../../components/ui/TypedLog'
import { duration, easeOut } from '../../motion/tokens'
import { useRevealOn } from '../../motion/useReveal'
import { CLIENT, coinMoney, coins, INVOICE_NO, money, totals, useDraft, type Coin, type Stage } from './demo'
import { StatusPill } from './parts'
import { payScene, stageText } from './sceneText'

/** Seconds from the press of the button to the payment landing, and to the invoice being reconciled. */
const PAID_AT = 0.9
const RECONCILED_AT = 2.6

/** 0: waiting (the invoice was viewed), 1: paid, 2: reconciled. */
type Step = 0 | 1 | 2
const statusOf = (step: Step): Stage => (step === 0 ? 'viewed' : step === 1 ? 'paid' : 'reconciled')

/**
 * Step 3 of the Invoicing page: "Get paid". `invoicing__step-pay-illustration`.
 * The client pays the invoice from their wallet (the coin is picked here). The payment lands in the list of invoices on the right as an
 * "incoming" sum, finds the invoice it belongs to (that is the reconciliation), the invoice goes Paid, Reconciled, and a console writes the events
 * that go to the visitor's system. It plays once by itself when it comes into view, then on the button.
 */
export function StepPay() {
  const draft = useDraft()
  const sums = totals(draft)
  const animated = useRevealOn()
  const reduced = useReducedMotion() ?? false
  const sceneRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sceneRef, { amount: 0.5, once: true })
  const timers = useRef<number[]>([])
  const autoStarted = useRef(false)

  const [coin, setCoin] = useState<Coin>('USDT')
  const [step, setStep] = useState<Step>(animated ? 0 : 2)
  const [run, setRun] = useState(animated ? 0 : 1)
  const [running, setRunning] = useState(false)
  const [pulse, setPulse] = useState(0)
  const [logDone, setLogDone] = useState(!animated)

  const pay = () => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
    if (!animated) {
      setStep(2)
      return
    }
    setStep(0)
    setLogDone(false)
    setRun(0)
    setRunning(true)
    setPulse((count) => count + 1)
    timers.current.push(
      window.setTimeout(() => {
        setStep(1)
        setRun((count) => count + 1)
      }, PAID_AT * 1000),
      window.setTimeout(() => {
        setStep(2)
        setRunning(false)
      }, RECONCILED_AT * 1000),
    )
  }

  useEffect(() => {
    if (!animated || !inView || autoStarted.current) return
    autoStarted.current = true
    const timer = window.setTimeout(pay, 600)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, inView])

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  const amount = coinMoney(sums.coin, coin)
  const lines: readonly LogLine[] = [
    { text: 'invoice.paid', tone: 'event' },
    { text: `${INVOICE_NO}: payment received`, tone: 'text' },
    { text: 'invoice.reconciled', tone: 'ok' },
    { text: `${INVOICE_NO} marked as paid`, tone: 'text' },
  ]
  const label = running ? payScene.paying : step === 2 ? payScene.replay : `${payScene.pay} ${amount}`

  return (
    <div ref={sceneRef} data-el="invoicing__step-get-paid-illustration" className="grid grid-cols-1">
      <Pane title={payScene.walletTitle} caption={payScene.walletCaption} data-el="invoicing__step-pay-wallet" wide>
        <Choice label={payScene.coin} stacked>
          {coins.map((option) => (
            <Chip key={option} selected={option === coin} onClick={() => setCoin(option)}>
              {option}
            </Chip>
          ))}
        </Choice>
        <div className="flex flex-col gap-1 border-t border-border-subtle pt-4 tablet:border-t-0 tablet:pt-0">
          <p className="type-ui-sm text-typography-secondary">{INVOICE_NO}</p>
          <p className="type-ui-md text-typography-primary tabular-nums">{money(sums.total, draft.currency)}</p>
          <p className="type-heading-sm text-typography-brand tabular-nums">{amount}</p>
        </div>
        <button
          type="button"
          data-el="invoicing__step-pay-button"
          disabled={running}
          onClick={pay}
          className="type-ui-md self-start rounded-pill bg-surface-inverse px-5 py-3 text-typography-inverse transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand disabled:opacity-60"
        >
          {label}
        </button>
        <p className="type-ui-sm text-typography-secondary tablet:basis-full">{payScene.hint}</p>
      </Pane>

      <Bridge pulse={pulse} reduced={reduced} />

      <Pane title={payScene.ledgerTitle} caption={payScene.ledgerCaption} data-el="invoicing__step-pay-ledger">
        <div className="relative min-h-9">
          {step === 1 && (
            <motion.p
              key={`in-${run}`}
              data-el="invoicing__step-pay-incoming"
              initial={reduced || !animated ? false : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: duration.reveal, ease: easeOut }}
              className="type-ui-md absolute inset-x-0 top-0 inline-flex w-fit items-center gap-2 rounded-pill bg-surface-brand-light px-4 py-1.5 text-typography-brand"
            >
              {payScene.incoming} +{amount}
            </motion.p>
          )}
          {step === 2 && (
            <p className="type-ui-md absolute inset-x-0 top-0 inline-flex w-fit items-center gap-2 rounded-pill bg-surface-success-secondary px-4 py-1.5 text-typography-success">
              {payScene.matched} {INVOICE_NO}
            </p>
          )}
        </div>
        <ul className="flex flex-col">
          <Row no={payScene.others[0].no} client={payScene.others[0].client} amount={payScene.others[0].amount} status="reconciled" />
          <Row no={INVOICE_NO} client={CLIENT} amount={money(sums.total, draft.currency)} status={statusOf(step)} active />
          <Row no={payScene.others[1].no} client={payScene.others[1].client} amount={payScene.others[1].amount} status="sent" />
        </ul>
        {step >= 1 ? (
          <TypedLog key={`log-${run}`} data-el="invoicing__step-pay-log" lines={lines} instant={reduced || !animated} onDone={setLogDone} />
        ) : (
          <p className="type-ui-md text-typography-secondary">{payScene.empty}</p>
        )}
        <p data-el="invoicing__step-pay-status" data-done={step === 2 && logDone} className="type-ui-md inline-flex items-center gap-2 text-typography-primary">
          <span className={`size-2 rounded-pill ${step === 2 && logDone ? 'bg-typography-brand' : 'bg-typography-secondary'} ${running ? 'animate-pulse' : ''}`} />
          {stageText[statusOf(step)]}
          {step === 2 && logDone && <span className="text-typography-secondary">{payScene.noManual}</span>}
        </p>
      </Pane>
    </div>
  )
}

/** `wide` lays the content of the pane in a row (the wallet of the client: coin, sum, button side by side from the tablet width). */
function Pane({ title, caption, wide = false, children, ...rest }: { title: string; caption: string; wide?: boolean; children: ReactNode; 'data-el': string }) {
  return (
    <div {...rest} className="flex flex-col gap-4 rounded-32 bg-surface-subtle p-5 ring-1 ring-border-subtle ring-inset tablet:p-6">
      <div className="flex flex-col gap-1">
        <h4 className="type-heading-sm text-typography-primary">{title}</h4>
        <p className="type-ui-sm text-typography-secondary">{caption}</p>
      </div>
      <div className={wide ? 'flex flex-col gap-4 tablet:flex-row tablet:flex-wrap tablet:items-end tablet:gap-x-10' : 'flex flex-col gap-4'}>{children}</div>
    </div>
  )
}

function Row({ no, client, amount, status, active = false }: { no: string; client: string; amount: string; status: Stage; active?: boolean }) {
  return (
    <li
      data-invoice={no}
      className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 rounded-32 px-4 py-3 transition-colors ${active ? 'bg-surface-page ring-1 ring-border-medium ring-inset' : ''}`}
    >
      <span className="type-ui-md truncate text-typography-primary">{client}</span>
      <span className="row-span-2">
        <StatusPill status={status}>{stageText[status]}</StatusPill>
      </span>
      <span className="type-ui-sm text-typography-secondary">
        {no} · {amount}
      </span>
    </li>
  )
}

/** The dotted bridge between the wallet and the list (a vertical line); a dot runs down it when `pulse` grows. */
function Bridge({ pulse, reduced }: { pulse: number; reduced: boolean }) {
  return (
    <div aria-hidden="true" className="relative mx-auto h-10 w-px border-l-2 border-dashed border-typography-tertiary">
      {pulse > 0 && !reduced && (
        <motion.span
          key={pulse}
          className="absolute left-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-typography-brand"
          initial={{ top: '0%', opacity: 1 }}
          animate={{ top: '100%', opacity: [1, 1, 0] }}
          transition={{ duration: duration.reveal, ease: easeOut }}
        />
      )}
    </div>
  )
}
