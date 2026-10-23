import { useSyncExternalStore } from 'react'

/*
 * The demo values of the scenes of the Crypto Processing page. They are for the picture only, NOT a list of what the product supports
 * and not its rates [CONFIRM: coins, networks, the settlement currency]. One demo rate everywhere, so that the sums of the scenes add up.
 */

export const coins = ['USDT', 'USDC', 'DAI'] as const
export const networks = ['Ethereum', 'Tron', 'Polygon'] as const
export const amounts = [120, 250, 480, 1000] as const

export type Coin = (typeof coins)[number]
export type Network = (typeof networks)[number]

/** 1 coin = RATE units of the settlement currency (the coins above are all dollar-like). */
export const RATE = 0.92
export const SETTLEMENT_CURRENCY = 'EUR'

/** `1,000.00`: thousands separator and two decimals, no currency symbols. */
export const formatAmount = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const settledAmount = (amount: number) => Math.round(amount * RATE * 100) / 100

/* The choice of the visitor: made in block 1 (the Accept step), shown again in the request of block 2. */

type Selection = { coin: Coin; network: Network; amount: number }

let selection: Selection = { coin: 'USDT', network: 'Ethereum', amount: 1000 }
const listeners = new Set<() => void>()

export const setSelection = (change: Partial<Selection>) => {
  selection = { ...selection, ...change }
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useSelection = () => useSyncExternalStore(subscribe, () => selection, () => selection)
