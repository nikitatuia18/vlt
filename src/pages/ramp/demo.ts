/*
 * The demo values of the scenes of the Crypto on- and off-ramp page. They are for the picture only, NOT a list of what the product supports
 * and not its rates [CONFIRM: the fee (is 0.5% a fee or a margin of the rate), coins, networks, rails, the life of the quote].
 * Every scene keeps its own state: the hero, the routes and the quote do not follow one another. No file here imports pictures (flags, svg): the tests import this file (see docs/lessons.md); the flags are joined in by id from `Global/pins.ts`.
 */

export type Direction = 'on' | 'off'

export const networks = ['Ethereum', 'Tron', 'Polygon'] as const
export type Network = (typeof networks)[number]

export const COIN = 'USDT'
export const FEE_RATE = 0.005
/** Seconds the quote is held after "Lock the rate". */
export const QUOTE_SECONDS = 30

/**
 * The currencies of the rails of the Global block (`pins.ts`, the same ids). `rate` is the demo price of 1 USDT in the currency;
 * `amount` is what the scenes send by default (about 1,000 USDT worth, so that the numbers look alike everywhere).
 * EUR, GBP, BRL and INR rates are the ones of the Invoicing page; the others are made up [CONFIRM].
 */
export type CurrencyId = 'eu' | 'us' | 'ca' | 'br' | 'in' | 'ge' | 'cl' | 'kg' | 'ar'
export type Currency = { id: CurrencyId; code: string; rate: number; amount: number }

export const currencies: readonly Currency[] = [
  { id: 'eu', code: 'EUR', rate: 0.92, amount: 1000 },
  { id: 'us', code: 'USD', rate: 1, amount: 1000 },
  { id: 'ca', code: 'CAD', rate: 1.37, amount: 1500 },
  { id: 'br', code: 'BRL', rate: 5.5, amount: 5500 },
  { id: 'in', code: 'INR', rate: 83, amount: 90000 },
  { id: 'ge', code: 'GEL', rate: 2.7, amount: 3000 },
  { id: 'cl', code: 'CLP', rate: 940, amount: 950000 },
  { id: 'kg', code: 'KGS', rate: 87, amount: 90000 },
  { id: 'ar', code: 'ARS', rate: 1000, amount: 1000000 },
]

export const currencyOf = (id: CurrencyId): Currency => currencies.find((item) => item.id === id) ?? currencies[0]

/** The scene of the hero is a fixed example in euros: it does not follow the choice of the blocks. */
export const EXAMPLE = currencies[0]

const cents = (value: number) => Math.round(value * 100) / 100

/** `1,000.00`: thousands separator and two decimals. */
export const formatAmount = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Fiat is written with its code first (`EUR 1,000.00`), crypto with the code after (`1,081.52 USDT`). */
export const fiat = (code: string, value: number) => `${code} ${formatAmount(value)}`
export const crypto = (value: number) => `${formatAmount(value)} ${COIN}`

/** The price of 1 USDT: two decimals while it is a fixed demo value, four while it moves. */
export const formatRate = (rate: number, live = false) => (live && rate < 10 ? rate.toFixed(4) : rate < 10 ? rate.toFixed(2) : formatAmount(rate))

/** The fee comes off the sum that is sent (rounded to the cent first); the rest is converted at the rate. */
export function quote(direction: Direction, send: number, rate: number) {
  const fee = cents(send * FEE_RATE)
  const net = cents(send - fee)
  const get = cents(direction === 'on' ? net / rate : net * rate)
  return { send, fee, net, get }
}

/** The sum that is sent and the sum that is received, each written in the currency of its side (on-ramp: fiat → crypto, off-ramp: crypto → fiat). */
export const sendText = (direction: Direction, code: string, value: number) => (direction === 'on' ? fiat(code, value) : crypto(value))
export const getText = (direction: Direction, code: string, value: number) => (direction === 'on' ? crypto(value) : fiat(code, value))

/** The first rail of the string of `pins.ts` (`SEPA / INSTANT` → `SEPA`): the one the scenes name. */
export const mainRail = (rails: string) => rails.split('/')[0].trim()
