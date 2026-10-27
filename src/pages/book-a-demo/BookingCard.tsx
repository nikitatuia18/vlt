import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { ButtonLink } from '../../components/ui/ButtonLink'
import { InteractiveDots } from '../../components/ui/InteractiveDots'
import { scrollToSection } from '../../lib/smoothScroll'
import { Reveal, RevealLines } from '../../motion/reveal'
import { duration, easeOut } from '../../motion/tokens'
import { calendarFallbackUrl, calendarUrl, calendlyEvent, loadCalendly } from './calendly'
import { bookDemo } from './content'

/**
 * The card of the page, one place for the whole booking:
 *   idle      the button
 *   loading   the widget of Calendly is being loaded (only now, not with the page) and starts
 *   calendar  the calendar of Calendly stands in the card (colors of the site)
 *   booked    Calendly said "event scheduled": our message instead of the calendar
 *   error     the widget could not load: a link to the calendar in a new tab
 */
type State = 'idle' | 'loading' | 'calendar' | 'booked' | 'error'

/** The calendar is a third-party frame: it is as high as it needs to show a month and the times (and it scrolls inside if not). */
const CALENDAR_HEIGHT = 700
/** Calendly does not say "loaded" in every case: after this the veil comes off anyway (ms). */
const VEIL_MAX_MS = 4000

function CheckMark({ reduced }: { reduced: boolean }) {
  return (
    <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-pill bg-surface-success-secondary text-typography-success">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <motion.path
          d="M7 16.5l6.2 6.2L25 10.5"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: duration.reveal, ease: easeOut, delay: 0.15 }}
        />
      </svg>
    </span>
  )
}

export function BookingCard() {
  const reduced = useReducedMotion() ?? false
  const [state, setState] = useState<State>('idle')
  const [veil, setVeil] = useState(true)
  const widgetRef = useRef<HTMLDivElement>(null)
  const bookedRef = useRef<HTMLDivElement>(null)
  const inProgress = state === 'loading' || state === 'calendar'

  const open = (event: MouseEvent) => {
    // The button is a link to the card (it works without scripts as a jump); here it opens the calendar instead.
    event.preventDefault()
    if (state !== 'idle' && state !== 'error') return
    setVeil(true)
    setState('loading')
    // Below the desktop width (1280) the card is under the text and may be off the screen.
    if (window.matchMedia('(max-width: 1279px)').matches) scrollToSection('book-a-demo-card')
  }

  // Loading: the widget is fetched once and put into the card.
  useEffect(() => {
    if (state !== 'loading') return
    let cancelled = false
    loadCalendly()
      .then((calendly) => {
        if (cancelled || !widgetRef.current) return
        calendly.initInlineWidget({ url: calendarUrl(), parentElement: widgetRef.current })
        setState('calendar')
      })
      .catch(() => {
        if (!cancelled) setState('error')
      })
    return () => {
      cancelled = true
    }
  }, [state])

  // While the calendar is open: its messages say that it is shown and that a time is booked.
  useEffect(() => {
    if (!inProgress) return
    const onMessage = (message: MessageEvent) => {
      const kind = calendlyEvent(message)
      if (kind === 'scheduled') setState('booked')
      else if (kind === 'viewed') setVeil(false)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [inProgress])

  useEffect(() => {
    if (state !== 'calendar') return
    const timer = window.setTimeout(() => setVeil(false), VEIL_MAX_MS)
    return () => window.clearTimeout(timer)
  }, [state])

  // The message replaces the calendar: it is read out (aria-live) and the focus does not stay in the removed frame.
  useEffect(() => {
    if (state === 'booked') bookedRef.current?.focus({ preventScroll: true })
  }, [state])

  const { card } = bookDemo

  return (
    <div
      id="book-a-demo-card"
      data-el="book-a-demo__card"
      data-state={state}
      className="relative overflow-hidden rounded-32 bg-surface-subtle ring-1 ring-inset ring-border-subtle desktop:rounded-40"
    >
      {state === 'idle' && (
        <div data-el="book-a-demo__card-idle" className="relative flex min-h-80 items-center justify-center p-6 tablet:min-h-105 tablet:p-10">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_0%,transparent_100%)]">
            <InteractiveDots ripple={{ delay: 0.25, duration: 1.4, origin: [0.5, 0.5] }} />
          </div>
          <Reveal variant="fade" className="relative w-full tablet:w-auto">
            <ButtonLink
              href="#book-a-demo-card"
              size="lg"
              variant="dark"
              icon="arrow"
              data-el="book-a-demo__cta"
              className="w-full tablet:w-auto"
              onClick={open}
            >
              {card.button}
            </ButtonLink>
          </Reveal>
        </div>
      )}

      {inProgress && (
        <div data-el="book-a-demo__calendar" className="relative" style={{ height: CALENDAR_HEIGHT }}>
          <div ref={widgetRef} className="size-full" style={{ height: '100%' }} />
          {veil && (
            <output className="absolute inset-0 flex flex-col gap-4 bg-surface-subtle p-6 tablet:p-10">
              <RevealLines as="p" atLoad className="type-body-md text-typography-secondary" lines={[card.loading]} />
              <div aria-hidden="true" className="flex flex-col gap-3">
                <div className="h-10 w-2/3 rounded-16 bg-surface-hover motion-safe:animate-pulse" />
                <div className="h-56 w-full rounded-24 bg-surface-hover motion-safe:animate-pulse" />
                <div className="h-10 w-1/2 rounded-16 bg-surface-hover motion-safe:animate-pulse" />
              </div>
            </output>
          )}
        </div>
      )}

      {state === 'booked' && (
        <div
          ref={bookedRef}
          tabIndex={-1}
          aria-live="polite"
          data-el="book-a-demo__booked"
          className="flex min-h-80 flex-col items-center justify-center gap-6 p-6 text-center focus:outline-none tablet:min-h-105 tablet:p-10"
        >
          <CheckMark reduced={reduced} />
          <div className="flex flex-col items-center gap-3">
            <RevealLines as="h2" atLoad data-el="book-a-demo__booked-title" className="type-heading-lg text-typography-primary" lines={[card.bookedTitle]} />
            <RevealLines as="p" atLoad delay={0.3} data-el="book-a-demo__booked-text" className="type-body-lead max-w-100 text-typography-secondary" lines={[card.bookedText]} />
          </div>
        </div>
      )}

      {state === 'error' && (
        <div data-el="book-a-demo__error" role="alert" className="flex min-h-80 flex-col items-center justify-center gap-6 p-6 text-center tablet:min-h-105 tablet:p-10">
          <RevealLines as="p" atLoad className="type-body-lead text-typography-secondary" lines={[card.errorText]} />
          <ButtonLink href={calendarFallbackUrl} target="_blank" rel="noopener noreferrer" size="lg" variant="secondary" data-el="book-a-demo__fallback">
            {card.errorLink}
          </ButtonLink>
        </div>
      )}
    </div>
  )
}
