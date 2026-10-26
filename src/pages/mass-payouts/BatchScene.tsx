import { useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react'
import { Container } from '../../components/ui/Container'
import { CornerDots } from '../../components/ui/CornerDots'
import { TypedLog, type LogLine } from '../../components/ui/TypedLog'
import { Reveal, RevealLines } from '../../motion/reveal'
import { useRevealOn } from '../../motion/useReveal'
import { batchContent } from './content'
import { batchCountries, batchTotal, BROKEN_ID, csvLines, nextRuns, recipients, runLabel, usdt, formatAmount } from './demo'
import { batchScene } from './sceneText'

type Source = 'csv' | 'api' | 'schedule'
const sources: readonly Source[] = ['csv', 'api', 'schedule']

/** The rows of the table come one after another, then each one is checked: `step` counts the beats (about 150 ms each). */
const BEAT_MS = 150
const FULL = recipients.length + 3

const pill =
  'type-ui-md rounded-pill px-5 py-3 whitespace-nowrap transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand disabled:opacity-50'
const dark = `${pill} bg-surface-inverse text-typography-inverse hover:opacity-90`
const light = `${pill} bg-surface-subtle text-typography-primary ring-1 ring-border-subtle ring-inset hover:bg-surface-hover`

/**
 * Block 1 of the Mass Payouts page: "Bring your list. We check it." `mass-payouts__batch`.
 * One list becomes a batch in three ways (a switch): a CSV file (drop one, or use the sample: the rows appear and are checked, one has an error and a "Fix"),
 * a request to the API (it is typed, and the same batch comes back checked), or a schedule (every month on the 1st). Each way keeps its own state.
 * Texts inside the scene are part of the picture: they are not revealed by words.
 */
export function BatchScene() {
  const [source, setSource] = useState<Source>('csv')

  return (
    <section id="how-it-works" data-el="mass-payouts__batch" aria-labelledby="mass-payouts-batch-title" className="border-y border-border-subtle">
      <Container>
        <div className="relative flex flex-col items-center gap-8 py-12 column-lines tablet:gap-10 tablet:px-8 tablet:py-20 desktop:gap-12 desktop:px-10 desktop:py-35">
          <div className="flex flex-col items-center gap-4 text-center tablet:gap-6">
            <RevealLines
              id="mass-payouts-batch-title"
              data-el="mass-payouts__batch-title"
              className="type-heading-lg max-w-156 text-balance text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm"
              lines={[batchContent.title]}
            />
            <RevealLines as="p" delay={0.3} data-el="mass-payouts__batch-intro" className="type-body-md max-w-150 text-typography-secondary tablet:type-body-lead" lines={[batchContent.intro]} />
          </div>

          <Reveal
            variant="card"
            data-el="mass-payouts__batch-illustration"
            className="w-full rounded-32 bg-surface-subtle p-4 ring-1 ring-border-subtle ring-inset tablet:p-10 desktop:rounded-48 desktop:p-15"
          >
            <div className="mx-auto flex w-full max-w-240 flex-col gap-8">
              <fieldset className="m-0 flex min-w-0 justify-center gap-2 border-0 p-0">
                <legend className="sr-only">{batchScene.sourceAria}</legend>
                {sources.map((value) => (
                  <button
                    key={value}
                    type="button"
                    data-el={`mass-payouts__batch-source-${value}`}
                    aria-pressed={source === value}
                    onClick={() => setSource(value)}
                    className={`flex flex-col items-start rounded-16 px-4 py-2 text-left ring-1 transition-colors ring-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand ${
                      source === value ? 'bg-surface-inverse text-typography-inverse ring-transparent' : 'bg-surface-page text-typography-primary ring-border-subtle hover:bg-surface-hover'
                    }`}
                  >
                    <span className="type-ui-md">{batchScene.sources[value].label}</span>
                    <span className={`type-ui-sm ${source === value ? 'text-typography-inverse/70' : 'text-typography-secondary'}`}>{batchScene.sources[value].caption}</span>
                  </button>
                ))}
              </fieldset>

              {source === 'csv' && <CsvPanel key="csv" />}
              {source === 'api' && <ApiPanel key="api" />}
              {source === 'schedule' && <SchedulePanel key="schedule" />}
            </div>
          </Reveal>

          <CornerDots edge="top" block="mass-payouts-batch" />
          <CornerDots edge="bottom" block="mass-payouts-batch" />
        </div>
      </Container>
    </section>
  )
}

/**
 * The table with its summary: the rows come in one by one and each is checked (all at once when nothing animates). It is mounted anew (a new `key`)
 * whenever the list is added again, so the beats start from the first row.
 */
function Checked({ broken, fixed, onFix }: { broken: boolean; fixed: boolean; onFix: () => void }) {
  const animated = useRevealOn()
  const [beat, setBeat] = useState(animated ? 0 : FULL)
  useEffect(() => {
    if (!animated) return
    const timer = window.setInterval(() => setBeat((current) => Math.min(FULL, current + 1)), BEAT_MS)
    return () => window.clearInterval(timer)
  }, [animated])
  return (
    <>
      <Table beat={beat} broken={broken} onFix={onFix} fixed={fixed} />
      <Summary checked={beat >= recipients.length + 2} error={broken && !fixed} />
    </>
  )
}

/** The table of recipients: the rows come in one by one, each is checked; the first one of the CSV has an error until it is fixed. */
function Table({ beat, broken, onFix, fixed }: { beat: number; broken: boolean; onFix: () => void; fixed: boolean }) {
  const shown = Math.min(recipients.length, beat)
  const checked = Math.min(recipients.length, Math.max(0, beat - 2))
  const cell = 'px-3 py-2 tablet:px-4'
  return (
    <div data-el="mass-payouts__batch-table" className="overflow-hidden rounded-24 bg-surface-page ring-1 ring-border-subtle ring-inset">
      <table className="w-full text-left">
        <caption className="type-ui-md px-4 py-3 text-left text-typography-secondary">{batchScene.tableTitle}</caption>
        <thead>
          <tr className="type-ui-sm border-y border-border-subtle text-typography-secondary">
            <th className={`${cell} font-normal`}>{batchScene.columns.recipient}</th>
            <th className={`${cell} hidden font-normal tablet:table-cell`}>{batchScene.columns.country}</th>
            <th className={`${cell} text-right font-normal`}>{batchScene.columns.amount}</th>
            <th className={`${cell} font-normal`}>{batchScene.columns.check}</th>
          </tr>
        </thead>
        <tbody>
          {recipients.map((item, position) => {
            const visible = position < shown
            const done = position < checked
            const failing = broken && item.id === BROKEN_ID && !fixed
            return (
              <tr key={item.id} data-el={`mass-payouts__batch-row-${item.id}`} className={`border-b border-border-subtle transition-opacity duration-300 last:border-b-0 ${visible ? 'opacity-100' : 'opacity-0'}`}>
                <td className={`${cell} type-ui-md text-typography-primary`}>
                  {item.name}
                  <span className="type-ui-sm block text-typography-secondary tablet:hidden">{item.country}</span>
                </td>
                <td className={`${cell} type-ui-md hidden text-typography-secondary tablet:table-cell`}>{item.country}</td>
                <td className={`${cell} type-ui-md text-right tabular-nums text-typography-primary`}>{formatAmount(item.amount)}</td>
                <td className={`${cell} type-ui-md`} data-el={`mass-payouts__batch-check-${item.id}`}>
                  {!done ? (
                    <span className="text-typography-secondary">{visible ? batchScene.checking : ''}</span>
                  ) : failing ? (
                    <span className="flex flex-wrap items-center gap-2 text-typography-brand">
                      {batchScene.error}
                      <button type="button" data-el="mass-payouts__batch-fix" aria-label={batchScene.fixAria} onClick={onFix} className="type-ui-sm rounded-pill bg-surface-inverse px-3 py-1 text-typography-inverse hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand">
                        {batchScene.fix}
                      </button>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-typography-primary" aria-label={batchScene.valid}>
                      <span aria-hidden="true" className="text-typography-brand">
                        ✓
                      </span>
                      {broken && item.id === BROKEN_ID ? <span className="type-ui-sm text-typography-secondary">{batchScene.fixed}</span> : null}
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Summary({ checked, error }: { checked: boolean; error: boolean }) {
  if (!checked) {
    return (
      <p data-el="mass-payouts__batch-summary" className="type-heading-sm text-typography-secondary">
        {batchScene.checking}
      </p>
    )
  }
  if (error) {
    return (
      <p data-el="mass-payouts__batch-summary" className="type-heading-sm text-typography-primary">
        {batchScene.summaryFix(recipients.length - 1, recipients.length, 1)}
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-1">
      <p data-el="mass-payouts__batch-summary" className="type-heading-sm text-typography-primary">
        {batchScene.summaryReady(recipients.length, batchCountries)}
      </p>
      <p data-el="mass-payouts__batch-summary-total" className="type-ui-md text-typography-secondary">
        {batchScene.summaryTotal(usdt(batchTotal))}
      </p>
    </div>
  )
}

function Hint({ name, children }: { name: string; children: ReactNode }) {
  return (
    <p data-el={name} className="type-ui-sm text-typography-secondary">
      {children}
    </p>
  )
}

function CsvPanel() {
  const [loaded, setLoaded] = useState(false)
  const [own, setOwn] = useState(false)
  const [over, setOver] = useState(false)
  const [wrong, setWrong] = useState(false)
  const [fixed, setFixed] = useState(false)
  const [loads, setLoads] = useState(0)

  const load = (fromFile: boolean) => {
    setOwn(fromFile)
    setWrong(false)
    setFixed(false)
    setLoads((current) => current + 1)
    setLoaded(true)
  }
  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setOver(false)
    const file = event.dataTransfer.files[0]
    if (file && /\.csv$/i.test(file.name)) load(true)
    else setWrong(true)
  }

  if (!loaded) {
    return (
      <div className="flex flex-col gap-4">
        <div
          data-el="mass-payouts__batch-drop"
          onDragOver={(event) => {
            event.preventDefault()
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center gap-3 rounded-24 border-2 border-dashed px-6 py-10 text-center transition-colors ${
            over ? 'border-typography-brand bg-surface-page' : 'border-border-medium bg-surface-page/60'
          }`}
        >
          <p data-el="mass-payouts__batch-drop-title" className="type-heading-sm text-typography-primary">
            {over ? batchScene.dragOver : batchScene.dropTitle}
          </p>
          <p className="type-ui-sm text-typography-secondary">{batchScene.dropOr}</p>
          <button type="button" data-el="mass-payouts__batch-sample" onClick={() => load(false)} className={dark}>
            {batchScene.sample}
          </button>
          <p className="type-ui-sm text-typography-secondary">{batchScene.dropFormat}</p>
          <p className="type-ui-sm text-typography-secondary">{batchScene.dropCurrency}</p>
          <pre aria-hidden="true" className="type-code-sm rounded-16 bg-surface-subtle px-4 py-3 text-left text-typography-secondary">
            {[...csvLines.slice(0, 3), '…'].join('\n')}
          </pre>
          {wrong && (
            <p data-el="mass-payouts__batch-drop-wrong" className="type-ui-md text-typography-brand">
              {batchScene.dropWrong}
            </p>
          )}
        </div>
        <Hint name="mass-payouts__batch-hint-csv">{batchScene.hintCsv}</Hint>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p data-el="mass-payouts__batch-file" className="type-ui-md inline-flex w-fit items-center gap-2 rounded-pill bg-surface-page px-4 py-2 text-typography-primary ring-1 ring-border-subtle ring-inset">
            {batchScene.file}
          </p>
          {own && (
            <p data-el="mass-payouts__batch-file-note" className="type-ui-sm text-typography-secondary">
              {batchScene.fileNote}
            </p>
          )}
        </div>
        <button type="button" data-el="mass-payouts__batch-reset" onClick={() => setLoaded(false)} className={light}>
          {batchScene.reset}
        </button>
      </div>
      <Checked key={loads} broken fixed={fixed} onFix={() => setFixed(true)} />
    </div>
  )
}

const apiRequest: readonly LogLine[] = [
  { text: 'POST /v1/payout-batches', tone: 'event' },
  { text: '{', tone: 'text' },
  { text: '  "currency": "USDT",', tone: 'text' },
  { text: '  "recipients": [', tone: 'text' },
  { text: '    { "name": "Anna Keller", "country": "DE", "amount": 1200.00 },', tone: 'text' },
  { text: '    { "name": "Lucas Almeida", "country": "BR", "amount": 900.00 },', tone: 'text' },
  { text: '    … 8 more', tone: 'muted' },
  { text: '  ]', tone: 'text' },
  { text: '}', tone: 'text' },
  { text: batchScene.response[0], tone: 'ok' },
  { text: batchScene.response[1], tone: 'text' },
]

function ApiPanel() {
  const animated = useRevealOn()
  const [stage, setStage] = useState<'idle' | 'typing' | 'done'>('idle')
  const [run, setRun] = useState(0)
  const logFinished = useRef(false)

  const send = () => {
    logFinished.current = false
    setRun((current) => current + 1)
    setStage('typing')
  }

  return (
    <div className="grid gap-6 desktop:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col gap-4">
        {stage === 'idle' ? (
          <div className="flex min-h-48 items-center justify-center rounded-24 bg-surface-page p-6 text-center ring-1 ring-border-subtle ring-inset">
            <Hint name="mass-payouts__batch-hint-api">{batchScene.hintApi}</Hint>
          </div>
        ) : (
          <TypedLog
            key={run}
            data-el="mass-payouts__batch-api-log"
            rounded="rounded-24"
            lines={apiRequest}
            instant={!animated}
            onDone={(done) => {
              if (done && !logFinished.current) {
                logFinished.current = true
                setStage('done')
              }
            }}
          />
        )}
        <div>
          <button type="button" data-el="mass-payouts__batch-send" disabled={stage === 'typing'} onClick={send} className={dark}>
            {stage === 'typing' ? batchScene.sending : stage === 'done' ? batchScene.sendAgain : batchScene.send}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {stage === 'done' ? (
          <Checked key={run} broken={false} fixed onFix={() => {}} />
        ) : (
          <div className="flex min-h-48 items-center justify-center rounded-24 border-2 border-dashed border-border-medium p-6 text-center">
            <p className="type-ui-sm text-typography-secondary">{batchScene.tableTitle}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function SchedulePanel() {
  const [saved, setSaved] = useState<Date[] | null>(null)
  const row = (label: string, value: string, name: string) => (
    <div className="flex items-baseline justify-between gap-4 border-t border-border-subtle pt-4">
      <p className="type-ui-md text-typography-secondary">{label}</p>
      <p data-el={name} className="type-ui-lg text-right text-typography-primary">
        {value}
      </p>
    </div>
  )
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-24 bg-surface-page p-5 ring-1 ring-border-subtle ring-inset tablet:p-6">
      {row(batchScene.schedule.repeat, batchScene.schedule.repeatValue, 'mass-payouts__batch-schedule-repeat')}
      {row(batchScene.schedule.next, saved ? runLabel(saved[0]) : '–', 'mass-payouts__batch-schedule-next')}
      {row(batchScene.schedule.batch, batchScene.schedule.batchValue(recipients.length, usdt(batchTotal)), 'mass-payouts__batch-schedule-batch')}
      <p data-el="mass-payouts__batch-schedule-note" className="type-ui-sm text-typography-secondary">
        {batchScene.schedule.note}
      </p>
      {saved && (
        <p data-el="mass-payouts__batch-schedule-upcoming" className="type-ui-md text-typography-primary">
          {batchScene.schedule.upcoming} · {saved.map((date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })).join(' · ')}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" data-el="mass-payouts__batch-schedule-save" disabled={saved !== null} onClick={() => setSaved(nextRuns(new Date()))} className={dark}>
          {saved ? batchScene.schedule.saved : batchScene.schedule.save}
        </button>
        {!saved && <Hint name="mass-payouts__batch-hint-schedule">{batchScene.schedule.hint}</Hint>}
      </div>
    </div>
  )
}
