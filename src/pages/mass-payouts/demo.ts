/*
 * The demo values of the scenes of the Mass Payouts page (docs/pages/mass-payouts.md, "Формат демо-данных"). They are for the picture only,
 * NOT a list of what the product supports [CONFIRM: the coin, the methods and rails by country, limits, the statuses, the report].
 * Every scene keeps its own state. No file here imports pictures: the tests import this file (see docs/lessons.md).
 */

export const COIN = 'USDT'

export type Lane = 'bank' | 'crypto' | 'card'
export const lanes: readonly Lane[] = ['bank', 'crypto', 'card']

export type Recipient = {
  id: string
  name: string
  /** The name of the country, and its code (the file has the code). */
  country: string
  code: string
  amount: number
  /** The way the demo rule "by country" pays this person, and the rail or network written on the chip. */
  lane: Lane
  rail: string | null
}

/** The example batch of blocks 1 and 2: 10 recipients, 9 countries, 10,000.00 USDT. Made-up people: check them against real ones before launch. */
export const recipients: readonly Recipient[] = [
  { id: 'r1', name: 'Anna Keller', country: 'Germany', code: 'DE', amount: 1200, lane: 'bank', rail: 'SEPA' },
  { id: 'r2', name: 'Lucas Almeida', country: 'Brazil', code: 'BR', amount: 900, lane: 'bank', rail: 'Pix' },
  { id: 'r3', name: 'Priya Nair', country: 'India', code: 'IN', amount: 800, lane: 'bank', rail: 'UPI' },
  { id: 'r4', name: 'Ethan Walker', country: 'United States', code: 'US', amount: 1500, lane: 'bank', rail: 'ACH' },
  { id: 'r5', name: 'Sofia Reyes', country: 'Chile', code: 'CL', amount: 700, lane: 'bank', rail: 'TEF' },
  { id: 'r6', name: 'Giorgi Beridze', country: 'Georgia', code: 'GE', amount: 1500, lane: 'crypto', rail: 'Tron' },
  { id: 'r7', name: 'Mateo Fernandez', country: 'Argentina', code: 'AR', amount: 900, lane: 'crypto', rail: 'Tron' },
  { id: 'r8', name: 'Chloe Martin', country: 'France', code: 'FR', amount: 1100, lane: 'card', rail: null },
  { id: 'r9', name: 'Oliver Smith', country: 'Canada', code: 'CA', amount: 800, lane: 'card', rail: null },
  { id: 'r10', name: 'Jonas Weber', country: 'Germany', code: 'DE', amount: 600, lane: 'bank', rail: 'SEPA' },
]

/** The one recipient whose payment fails once and is retried by itself (block 2), and the one whose row has an error in the file (block 1). */
export const FAILING_ID = 'r3'
export const BROKEN_ID = 'r1'

/** The rail or network written on the chip: the one of the rule, or a plain one when the person was moved to another lane by the visitor. */
export const railLabel = (recipient: Recipient, lane: Lane) => (lane === recipient.lane ? recipient.rail : lane === 'crypto' ? 'Tron' : null)

const cents = (value: number) => Math.round(value * 100) / 100

/** `1,000.00`: thousands separator and two decimals. */
export const formatAmount = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const usdt = (value: number) => `${formatAmount(cents(value))} ${COIN}`
export const integer = (value: number) => value.toLocaleString('en-US')

export const batchTotal = recipients.reduce((sum, item) => sum + item.amount, 0)
export const batchCountries = new Set(recipients.map((item) => item.code)).size

/** The raw file of the CSV example: one row per recipient, no payment details in it. */
export const csvLines = ['name,country,amount', ...recipients.map((item) => `${item.name},${item.code},${item.amount.toFixed(2)}`)]

/* The hero: the same 50.00 USDT to every recipient, from a balance of 1,000,000.00 USDT. */

export const heroCounts = [10, 250, 1000, 10000] as const
export type HeroCount = (typeof heroCounts)[number]
export const PER_RECIPIENT = 50
export const START_BALANCE = 1_000_000
/** The number of countries the demo spreads each size over (at most nine, the cards of `pins.ts`). */
const heroCountries: Record<HeroCount, number> = { 10: 4, 250: 7, 1000: 9, 10000: 9 }

export const heroNumbers = (count: HeroCount) => {
  const total = count * PER_RECIPIENT
  return { total, countries: heroCountries[count], balanceAfter: START_BALANCE - total }
}

/** The next run of "every month on the 1st at 09:00" after `from`, and the two after it. */
export function nextRuns(from: Date) {
  const runs: Date[] = []
  let year = from.getFullYear()
  let month = from.getMonth()
  const first = new Date(year, month, 1, 9, 0)
  if (first.getTime() > from.getTime()) runs.push(first)
  while (runs.length < 3) {
    month++
    if (month > 11) {
      month = 0
      year++
    }
    runs.push(new Date(year, month, 1, 9, 0))
  }
  return runs
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const dayLabel = (date: Date) => `${months[date.getMonth()]} ${date.getDate()}`
export const runLabel = (date: Date) => `${dayLabel(date)}, 09:00`
