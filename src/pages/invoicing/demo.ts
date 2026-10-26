import { useSyncExternalStore } from 'react'

/*
 * The demo values of the scenes of the Invoicing page. They are for the picture only: NOT a list of the currencies the product supports
 * and not its rates [CONFIRM: invoice currencies, coins, the settlement currency]. One table of rates, so that the sums of all scenes add up.
 */

export const currencies = ['EUR', 'GBP', 'BRL', 'INR', 'AED'] as const
export type Currency = (typeof currencies)[number]

/** The coin the client pays in (all scenes), and the other one the payer page offers. */
export const COIN = 'USDT'
export const coins = ['USDT', 'USDC'] as const
export type Coin = (typeof coins)[number]

/** Units of the currency for one coin. */
export const RATES: Record<Currency, number> = { EUR: 0.92, GBP: 0.79, BRL: 5.5, INR: 83, AED: 3.67 }

/** The sums are written without a currency symbol: `EUR 2,400.00`, `2,608.70 USDT`. */
export const formatMoney = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const money = (value: number, currency: Currency) => `${currency} ${formatMoney(value)}`
export const coinMoney = (value: number, coin: string = COIN) => `${formatMoney(value)} ${coin}`

/** What a sum of a currency is in the coin, by the rate. */
export const toCoin = (value: number, currency: Currency) => Math.round((value / RATES[currency]) * 100) / 100

/* The invoice the visitor builds in step 1; step 2 sends it and step 3 pays it. */

/** The lines are priced in EUR and recounted by the rates, so the same work costs the same in the coin whatever the currency of the invoice. */
export const lineItems = [
  { id: 'media', title: 'Media planning', eur: 1200 },
  { id: 'creative', title: 'Creative production', eur: 600 },
  { id: 'reporting', title: 'Reporting dashboard', eur: 200 },
] as const

export type ItemId = (typeof lineItems)[number]['id']
export const dueOptions = [7, 14, 30] as const
export const TAX_RATE = 0.2

export type Draft = { currency: Currency; items: readonly ItemId[]; due: (typeof dueOptions)[number]; tax: boolean }

let draft: Draft = { currency: 'EUR', items: ['media', 'creative', 'reporting'], due: 14, tax: true }
const listeners = new Set<() => void>()

export const setDraft = (change: Partial<Draft>) => {
  draft = { ...draft, ...change }
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useDraft = () => useSyncExternalStore(subscribe, () => draft, () => draft)

export const INVOICE_NO = 'INV-1042'
export const CLIENT = 'Northwind Media'

/** What a sum in EUR is in a currency, by the rates (two decimals). */
const fromEur = (eur: number, currency: Currency) => Math.round(((eur / RATES.EUR) * RATES[currency]) * 100) / 100

/** The sums of a draft: the lines, the tax, the total in the currency of the invoice and in the coin. */
export function totals({ currency, items, tax }: Draft) {
  const chosen = lineItems.filter((item) => items.includes(item.id))
  const lines = chosen.map((item) => ({ ...item, amount: fromEur(item.eur, currency) }))
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0)
  const taxAmount = tax ? Math.round(subtotal * TAX_RATE * 100) / 100 : 0
  const total = Math.round((subtotal + taxAmount) * 100) / 100
  // The coin is counted from the work itself (EUR), so that it does not change with the currency (and with its roundings).
  const eurTotal = chosen.reduce((sum, item) => sum + item.eur, 0) * (tax ? 1 + TAX_RATE : 1)
  return { lines, subtotal, taxAmount, total, coin: Math.round((eurTotal / RATES.EUR) * 100) / 100 }
}

/** The link of the payment page of the invoice (a picture value [CONFIRM: the domain of the payment pages]). */
export const payLink = (no: string) => `pay.velantpay.com/${no.toLowerCase()}`

/* The statuses of an invoice, in the order it goes through them. */

export const STAGES = ['created', 'sent', 'viewed', 'paid', 'reconciled'] as const
export type Stage = (typeof STAGES)[number]
