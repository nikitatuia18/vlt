/*
 * Short texts inside the scenes of the Invoicing page (micro interfaces). DRAFT, from the copywriter (docs/pages/invoicing.md, section
 * "Тексты (версия 2)"). The clients, sums, currencies and links are pictures (demo.ts, cabinetData.ts), not facts about the product [CONFIRM].
 * The page does not say "demo" anywhere (only the button "Book a demo" and the answers of the FAQ do).
 */

import type { Stage } from './demo'

export const stageText: Record<Stage, string> = {
  created: 'Created',
  sent: 'Sent',
  viewed: 'Viewed',
  paid: 'Paid',
  reconciled: 'Reconciled',
}

/** The hero: the cabinet. */
export const heroScene = {
  listTitle: 'Invoices',
  hint: 'Pick an invoice to see it in two currencies.',
  hintTouch: 'Tap an invoice to see it in two currencies.',
  newInvoice: 'New invoice',
  received: 'Received',
  columns: { client: 'Client', due: 'Due', amount: 'Amount', status: 'Status' },
  overdue: 'Overdue',
  detail: { link: 'Payment link', copy: 'Copy link', copied: 'Copied', rate: 'Rate', clientPays: 'Client pays' },
  /** One sentence under the lane: what has just happened to the invoice. */
  said: {
    created: 'Invoice created. Ready to send.',
    sent: 'Sent to the client by e-mail and link.',
    viewed: 'The client opened the invoice.',
    paid: 'Paid in crypto. Finding the invoice…',
    reconciled: 'Matched to the invoice. Your system got the event.',
  },
} as const

/** Step 1: building the invoice. */
export const createScene = {
  title: 'New invoice',
  currency: 'Currency',
  items: 'Items',
  due: 'Due in',
  days: 'days',
  tax: 'Tax 20%',
  sheetTitle: 'Invoice',
  to: 'To',
  total: 'Total',
  taxLine: 'Tax 20%',
  dueLine: 'Due in',
  clientPays: 'Client pays',
  rate: 'Rate',
  empty: 'Pick at least one item',
  hint: 'Change the currency or the items and watch both totals update.',
  create: 'Create invoice',
  created: 'Invoice created',
  link: 'Payment link',
  copy: 'Copy link',
  copied: 'Copied',
} as const

/** Step 2: sending it. */
export const sendScene = {
  title: 'Send invoice',
  sendAs: 'Send as',
  link: 'Payment link',
  email: 'Email',
  pdf: 'PDF',
  to: 'To',
  send: 'Send invoice',
  sending: 'Sending…',
  sentLabel: 'Sent',
  openAsClient: 'Open as client',
  notOpened: 'Not opened yet',
  pageTitle: 'What your client sees',
  pageInvoice: 'Invoice',
  amountDue: 'Amount due',
  payWith: 'Pay with',
  pay: 'Pay',
  opened: 'opened',
  hint: 'Send the invoice, then open it as the client.',
  timeline: [
    { id: 'sent', title: 'Sent', note: 'Invoice sent to the client', time: '10:02' },
    { id: 'delivered', title: 'Delivered', note: 'In the inbox', time: '10:02' },
    { id: 'viewed', title: 'Viewed', note: 'Client opened the invoice', time: '10:14' },
  ],
} as const

/** Step 3: getting paid. */
export const payScene = {
  walletTitle: 'Client pays',
  walletCaption: 'From their wallet',
  coin: 'Coin',
  pay: 'Pay',
  paying: 'Paying…',
  paymentSent: 'Payment sent',
  ledgerTitle: 'Your invoices',
  ledgerCaption: 'Where the money lands',
  incoming: 'Incoming',
  matched: 'Matched to',
  noManual: 'No manual reconciliation.',
  empty: 'No events yet',
  hint: 'Pay as the client and watch the invoice close.',
  replay: 'Replay',
  /** The other invoices of the list (the one of the visitor stands between them). */
  others: [
    { no: 'INV-1041', client: 'Bluepeak Studio', amount: 'GBP 2,000.00', status: 'reconciled' },
    { no: 'INV-1043', client: 'Atlas Trading', amount: 'INR 200,000.00', status: 'sent' },
  ],
} as const
