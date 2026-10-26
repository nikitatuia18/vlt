import { toCoin, type Currency } from './demo'

/*
 * The invoices in the cabinet of the hero scene: a picture, not clients of the product. The clients are made up; they are agencies,
 * SaaS companies and wholesalers on purpose (the scenarios of the Industries block). [CONFIRM: nothing here is a fact about the product]
 */

export type CabinetRow = {
  key: number
  no: string
  client: string
  currency: Currency
  amount: number
  due: string
  /** 0 Created … 4 Reconciled; `overdue` is a sent invoice nobody has paid in time. */
  stage: number | 'overdue'
}

/** The invoices that join the list one after another while the scene plays (the numbers go on from the list). */
const pool: readonly Omit<CabinetRow, 'key' | 'no' | 'stage'>[] = [
  { client: 'Bluepeak Studio', currency: 'GBP', amount: 2000, due: 'in 14 days' },
  { client: 'Harbor Labs', currency: 'BRL', amount: 12500, due: 'in 7 days' },
  { client: 'Atlas Trading', currency: 'INR', amount: 200000, due: 'in 30 days' },
  { client: 'Meridian Consulting', currency: 'EUR', amount: 4800, due: 'in 14 days' },
  { client: 'Cedarline Freight', currency: 'AED', amount: 9500, due: 'in 7 days' },
  { client: 'Northwind Media', currency: 'EUR', amount: 2400, due: 'in 14 days' },
]

export const seedRows: readonly CabinetRow[] = [
  { key: 5, no: 'INV-1042', client: 'Northwind Media', currency: 'EUR', amount: 2400, due: 'in 14 days', stage: 1 },
  { key: 4, no: 'INV-1041', client: 'Bluepeak Studio', currency: 'GBP', amount: 2000, due: 'in 7 days', stage: 2 },
  { key: 3, no: 'INV-1040', client: 'Harbor Labs', currency: 'BRL', amount: 12500, due: 'paid', stage: 4 },
  { key: 2, no: 'INV-1039', client: 'Atlas Trading', currency: 'INR', amount: 200000, due: 'paid', stage: 4 },
  { key: 1, no: 'INV-1038', client: 'Meridian Consulting', currency: 'EUR', amount: 4800, due: 'paid', stage: 4 },
  { key: 0, no: 'INV-1037', client: 'Cedarline Freight', currency: 'AED', amount: 9500, due: '3 days ago', stage: 'overdue' },
]

/** The next invoice of the loop: its number follows the newest one. */
export function nextRow(rows: readonly CabinetRow[], turn: number): CabinetRow {
  const newest = rows.reduce((max, row) => Math.max(max, row.key), 0)
  const number = rows.reduce((max, row) => Math.max(max, Number(row.no.slice(4))), 0) + 1
  // The next client of the pool that is not among the newest invoices, so that the list does not show one client twice in a row.
  const recent = new Set(rows.slice(0, 3).map((row) => row.client))
  const start = turn % pool.length
  const template = pool.map((_, offset) => pool[(start + offset) % pool.length]).find((item) => !recent.has(item.client)) ?? pool[start]
  return { ...template, key: newest + 1, no: `INV-${number}`, stage: 0 }
}

/** What was received at the start (USDT): grows by the sum of every invoice that gets paid. */
export const RECEIVED_START = 18420

export const receivedBy = (row: CabinetRow) => toCoin(row.amount, row.currency)

/** The minute each stage of an invoice happened at (the picture has a clock). */
export const stageClock = ['10:20', '10:21', '10:26', '10:29', '10:29'] as const
