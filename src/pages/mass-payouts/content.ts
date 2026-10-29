import type { FaqItemData } from '../../components/blocks/Faq/items'
import type { IndustryItemData } from '../../components/blocks/Industries/items'
import type { ProductContent } from '../ProductPage'
import { href } from '../../lib/route'

/*
 * Texts of the Mass Payouts page: DRAFT, written with the copywriter (docs/pages/mass-payouts.md, where the questions to the product are).
 * Texts marked "from the design" are the ones of the home page. [CONFIRM] = a fact we do not have yet: the text is written without it.
 */

const bookDemo = { label: 'Book a demo', href: href('book-a-demo') }

/** Industries: who pays many people often, in the order the cards open (the first and the last are light, the others glow). */
const industries: readonly IndustryItemData[] = [
  {
    id: 'industry-first',
    title: 'Industry-first scenarios',
    description: ['Mass payouts built around the people you pay.', 'Find the group that looks like yours'],
  },
  {
    id: 'payroll',
    glow: 'violet',
    title: 'Payroll',
    description: ['Pay teams and contractors worldwide, on schedule.', 'One batch, many currencies'],
  },
  {
    id: 'partners',
    glow: 'pink',
    title: 'Affiliates',
    description: ['Pay commissions to partners in their local currency.', 'Partners paid the same day'],
  },
  {
    id: 'export-import',
    title: 'Trade',
    description: ['Pay suppliers and get paid across borders in one workflow.', 'Skip slow correspondent banks'],
  },
]

const faqItems: readonly FaqItemData[] = [
  {
    id: 'rails',
    question: 'Which countries and rails can I pay out to?',
    answer: 'CAD via Interac e-Transfer / EFT, USD via ACH / Fedwire / FedNow, EUR via SEPA / Instant, GEL via RTGS / RIPS, INR via IMPS / NEFT / UPI, BRL via Pix / TED, CLP via TEF, KGS via XKS, AZN via AZIPS and ARS via CBU / CVU.',
  },
  {
    id: 'funding',
    question: 'How do I fund a batch?',
    answer: 'From your balance in local currency or stablecoins. Where currencies differ, we convert as part of the batch.',
  },
  {
    id: 'wrong-detail',
    question: 'What happens if a recipient detail is wrong?',
    answer: 'Pre-flight validation flags it before you approve, so you can fix it without holding up the rest of the batch.',
  },
  {
    id: 'custom-method',
    question: 'What if I need a currency or rail that isn\'t listed?',
    answer: 'Most likely we can help. Tell us what you\'re building, and we\'ll look at custom payment methods, currencies, settlement flows, and other requirements with our team.',
  },
]

export const massPayouts: ProductContent = {
  meta: {
    title: 'Mass Payouts — Velant Pay',
    // DRAFT [CONFIRM: the balance, CSV and the API]
    description: 'Automate global payouts to teams and partners from one balance. Upload a list or use the API, and each recipient gets paid by bank, crypto, or card.',
  },
  hero: {
    product: 'mass-payouts',
    title: ['One balance,', 'any number of recipients.'],
    // [CONFIRM: the source of the payment: a balance in Velant; "on a card": what Card means]
    subtitle: 'Pay teams and partners from one balance. Each recipient gets their money by bank transfer, in crypto, or on a card.',
    primaryCta: bookDemo,
    secondaryCta: { label: 'See how it works', href: '#how-it-works' },
  },
  // DRAFT [CONFIRM: the lines about how the products work together]
  worksWith: {
    items: [
      { product: 'crypto-to-cash', description: 'Top up in fiat, pay out in crypto.' },
      { product: 'crypto-processing', description: 'Pay out straight from incoming crypto.' },
      { product: 'invoicing', description: 'Pay suppliers against their invoices.' },
    ],
  },
  industries: { items: industries, activeId: 'payroll' },
  faq: { items: faqItems, openId: 'rails' },
  cta: { title: 'Ready to send your first batch?', subtitle: "We'll build a sample batch with your countries and payout methods." },
}

/** Block 1: "Bring your list. We check it." (the scene is in BatchScene.tsx, its texts in sceneText.ts). */
export const batchContent = {
  title: 'Bring your list. We check it.',
  // [CONFIRM: the three ways to add a list]
  intro: 'Upload a CSV file, send the list through the API, or run it on a schedule. Pick a source and see the batch appear.',
} as const

/** Block 2: "Everyone is paid their way." (the scene is in RoutingScene.tsx, its texts in sceneText.ts). */
export const routingContent = {
  title: 'Everyone is paid their way.',
  // [CONFIRM: sorting by country]
  intro: 'Recipients are sorted by country into bank, crypto and card payouts. Drag anyone to another lane, then pay.',
} as const
