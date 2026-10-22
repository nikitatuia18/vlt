/**
 * The two "requests" the code window types (block `global`). DRAFT text: the endpoints and fields are made up for the picture,
 * the currencies and rails are those of the countries on the globe (pins.ts); to be agreed with the product.
 */

export type Tone = 'method' | 'key' | 'value' | 'punct' | 'status'

export type Token = { text: string; tone: Tone }

export type CodeScript = {
  id: string
  /** The tab. */
  label: string
  /** The code as pieces with a colour each; "\n" ends a line. */
  tokens: readonly Token[]
}

const method = (text: string): Token => ({ text, tone: 'method' })
const key = (text: string): Token => ({ text, tone: 'key' })
const value = (text: string): Token => ({ text, tone: 'value' })
const punct = (text: string): Token => ({ text, tone: 'punct' })
const status = (text: string): Token => ({ text, tone: 'status' })

/** `"currency": "INR"` with the quotes, the colon and what follows it. */
const field = (name: string, text: string, after = ''): Token[] => [
  key(`"${name}"`),
  punct(': '),
  value(`"${text}"`),
  punct(after),
]

/** `{ "to": "INR", "via": "UPI" },` one line of the batch (short names: the line must fit a phone). */
const item = (currency: string, rail: string, last = false): Token[] => [
  punct('    { '),
  ...field('to', currency, ', '),
  ...field('via', rail, ' }'),
  punct(last ? '\n' : ',\n'),
]

export const codeScripts: readonly CodeScript[] = [
  {
    id: 'accept-payment',
    label: 'Accept payment',
    tokens: [
      method('POST'),
      key(' /v1/payments\n'),
      punct('{\n  '),
      key('"amount"'),
      punct(': '),
      value('1200'),
      punct(',\n  '),
      ...field('currency', 'EUR', ',\n  '),
      ...field('method', 'SEPA', ',\n  '),
      ...field('settle_in', 'USDT', '\n'),
      punct('}\n\n'),
      status('< 201'),
      key('  status: '),
      value('"pending"'),
    ],
  },
  {
    id: 'batch-payout',
    label: 'Batch payout',
    tokens: [
      method('POST'),
      key(' /v1/payouts/batch\n'),
      punct('{\n  '),
      key('"items"'),
      punct(': [\n'),
      ...item('INR', 'UPI'),
      ...item('BRL', 'PIX'),
      ...item('CAD', 'INTERAC', true),
      punct('  ]\n}\n\n'),
      status('< 202'),
      key('  status: '),
      value('"processing"'),
    ],
  },
]
