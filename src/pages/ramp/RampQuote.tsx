import { useEffect, useRef, useState } from 'react'
import { Container } from '../../components/ui/Container'
import { CornerDots } from '../../components/ui/CornerDots'
import { Reveal, RevealLines } from '../../motion/reveal'
import { useRevealOn } from '../../motion/useReveal'
import { COIN, EXAMPLE, formatAmount, formatRate, getText, quote, QUOTE_SECONDS, sendText, type Direction } from './demo'
import { quoteContent } from './content'
import { seeded } from './glyphs'
import { AmountField, DirectionSwitch } from './parts'
import { HISTORY, RateChart, TICK_MS } from './RateChart'
import { quoteScene, receiptLabels } from './sceneText'

type Status = 'live' | 'locked' | 'done'

/** The price is rounded the way it is shown, so that the receipt adds up to what the visitor reads. */
const roundRate = (value: number) => (value < 10 ? Math.round(value * 10000) / 10000 : Math.round(value * 100) / 100)

/** The next price of the walk: it is pulled back to its base and shaken a little, and never strays further than the chart is high. */
const nextRate = (previous: number, base: number, random: () => number = Math.random) => {
  const pulled = previous + (base - previous) * 0.18 + (random() - 0.5) * base * 0.004
  return roundRate(Math.min(base * 1.0065, Math.max(base * 0.9935, pulled)))
}

/**
 * The first `HISTORY` prices: a steady (seeded) walk around the base that ends exactly on it, so that the chart is never a flat row of dots,
 * also when nothing moves (reduced motion) and in the tests.
 */
const startHistory = (base: number) => {
  const random = seeded(2)
  const walk: number[] = []
  let value = base
  for (let index = 0; index < HISTORY; index++) {
    value = nextRate(value, base, random)
    walk.push(value)
  }
  const shift = walk[walk.length - 1] - base
  return walk.map((price) => roundRate(price - shift))
}

/**
 * Block 2 of the ramp page: "Know the price before you pay." `ramp__quote`.
 * The left half is the live price of 1 USDT as floating dots; the right half is the receipt of the transfer (an example in euros, the block's own).
 * "Lock the rate" holds the price for 30 seconds (a straight line on the chart, a ring that runs down); "Confirm" makes the transfer, and when the time
 * runs out the quote updates by itself. Texts inside the scene are part of the picture: they are not revealed by words.
 */
export function RampQuote() {
  // This block keeps its own direction and sum (an example in euros): the other scenes of the page do not follow them.
  const [direction, setDirection] = useState<Direction>('on')
  const [amount, setAmount] = useState<number>(EXAMPLE.amount)
  const animated = useRevealOn()
  const chosen = EXAMPLE
  const base = chosen.rate

  const [rate, setRate] = useState(base)
  const rateRef = useRef(base)
  const history = useRef<number[]>(startHistory(base))
  const tickAt = useRef(0)
  const [status, setStatus] = useState<Status>('live')
  const [heldRate, setHeldRate] = useState(base)
  const [left, setLeft] = useState(QUOTE_SECONDS)
  const [expired, setExpired] = useState(false)
  // The price moves: a new rate arrives every `TICK_MS`, and the dots glide one place to the left.
  useEffect(() => {
    if (!animated) return
    const timer = window.setInterval(() => {
      const next = nextRate(rateRef.current, base)
      rateRef.current = next
      history.current = [...history.current.slice(1), next]
      tickAt.current = performance.now()
      setRate(next)
    }, TICK_MS)
    return () => window.clearInterval(timer)
  }, [animated, base])

  // A held quote runs down second by second; at zero the price is live again.
  useEffect(() => {
    if (status !== 'locked') return
    let remaining = QUOTE_SECONDS
    const timer = window.setInterval(() => {
      remaining -= 1
      if (remaining <= 0) {
        setStatus('live')
        setExpired(true)
      } else setLeft(remaining)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [status])

  const lock = () => {
    setHeldRate(rate)
    setLeft(QUOTE_SECONDS)
    setExpired(false)
    setStatus('locked')
  }
  const release = () => {
    setExpired(false)
    setStatus('live')
  }

  const held = status !== 'live'
  const used = held ? heldRate : rate
  const valid = amount > 0
  const result = quote(direction, amount, used)
  const sendCode = direction === 'on' ? chosen.code : COIN
  const time = `0:${String(left).padStart(2, '0')}`
  const done = quoteScene.done[direction]

  const row = (label: string, value: string, name: string, strong = false) => (
    <div className="flex items-baseline justify-between gap-4 border-t border-border-subtle pt-4">
      <p className="type-ui-md text-typography-secondary">{label}</p>
      <p data-el={`ramp__quote-row-${name}`} className={`${strong ? 'type-heading-sm' : 'type-ui-lg'} text-typography-primary`}>
        {valid ? value : '–'}
      </p>
    </div>
  )

  return (
    <section data-el="ramp__quote" aria-labelledby="ramp-quote-title" className="border-b border-border-subtle">
      <Container>
        <div className="relative flex flex-col items-center gap-8 py-12 column-lines tablet:gap-10 tablet:px-8 tablet:py-20 desktop:gap-12 desktop:px-10 desktop:py-35">
          <div className="flex flex-col items-center gap-4 text-center tablet:gap-6">
            <RevealLines
              id="ramp-quote-title"
              data-el="ramp__quote-title"
              className="type-heading-lg max-w-156 text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm"
              lines={[quoteContent.title]}
            />
            <RevealLines as="p" delay={0.3} data-el="ramp__quote-intro" className="type-body-md max-w-150 text-typography-secondary tablet:type-body-lead" lines={[quoteContent.intro]} />
          </div>

          <Reveal
            variant="card"
            data-el="ramp__quote-illustration"
            className="w-full rounded-32 bg-surface-subtle p-4 ring-1 ring-border-subtle ring-inset tablet:p-10 desktop:rounded-48 desktop:p-15"
          >
            <div className="mx-auto grid w-full max-w-240 gap-6 desktop:grid-cols-[1.15fr_1fr] desktop:gap-8">
              {/* The price. */}
              <div className="flex flex-col gap-4 rounded-32 bg-surface-page p-5 ring-1 ring-border-subtle ring-inset tablet:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <p data-el="ramp__quote-status" data-status={status} className="type-ui-md inline-flex items-center gap-2 text-typography-primary">
                      <span className={`size-2 rounded-pill ${held ? 'bg-typography-brand' : 'animate-pulse bg-typography-secondary'}`} />
                      {held ? quoteScene.locked : quoteScene.live}
                    </p>
                    <p data-el="ramp__quote-rate" className="type-heading-sm text-typography-primary">
                      1 {COIN} = {chosen.code} {formatRate(used, true)}
                    </p>
                    <p className="type-ui-sm text-typography-secondary">{quoteScene.chartCaption(chosen.code)}</p>
                  </div>
                  {status === 'locked' && (
                    <div data-el="ramp__quote-timer" className="flex items-center gap-3">
                      <svg aria-hidden="true" width="48" height="48" viewBox="0 0 48 48" className="-rotate-90 text-typography-brand">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth="3" />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 20}
                          strokeDashoffset={2 * Math.PI * 20 * (1 - left / QUOTE_SECONDS)}
                          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                        />
                      </svg>
                      <p className="type-ui-lg text-typography-primary">{quoteScene.lockedFor(time)}</p>
                    </div>
                  )}
                </div>
                <div className="min-h-52 flex-1 tablet:min-h-64">
                  <RateChart history={history} tickAt={tickAt} base={base} locked={held ? heldRate : null} />
                </div>
              </div>

              {/* The receipt. */}
              <div className="flex flex-col gap-4 rounded-32 bg-surface-page p-5 ring-1 ring-border-subtle ring-inset tablet:p-6" aria-live="polite">
                <DirectionSwitch name="ramp__quote" direction={direction} onChange={setDirection} />
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="ramp-quote-amount" className="type-ui-md text-typography-secondary">
                    {receiptLabels.send}
                  </label>
                  <div className="flex min-w-0 max-w-64 flex-1">
                    <AmountField
                      id="ramp-quote-amount"
                      dataEl="ramp__quote-amount"
                      amount={amount}
                      code={sendCode}
                      codeFirst={direction === 'on'}
                      placeholder="–"
                      readOnly={held}
                      format={formatAmount}
                      onChange={setAmount}
                    />
                  </div>
                </div>
                {row(receiptLabels.fee, sendText(direction, chosen.code, result.fee), 'fee')}
                {row(receiptLabels.rate, `1 ${COIN} = ${chosen.code} ${formatRate(used, true)}`, 'rate')}
                {row(receiptLabels.get, getText(direction, chosen.code, result.get), 'get', true)}

                {status === 'done' ? (
                  <div data-el="ramp__quote-result" className="flex flex-col gap-1 rounded-32 bg-surface-subtle p-4 ring-1 ring-border-subtle ring-inset">
                    <p className="type-heading-sm text-typography-primary">{done.title}</p>
                    <p className="type-ui-md text-typography-secondary">{done.text(sendText(direction, chosen.code, result.send), getText(direction, chosen.code, result.get))}</p>
                  </div>
                ) : expired ? (
                  <p data-el="ramp__quote-expired" className="type-ui-md text-typography-brand">
                    {quoteScene.expired}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-3 pt-1">
                  {status === 'live' && (
                    <button
                      type="button"
                      data-el="ramp__quote-lock"
                      disabled={!valid}
                      onClick={lock}
                      className="type-ui-md rounded-pill bg-surface-inverse px-5 py-3 whitespace-nowrap text-typography-inverse transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand disabled:opacity-40"
                    >
                      {quoteScene.lock}
                    </button>
                  )}
                  {status === 'locked' && (
                    <>
                      <button
                        type="button"
                        data-el="ramp__quote-confirm"
                        onClick={() => setStatus('done')}
                        className="type-ui-md rounded-pill bg-surface-inverse px-5 py-3 whitespace-nowrap text-typography-inverse transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand"
                      >
                        {quoteScene.confirm}
                      </button>
                      <button
                        type="button"
                        data-el="ramp__quote-cancel"
                        onClick={release}
                        className="type-ui-md rounded-pill bg-surface-subtle px-5 py-3 whitespace-nowrap text-typography-primary ring-1 ring-border-subtle transition-colors ring-inset hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand"
                      >
                        {quoteScene.cancel}
                      </button>
                    </>
                  )}
                  {status === 'done' && (
                    <button
                      type="button"
                      data-el="ramp__quote-new"
                      onClick={release}
                      className="type-ui-md rounded-pill bg-surface-subtle px-5 py-3 whitespace-nowrap text-typography-primary ring-1 ring-border-subtle transition-colors ring-inset hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand"
                    >
                      {quoteScene.newQuote}
                    </button>
                  )}
                </div>
                <p data-el="ramp__quote-hint" className="type-ui-sm text-typography-secondary">
                  {status === 'live' ? quoteScene.hint : status === 'locked' ? quoteScene.hintLocked : quoteScene.hintDone}
                </p>
              </div>
            </div>
          </Reveal>

          <CornerDots edge="top" block="ramp-quote" />
          <CornerDots edge="bottom" block="ramp-quote" />
        </div>
      </Container>
    </section>
  )
}
