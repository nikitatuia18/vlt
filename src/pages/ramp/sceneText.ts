/*
 * Short texts inside the scenes of the Crypto to Cash page (micro interfaces). DRAFT, from the copywriter (docs/pages/ramp.md, "версия 2").
 * The sums, the rate, the network, the rails and the addresses are DEMO values (demo.ts): not a list of what the product supports [CONFIRM].
 * The page does not say "demo" anywhere, so the scenes only have to look believable.
 */

import type { Direction } from './demo'

export const directionText: Record<Direction, { label: string; caption: string }> = {
  on: { label: 'Bank → Wallet', caption: 'On-ramp: fiat to crypto' },
  off: { label: 'Wallet → Bank', caption: 'Off-ramp: crypto to fiat' },
}

/** The receipt: the same four lines in the hero and in the quote. */
export const receiptLabels = { send: 'You send', fee: 'Our fee (0.5%)', rate: 'Rate', get: 'You get' } as const

export const heroScene = {
  bank: 'Your bank',
  bankCaption: 'EUR account',
  wallet: 'Your wallet',
  walletCaption: 'USDT',
  door: 'Velant Pay',
  doorFee: '0.5% fee',
  feeCaption: (amount: string) => (amount ? `Our fee · ${amount}` : 'Our fee 0.5%'),
  convert: 'Convert',
  directionLabel: 'Direction',
  hint: 'Pick a direction, change the amount, press Convert.',
  hintTouch: 'Pick a direction, change the amount, tap Convert.',
  empty: 'Enter an amount',
  emptyLong: 'Enter an amount to see the fee',
  dash: '–',
} as const

export const routesScene = {
  bankTitle: 'Your bank',
  walletTitle: 'Your wallet',
  door: 'Velant Pay',
  moreRails: '15+ direct local rails',
  coin: 'USDT',
  hint: 'Tap a bank and a network to connect them.',
  hintDrag: 'Drag a plug to another bank or network, or click one.',
  summary: {
    on: (code: string, rail: string, network: string) => `${code} via ${rail} → USDT on ${network}`,
    off: (code: string, rail: string, network: string) => `USDT on ${network} → ${code} via ${rail}`,
  },
  payFrom: {
    on: (code: string, rail: string) => `You pay from your ${code} account, by ${rail}.`,
    off: (_code: string, _rail: string, network: string) => `You send USDT on ${network} from your wallet.`,
  },
  receive: {
    on: (_code: string, _rail: string, network: string) => `You receive USDT on ${network} in your wallet.`,
    off: (code: string, rail: string) => `You receive ${code} in your bank account, by ${rail}.`,
  },
} as const

export const quoteScene = {
  route: 'Route',
  chartCaption: (code: string) => `Price of 1 USDT in ${code}`,
  live: 'Live rate',
  locked: 'Rate locked',
  lock: 'Lock the rate',
  lockedFor: (time: string) => `Rate locked for ${time}`,
  confirm: 'Confirm',
  cancel: 'Cancel',
  expired: 'Quote expired. Rate updated.',
  hint: 'Lock the rate to hold this price for 30 seconds.',
  hintLocked: 'The rate is held. Confirm before the timer ends.',
  hintDone: 'Press New quote to get another one.',
  newQuote: 'New quote',
  done: {
    on: { title: 'USDT is in your wallet.', text: (sent: string, got: string) => `${sent} became ${got} in your wallet.` },
    off: { title: 'Money is in your bank account.', text: (sent: string, got: string) => `${sent} became ${got} in your bank account.` },
  },
} as const
