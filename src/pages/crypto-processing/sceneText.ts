/*
 * Short texts inside the scenes of the Crypto Processing page (micro interfaces). DRAFT, from the copywriter (docs/pages/crypto-processing.md,
 * version 2). The coins, networks and sums are DEMO values (demo.ts): not a list of what the product supports [CONFIRM].
 */

export const heroScene = {
  hint: 'Click the map to send a payment',
  hintTouch: 'Tap the map to send a payment',
  hintAgain: 'Try another place',
  button: 'Send a payment',
  demo: 'Demo',
  account: 'Your account',
  panelTitle: 'Latest payment',
  status: {
    waiting: 'Waiting for payment',
    confirmed: 'Payment confirmed',
    settled: 'Settled',
  },
} as const

export type PaymentStatus = keyof typeof heroScene.status

/** Block 1: the three stations and their panels. */
export const journeyScene = {
  demo: 'Demo values',
  play: 'Play',
  pause: 'Pause',
  hint: 'Try another coin or network.',
  stations: [
    { id: 'accept', title: 'Accept', caption: 'Client pays' },
    { id: 'convert', title: 'Convert', caption: 'Rate applied' },
    { id: 'settle', title: 'Settle', caption: 'Funds credited' },
  ],
  panels: {
    accept: { title: 'Client payment', coin: 'Coin', network: 'Network', amount: 'Amount' },
    convert: { title: 'Conversion', sends: 'Client sends', receives: 'You receive', rate: 'Rate' },
    settle: { title: 'Settlement', credited: 'Credited to', account: 'Your account', amount: 'Amount', status: 'Status' },
  },
} as const

/** Block 2: the columns, the events and the log of the system. */
export const testScene = {
  demo: 'Demo values',
  send: 'Send test payment',
  sending: 'Sending…',
  replay: 'Replay',
  empty: 'No events yet',
  requestHint: 'Uses the coin and network you picked above.',
  columns: {
    request: { title: 'Request', caption: 'What you send' },
    events: { title: 'Events', caption: 'What Velant sends back' },
    system: { title: 'Your system', caption: 'What your system does' },
  },
  // [CONFIRM: the names of the events]
  events: [
    { id: 'created', name: 'payment.created', note: 'Payment created', log: 'Order #1042: waiting for payment' },
    { id: 'confirmed', name: 'payment.confirmed', note: 'Confirmed on the network', log: 'Order #1042: payment confirmed' },
    { id: 'settled', name: 'payment.settled', note: 'Funds sent to your account', log: 'Order #1042 marked as paid' },
  ],
} as const
