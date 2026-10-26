import type { FaqItemData } from '../../components/blocks/Faq/items'
import type { IndustryItemData } from '../../components/blocks/Industries/items'
import type { ProductContent } from '../ProductPage'

/*
 * Texts of the Mass Payouts page: DRAFT, written with the copywriter (docs/pages/mass-payouts.md, where the questions to the product are).
 * Texts marked "from the design" are the ones of the home page. [CONFIRM] = a fact we do not have yet: the text is written without it.
 */

const bookDemo = { label: 'Book a demo', href: '#book-a-demo' }

/** Industries: who pays many people often, in the order the cards open (the first and the last are light, the others glow). */
const industries: readonly IndustryItemData[] = [
  {
    id: 'industry-first',
    title: 'Industry-first scenarios',
    description: ['Mass payouts built around the people you pay.', 'Find the group that looks like yours'],
    cta: bookDemo,
  },
  {
    id: 'payroll',
    glow: 'violet',
    title: 'Payroll and contractors',
    // [CONFIRM: the word "payroll" and what it means legally (we are not an employer or an EOR?); the home page already has "Operations and payroll"]
    description: ['Pay your team and contractors in many countries.', 'Run the same list every month'],
    cta: bookDemo,
  },
  {
    id: 'marketplaces',
    glow: 'pink',
    title: 'Marketplaces and platforms',
    // [CONFIRM: a report for reconciliation; the border with the ramp ("Pay users out to their local banks")]
    description: ['Pay out every seller in one run.', 'One report to reconcile every payout'],
    cta: bookDemo,
  },
  {
    id: 'partners',
    glow: 'orange',
    title: 'Partner and referral programs',
    description: ['Pay affiliates and partners every month.', 'Send commissions by bank, crypto, or card'],
    cta: bookDemo,
  },
  {
    id: 'gig',
    glow: 'blue',
    title: 'Gig platforms and creators',
    // [CONFIRM: the API]
    description: ['Pay many workers and creators at once.', 'Add them from one file or one API call'],
    cta: bookDemo,
  },
  {
    id: 'refunds',
    glow: 'green',
    title: 'Refunds and rebates',
    // [CONFIRM: refunds to cards and accounts of customers]
    description: ['Return money to many customers in one batch.', 'Keep a record of each payout'],
    cta: bookDemo,
  },
  {
    id: 'agencies',
    title: 'Agencies and studios',
    description: ['Pay freelancers when a project closes.', 'Send one list, not one transfer per person'],
    cta: bookDemo,
  },
]

const faqItems: readonly FaqItemData[] = [
  {
    id: 'methods',
    question: 'How do recipients get paid, and in which countries?',
    // [CONFIRM: the list of countries and the methods by country; whether "15+ direct local rails" belongs to the payouts]
    lead: 'By bank transfer, in crypto, or on a card.',
    answer: 'Bank payouts use direct local rails. Tell us your countries and we will confirm the methods for each.',
  },
  {
    id: 'details',
    question: 'How do recipients give their payment details?',
    // [CONFIRM: how the details are collected (a column in the file, a form of the recipient, a profile) and which checks run]
    lead: 'Details are checked before you pay.',
    answer: 'We will confirm during the demo how recipients share their details and which checks run.',
  },
  {
    id: 'batch-size',
    question: 'How many recipients can I pay in one batch?',
    // [CONFIRM: the limit of recipients and of the sum in a batch; for CSV and for the API]
    lead: 'Tell us your volume.',
    answer: 'We will confirm batch size limits for your setup during the demo.',
  },
  {
    id: 'timing',
    question: 'How fast do recipients get paid?',
    // [CONFIRM: times by method and country; the word "instant" is not used]
    lead: 'It depends on the method and the country.',
    answer: 'We will confirm typical times for each method and country during the demo.',
  },
  {
    id: 'report',
    question: 'Can I get a report for my accountants?',
    // [CONFIRM: the report exists; its format and fields]
    lead: 'Every batch has a report you can download.',
    answer: 'We will confirm the report format and fields for your reconciliation during the demo.',
  },
  {
    id: 'cost',
    question: 'How much does it cost?',
    // [CONFIRM: the fee model; no number without the product]
    lead: 'It depends on your flow.',
    answer: 'Book a demo and we will walk you through the fees.',
  },
  {
    id: 'start',
    question: 'How do I connect, and how long does it take?',
    // [CONFIRM: does "from 1 week" hold for the payouts; CSV and the API] (lead and the second sentence are from the home page and Crypto Processing)
    lead: 'From 1 week.',
    answer: 'Use a CSV file or the API. Book a demo, pass KYB, and send your first live transaction.',
  },
  {
    id: 'licence',
    question: 'What licence do you have?',
    answer: 'Velant Pay operates under a Canadian MSB licence and works with licensed third-party financial providers.',
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
  industries: { items: industries, activeId: 'payroll' },
  faq: { items: faqItems, openId: 'methods' },
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
