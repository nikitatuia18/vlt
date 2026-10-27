/**
 * The link of the Calendly event the page books. PLACEHOLDER until the real one is given: set `VITE_CALENDLY_URL`
 * (`.env.local` locally, a variable of the build for the publication), see docs/pages/book-a-demo.md.
 */
export const CALENDLY_URL: string = import.meta.env.VITE_CALENDLY_URL ?? 'https://calendly.com/velant-pay/demo'

const WIDGET_SCRIPT = 'https://assets.calendly.com/assets/external/widget.js'
const WIDGET_STYLE = 'https://assets.calendly.com/assets/external/widget.css'
/** The only address the messages of the calendar are accepted from. */
const CALENDLY_ORIGIN = 'https://calendly.com'

type CalendlyGlobal = { initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void }
declare global {
  interface Window {
    Calendly?: CalendlyGlobal
  }
}

let loading: Promise<CalendlyGlobal> | null = null

/** Loads the widget of Calendly once, on the first call (the page does not weigh anything until the visitor asks for the calendar). */
export function loadCalendly(): Promise<CalendlyGlobal> {
  if (window.Calendly) return Promise.resolve(window.Calendly)
  loading ??= new Promise<CalendlyGlobal>((resolve, reject) => {
    const style = document.createElement('link')
    style.rel = 'stylesheet'
    style.href = WIDGET_STYLE
    document.head.append(style)

    const script = document.createElement('script')
    script.src = WIDGET_SCRIPT
    script.async = true
    script.onload = () => (window.Calendly ? resolve(window.Calendly) : reject(new Error('Calendly widget did not start')))
    script.onerror = () => reject(new Error('Calendly widget did not load'))
    document.head.append(script)
  }).catch((error: unknown) => {
    // A failed load may be tried again by the next click.
    loading = null
    throw error
  })
  return loading
}

/** A color of the design system as `rrggbb`: Calendly takes only hex colors, the tokens are CSS variables of any syntax (color-mix too). */
function tokenHex(token: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(--color-${token})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return '000000'
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return [r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')
}

/** The address of the event with the colors of the card and of the theme that is on now (Light / Dark). */
export function calendarUrl(): string {
  const url = new URL(CALENDLY_URL)
  url.searchParams.set('hide_gdpr_banner', '1')
  url.searchParams.set('background_color', tokenHex('surface-subtle'))
  url.searchParams.set('text_color', tokenHex('typography-primary'))
  url.searchParams.set('primary_color', tokenHex('surface-brand-default'))
  return url.toString()
}

/** What the calendar tells the page: it is shown / the visitor has booked a time. Other senders and other messages are ignored. */
export function calendlyEvent(message: MessageEvent): 'viewed' | 'scheduled' | null {
  if (message.origin !== CALENDLY_ORIGIN) return null
  const name: unknown = (message.data as { event?: unknown } | null)?.event
  if (name === 'calendly.event_scheduled') return 'scheduled'
  if (typeof name === 'string' && name.startsWith('calendly.')) return 'viewed'
  return null
}

/** The address of the calendar itself, for the way out when the widget cannot load. */
export const calendarFallbackUrl = CALENDLY_URL
