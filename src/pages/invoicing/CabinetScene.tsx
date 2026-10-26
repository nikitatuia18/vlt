import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { duration, easeOut } from '../../motion/tokens'
import { useRevealOn } from '../../motion/useReveal'
import { nextRow, RECEIVED_START, receivedBy, seedRows, stageClock, type CabinetRow } from './cabinetData'
import { formatMoney, payLink, RATES, STAGES, toCoin } from './demo'
import { CopyIcon, CountedMoney, DotLane, StatusPill, TwinAmount } from './parts'
import { heroScene, stageText } from './sceneText'

/*
 * The scene of the hero of Invoicing: the cabinet. A list of invoices in several currencies and the open invoice next to it: the same sum in
 * the currency of the client and in USDT, and the lane of statuses. The scene lives by itself: every 1.2 s the newest unfinished invoice goes
 * one status on (Created, Sent, Viewed, Paid, Reconciled), the "Received" sum grows when one is paid, then a new invoice joins the list.
 * "New invoice" adds one at once; a click on a row opens it (and stops the show for a few seconds). It runs only while it is on the screen;
 * with reduced motion or without the appearance animations the cabinet stands still.
 */

const STEP_MS = 1200
/** After the visitor has touched the list, the show waits this long before it goes on. */
const HOLD_MS = 6000
const MAX_ROWS = 7

const stageOf = (row: CabinetRow) => (row.stage === 'overdue' ? 2 : row.stage)
const isLive = (row: CabinetRow) => typeof row.stage === 'number' && row.stage < 4

export function CabinetScene() {
  const animated = useRevealOn()
  const reduced = useReducedMotion() ?? false
  const sceneRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sceneRef, { amount: 0.3 })

  const [rows, setRows] = useState<readonly CabinetRow[]>(seedRows)
  const [selectedKey, setSelectedKey] = useState(seedRows[0].key)
  const [received, setReceived] = useState(RECEIVED_START)
  const [copied, setCopied] = useState(false)
  const [touch] = useState(() => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches)
  const rowsRef = useRef(rows)
  const turn = useRef(0)
  const holdUntil = useRef(0)

  const apply = (next: readonly CabinetRow[]) => {
    rowsRef.current = next
    setRows(next)
  }

  const addInvoice = () => {
    const row = nextRow(rowsRef.current, turn.current++)
    apply([row, ...rowsRef.current].slice(0, MAX_ROWS))
    setSelectedKey(row.key)
    holdUntil.current = 0
  }

  // One step of the show: the newest unfinished invoice goes on, or a new one joins when all are finished.
  useEffect(() => {
    if (!animated || reduced || !inView) return
    const timer = window.setInterval(() => {
      if (performance.now() < holdUntil.current) return
      const current = rowsRef.current
      const live = current.find(isLive)
      if (!live) {
        addInvoice()
        return
      }
      const stage = (live.stage as number) + 1
      apply(current.map((row) => (row.key === live.key ? { ...row, stage } : row)))
      setSelectedKey(live.key)
      if (stage === 3) setReceived((sum) => Math.round((sum + receivedBy(live)) * 100) / 100)
    }, STEP_MS)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, reduced, inView])

  const choose = (key: number) => {
    setSelectedKey(key)
    holdUntil.current = performance.now() + HOLD_MS
  }

  const selected = rows.find((row) => row.key === selectedKey) ?? rows[0]
  const stage = stageOf(selected)
  const link = payLink(selected.no)

  const copy = () => {
    void navigator.clipboard?.writeText(link).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div ref={sceneRef} data-el="invoicing__hero-scene-illustration" className="relative flex size-full flex-col items-center justify-end overflow-hidden px-4 pt-6 tablet:px-8 tablet:pt-10 max-desktop:min-h-[44rem]">
      <div
        data-el="invoicing__hero-scene-window"
        className="relative grid w-full max-w-290 grid-cols-1 overflow-hidden rounded-t-32 bg-surface-page ring-1 ring-border-subtle ring-inset desktop:h-full desktop:flex-none desktop:grid-cols-[minmax(0,1fr)_24rem]"
      >
        {/* The list. */}
        <div data-el="invoicing__hero-scene-list" className="flex min-w-0 flex-col gap-4 p-4 tablet:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <h2 className="type-heading-sm text-typography-primary">{heroScene.listTitle}</h2>
              <p data-el="invoicing__hero-scene-hint" className="type-ui-sm text-typography-secondary max-tablet:hidden">
                {touch ? heroScene.hintTouch : heroScene.hint}
              </p>
              <p data-el="invoicing__hero-scene-received" className="type-ui-sm text-typography-secondary">
                {heroScene.received} <CountedMoney value={received} suffix=" USDT" className="text-typography-success" />
              </p>
            </div>
            <button
              type="button"
              data-el="invoicing__hero-scene-new"
              onClick={addInvoice}
              className="type-ui-md rounded-pill bg-surface-inverse px-4 py-2 whitespace-nowrap text-typography-inverse transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand"
            >
              + {heroScene.newInvoice}
            </button>
          </div>

          <div className="type-ui-sm grid grid-cols-[minmax(0,1fr)_auto_auto] gap-x-4 px-4 text-typography-tertiary tablet:grid-cols-[minmax(0,1.4fr)_6rem_8rem_7.5rem]">
            <span>{heroScene.columns.client}</span>
            <span className="max-tablet:hidden">{heroScene.columns.due}</span>
            <span className="text-right">{heroScene.columns.amount}</span>
            <span className="max-tablet:hidden">{heroScene.columns.status}</span>
          </div>

          <ul data-el="invoicing__hero-scene-rows" className="flex flex-col">
            <AnimatePresence initial={false}>
              {rows.map((row, index) => (
                <motion.li
                  key={row.key}
                  // The new row opens from nothing and pushes the others down while the last one closes: only the height of the list
                  // animates (a layout animation of every row cost long tasks at CPU x4, docs/lessons.md).
                  initial={reduced || !animated ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: duration.reveal, ease: easeOut }}
                  className={`overflow-hidden pb-1.5 ${index >= 5 ? 'max-desktop:hidden' : index >= 4 ? 'max-tablet:hidden' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => choose(row.key)}
                    aria-pressed={row.key === selected.key}
                    data-invoice={row.no}
                    className={`grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-4 rounded-32 px-4 py-3 text-left ring-1 transition-colors ring-inset tablet:grid-cols-[minmax(0,1.4fr)_6rem_8rem_7.5rem] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand ${
                      row.key === selected.key ? 'bg-surface-subtle ring-border-medium' : 'bg-transparent ring-transparent hover:bg-surface-subtle'
                    }`}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="type-ui-md truncate text-typography-primary">{row.client}</span>
                      <span className="type-ui-sm text-typography-secondary">{row.no}</span>
                    </span>
                    <span className="type-ui-sm text-typography-secondary max-tablet:hidden">{row.due}</span>
                    <span className="type-ui-md text-right whitespace-nowrap text-typography-primary tabular-nums">
                      {row.currency} {formatMoney(row.amount)}
                    </span>
                    <span className="max-tablet:hidden">
                      <StatusPill status={row.stage === 'overdue' ? 'overdue' : STAGES[row.stage]}>{row.stage === 'overdue' ? heroScene.overdue : stageText[STAGES[row.stage]]}</StatusPill>
                    </span>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>

        {/* The open invoice. */}
        <aside
          data-el="invoicing__hero-scene-detail"
          aria-live="polite"
          className="flex min-w-0 flex-col gap-5 border-t border-border-subtle bg-surface-subtle p-4 tablet:p-6 desktop:border-t-0 desktop:border-l"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="type-heading-sm text-typography-primary">{selected.no}</p>
              <p className="type-ui-md truncate text-typography-secondary">{selected.client}</p>
            </div>
            <StatusPill status={selected.stage === 'overdue' ? 'overdue' : STAGES[selected.stage]}>
              {selected.stage === 'overdue' ? heroScene.overdue : stageText[STAGES[selected.stage]]}
            </StatusPill>
          </div>

          <TwinAmount local={selected.amount} currency={selected.currency} coin={toCoin(selected.amount, selected.currency)} pulse={stage} size="md" layout="stack" />

          <p data-el="invoicing__hero-scene-rate" className="type-ui-sm -mt-3 text-typography-secondary">
            {heroScene.detail.rate} 1 USDT = {selected.currency} {RATES[selected.currency].toFixed(2)}
          </p>

          <DotLane stage={stage} live={stage < 4} compact />
          <p className="type-ui-md text-typography-primary">{heroScene.said[STAGES[stage]]}</p>

          <div className="flex flex-col gap-2">
            <p className="type-ui-sm text-typography-secondary">{heroScene.detail.link}</p>
            <div className="flex items-center justify-between gap-3 rounded-pill bg-surface-page py-2 pr-2 pl-4 ring-1 ring-border-subtle ring-inset">
              <span data-el="invoicing__hero-scene-link" className="type-code-sm truncate text-typography-primary">
                {link}
              </span>
              <button
                type="button"
                onClick={copy}
                className="type-ui-sm inline-flex items-center gap-1.5 rounded-pill bg-surface-subtle px-3 py-1.5 whitespace-nowrap text-typography-primary ring-1 ring-border-subtle transition-colors ring-inset hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand"
              >
                <CopyIcon />
                {copied ? heroScene.detail.copied : heroScene.detail.copy}
              </button>
            </div>
          </div>

          <ul className="flex flex-col max-desktop:hidden" aria-hidden="true">
            {STAGES.slice(0, stage + 1)
              .map((name, index) => (
                <li key={name} className="type-ui-sm flex items-center justify-between gap-3 border-b border-border-subtle py-2 text-typography-secondary last:border-b-0">
                  <span className={index === stage ? 'text-typography-primary' : ''}>{`invoice.${name}`}</span>
                  <span className="tabular-nums">{stageClock[index]}</span>
                </li>
              ))
              .reverse()}
          </ul>
        </aside>
      </div>
    </div>
  )
}
