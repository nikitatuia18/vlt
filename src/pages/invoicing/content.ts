import type { FaqItemData } from '../../components/blocks/Faq/items'
import type { IndustryItemData } from '../../components/blocks/Industries/items'
import type { ProductContent } from '../ProductPage'
import { href } from '../../lib/route'

/*
 * Texts of the Invoicing page: DRAFT, written with the copywriter (docs/pages/invoicing.md, section "Тексты (версия 2)", where the questions
 * to the product are). [CONFIRM] = a fact we do not have yet: the text is written without it.
 */

const bookDemo = { label: 'Book a demo', href: href('book-a-demo') }

/** Industries: who bills across borders, in the order the cards open (the first and the last are light, the others glow). */
const industries: readonly IndustryItemData[] = [
  {
    id: 'industry-first',
    title: 'Industry-first scenarios',
    description: ['Invoicing shaped around how your industry bills.', 'Pick the scenario closest to yours'],
  },
  {
    id: 'startups',
    glow: 'violet',
    title: 'Startups',
    description: ['Let clients pay in crypto while you receive your own currency.', 'No chargebacks to dispute'],
    flow: { label: 'Typical flow', steps: ['Invoice the client in EUR', 'Client pays in USDT', 'EUR settles to your account'] },
  },
  {
    id: 'export-import',
    glow: 'pink',
    title: 'Export/Import',
    description: ['Get paid across borders without slow correspondent banks.', 'Paid in minutes, not days'],
    flow: { label: 'Typical flow', steps: ['Invoice a foreign buyer in USD', 'Buyer pays in stablecoins', 'USD or EUR lands via local rails'] },
  },
  {
    id: 'real-estate',
    title: 'Real estate',
    description: ['Take deposits from buyers anywhere in the world.', 'Receive the money in the currency you need'],
    flow: { label: 'Typical flow', steps: ['Issue a deposit invoice in GEL', 'Buyer abroad pays in crypto', 'GEL settles via RIPS'] },
  },
]

const faqItems: readonly FaqItemData[] = [
  {
    id: 'account',
    question: 'Does my client need an account with Velant Pay?',
    answer: 'No. The client opens the payment link and pays from the wallet they already use.',
  },
  {
    id: 'rate',
    question: 'What if the crypto price moves before the client pays?',
    answer: 'The invoice is fixed in your currency. The crypto amount is calculated at payment time, so you receive what you billed.',
  },
  {
    id: 'currencies',
    question: 'Which currencies can I invoice and settle in?',
    answer: 'You can invoice in EUR, USD, CAD, GEL and other local currencies, and settle to any currency we cover on local rails.',
  },
  {
    id: 'start',
    question: 'How fast can we start?',
    answer: 'API integration typically takes from one week, with KYB done during onboarding. One-off invoices can go out from the dashboard as soon as your account is approved.',
  },
]

export const invoicing: ProductContent = {
  meta: {
    title: 'Invoicing — Velant Pay',
    // DRAFT [CONFIRM: matching]
    description: "Issue invoices in your client's currency and accept payments in crypto. Every payment is matched to its invoice.",
  },
  hero: {
    product: 'invoicing',
    title: ['Invoice in local currency.', 'Let clients pay in crypto.'],
    // [CONFIRM: what the company receives (currency, where to); where the statuses are seen: a dashboard, the API]
    subtitle: 'Bill your client in their own currency. They pay in crypto, the payment finds its invoice, and you see every status on the way.',
    primaryCta: bookDemo,
    secondaryCta: { label: 'See how it works', href: '#how-it-works' },
  },
  // DRAFT [CONFIRM: the lines about how the products work together]
  worksWith: {
    items: [
      { product: 'crypto-processing', description: 'Accept the crypto behind every invoice.' },
      { product: 'crypto-to-cash', description: 'Turn what you earn into local currency.' },
      { product: 'mass-payouts', description: 'Pay contractors from the same balance.' },
    ],
  },
  industries: { items: industries, activeId: 'startups' },
  faq: { items: faqItems, openId: 'account' },
  cta: { title: 'Ready to get paid in crypto?', subtitle: "We'll show how an invoice goes from created to reconciled." },
}

/** The block of three steps (the scenes are in StepCreate.tsx, StepSend.tsx, StepPay.tsx; their texts in sceneText.ts). */
export const stepsContent = {
  title: 'Issue an invoice, start to finish.',
  intro: 'Build an invoice, send it, and watch the payment find it. Every step is a screen you can click.',
  steps: [
    // [CONFIRM: taxes in the invoice]
    { id: 'create', label: 'Create', title: 'Build it in their currency.', text: "Choose the client's currency, add the lines, set a due date and tax. The total shows in two currencies." },
    // [CONFIRM: link, e-mail, PDF; tracking of "opened"]
    { id: 'send', label: 'Send', title: "Send it. See when it's opened.", text: 'Send a payment link, an email, or a PDF. You see the moment the client opens the invoice.' },
    // [CONFIRM: the events, the matching, how the system is told]
    { id: 'get-paid', label: 'Get paid', title: 'Get paid. Reconciled.', text: 'The client pays in crypto. The payment finds its invoice, the status becomes Reconciled, and your system gets an event.' },
  ],
} as const
