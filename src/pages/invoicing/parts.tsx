import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { duration, easeOut } from '../../motion/tokens'
import { COIN, formatMoney, STAGES, type Currency, type Stage } from './demo'
import { stageText } from './sceneText'

/* The small pieces the scenes of the Invoicing page share: icons, the number that counts, the "twin" amount, the lane of statuses, the pill. */

export function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function EyeIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8 12.1 12.5 8 12.5 1.5 8 1.5 8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="1.9" fill="currentColor" />
    </svg>
  )
}

export function CopyIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <rect x="5.5" y="5.5" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 3.5v-.2A1.8 1.8 0 008.7 1.5H4.3a1.8 1.8 0 00-1.8 1.8v4.4a1.8 1.8 0 001.8 1.8h.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/** A sum that counts to its new value when it changes (the first value stands at once). */
export function CountedMoney({ value, suffix = '', prefix = '', className = '' }: { value: number; suffix?: string; prefix?: string; className?: string }) {
  const reduced = useReducedMotion() ?? false
  const motionValue = useMotionValue(value)
  const text = useTransform(motionValue, (current) => `${prefix}${formatMoney(current)}${suffix}`)
  const first = useRef(true)

  useEffect(() => {
    if (first.current || reduced) {
      first.current = false
      motionValue.set(value)
      return
    }
    const controls = animate(motionValue, value, { duration: 0.5, ease: easeOut })
    return () => controls.stop()
  }, [value, reduced, motionValue])

  return <motion.span className={`tabular-nums ${className}`}>{text}</motion.span>
}

/**
 * The idea of the product in one picture: the same invoice in two currencies. The sum in the currency of the client, a dotted bridge with a dot
 * running over it, the sum in the coin. `row` puts them side by side, `stack` one under the other (narrow places). The dot runs again
 * every time `pulse` grows.
 */
export function TwinAmount({
  local,
  currency,
  coin,
  pulse = 0,
  layout = 'row',
  size = 'lg',
}: {
  local: number
  currency: Currency
  coin: number
  pulse?: number
  layout?: 'row' | 'stack'
  size?: 'md' | 'lg'
}) {
  const reduced = useReducedMotion() ?? false
  const type = size === 'lg' ? 'type-heading-md tablet:type-heading-lg' : 'type-heading-sm'
  const stacked = layout === 'stack'
  return (
    <div data-el="invoicing__twin" className={stacked ? 'flex flex-col items-start gap-1' : 'flex flex-wrap items-center gap-x-3 gap-y-1'}>
      <p className={`${type} whitespace-nowrap text-typography-primary`}>
        <span className="text-typography-secondary">{currency}</span> <CountedMoney value={local} />
      </p>
      <span
        aria-hidden="true"
        className={`relative ${stacked ? 'ml-2 h-6 w-px border-l-2' : 'h-px min-w-8 flex-1 border-t-2'} border-dashed border-typography-tertiary`}
      >
        {pulse > 0 && !reduced && (
          <motion.span
            key={pulse}
            className={`absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-typography-brand ${stacked ? 'left-0' : 'top-0'}`}
            initial={stacked ? { top: '0%', opacity: 1 } : { left: '0%', opacity: 1 }}
            animate={stacked ? { top: '100%', opacity: [1, 1, 0] } : { left: '100%', opacity: [1, 1, 0] }}
            transition={{ duration: duration.reveal, ease: easeOut }}
          />
        )}
      </span>
      <p className={`${type} whitespace-nowrap text-typography-brand`}>
        <CountedMoney value={coin} /> {COIN}
      </p>
    </div>
  )
}

/**
 * The statuses of an invoice as a dotted lane: Created, Sent, Viewed, Paid, Reconciled. The dots up to `stage` are brand-colored, the dashes
 * between them fill in; the dot of the current stage breathes while `live` is set (the invoice is still going).
 */
export function DotLane({ stage, live = true, compact = false }: { stage: number; live?: boolean; compact?: boolean }) {
  const reduced = useReducedMotion() ?? false
  return (
    <ol data-el="invoicing__lane" aria-label={stageText[STAGES[Math.min(stage, STAGES.length - 1)]]} className="relative grid grid-cols-5">
      {STAGES.map((name, index) => {
        const reached = index <= stage
        return (
          <li key={name} className="relative flex flex-col items-center gap-2">
            {index > 0 && (
              <span aria-hidden="true" className="absolute top-[7px] right-1/2 left-[-50%] border-t-2 border-dashed border-typography-tertiary">
                <motion.span
                  className="absolute inset-x-0 -top-0.5 block origin-left border-t-2 border-dashed border-typography-brand"
                  initial={false}
                  animate={{ scaleX: index <= stage ? 1 : 0 }}
                  transition={{ duration: reduced ? 0 : 0.5, ease: easeOut }}
                />
              </span>
            )}
            <span
              data-reached={reached}
              className={`relative z-10 size-4 rounded-pill ring-4 ring-surface-page transition-colors ${reached ? 'bg-typography-brand' : 'bg-border-strong'} ${
                live && index === stage && !reduced ? 'animate-pulse' : ''
              }`}
            />
            <span className={`type-ui-sm text-center transition-colors ${reached ? 'text-typography-primary' : 'text-typography-tertiary'} ${compact ? 'max-tablet:hidden' : ''}`}>
              {stageText[name]}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

const pillTone: Record<Stage | 'overdue', string> = {
  created: 'bg-surface-hover text-typography-secondary',
  sent: 'bg-surface-hover text-typography-primary',
  viewed: 'bg-surface-hover text-typography-primary',
  paid: 'bg-surface-success-secondary text-typography-success',
  reconciled: 'bg-surface-success-secondary text-typography-success',
  overdue: 'bg-surface-brand-light text-typography-brand',
}

/** The status of an invoice as a pill; the eye says the client has opened it, the tick that the payment has found its invoice. */
export function StatusPill({ status, children }: { status: Stage | 'overdue'; children: ReactNode }) {
  return (
    <span data-status={status} className={`type-ui-sm inline-flex items-center gap-1.5 rounded-pill px-3 py-1 whitespace-nowrap transition-colors ${pillTone[status]}`}>
      {status === 'viewed' && <EyeIcon />}
      {status === 'reconciled' && <CheckIcon />}
      {children}
    </span>
  )
}
