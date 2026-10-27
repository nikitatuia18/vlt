import type { FaqItemData } from '../../components/blocks/Faq/items'
import type { IndustryItemData } from '../../components/blocks/Industries/items'
import type { ProductContent } from '../ProductPage'

/*
 * Texts of the Crypto Processing page: DRAFT, written with the copywriter (docs/pages/crypto-processing.md, where the questions
 * to the product are). Texts marked "from the design" are the ones of the home page. [CONFIRM] = a fact we do not have yet:
 * the text is written without it.
 */

const bookDemo = { label: 'Book a demo', href: '#book-a-demo' }

/** Industries: scenes of accepting crypto, in the order they open (the first and the last are light, the others glow). */
const industries: readonly IndustryItemData[] = [
  {
    id: 'industry-first',
    title: 'Industry-first scenarios',
    description: ['Crypto acceptance shaped around your industry.', 'Pick a scenario and see it in a demo'],
  },
  {
    id: 'ecommerce',
    glow: 'violet',
    title: 'E-commerce',
    description: ['Let shoppers pay in crypto at your checkout.', 'Shoppers pay from their wallet, you receive fiat'],
  },
  {
    id: 'marketplaces',
    glow: 'pink',
    title: 'Marketplaces',
    description: ['Let buyers pay in crypto on your platform.', 'See every payment status through the API'],
  },
  {
    id: 'luxury-automotive',
    glow: 'orange',
    title: 'Luxury',
    // [CONFIRM: limits on the size of a payment]
    description: ['Take high-value payments in crypto from buyers abroad.', 'Receive the settlement in your account'],
  },
  {
    id: 'real-estate',
    glow: 'blue',
    title: 'Real estate',
    // [CONFIRM: settlement currencies]
    description: ['Accept deposits and final payments in crypto.', 'Settle to your account in the currency you use'],
  },
  {
    id: 'export-import',
    glow: 'green',
    title: 'Trade',
    // To check with the product: the comparison with banks.
    description: ['Get paid by buyers abroad in crypto.', 'Skip the chain of correspondent banks'],
  },
  {
    id: 'psps-acquirers',
    title: 'PSPs',
    description: ['Offer crypto as a payment method to your merchants.', 'One integration instead of a separate crypto stack'],
  },
]

const faqItems: readonly FaqItemData[] = [
  {
    id: 'receive',
    question: 'What do I receive, and in what currency?',
    // [CONFIRM: the list of currencies, settlement in crypto]
    lead: 'Your clients pay in crypto, and you receive fiat.',
    answer: 'Tell us the currencies you need, and we will set up settlement for them.',
  },
  {
    id: 'coins',
    question: 'Which coins and networks do you support?',
    // [CONFIRM: the list of coins and networks]
    lead: 'Tell us what your clients use.',
    answer: 'We will confirm the coins and networks available for your flow during the demo.',
  },
  {
    id: 'status',
    question: 'How do I know a payment is confirmed?',
    // [CONFIRM: the events]
    lead: 'Through webhooks.',
    answer: 'You get an event when a payment is created, confirmed, and settled.',
  },
  {
    id: 'timeline',
    question: 'What is the estimated time for integration?',
    lead: 'From 1 week.',
    answer: 'Book a demo, pass KYB, and send your first live transaction. KYB is included as part of the onboarding process.',
  },
  {
    id: 'safety',
    question: 'How do you keep funds safe?',
    answer: 'We use a custodial solution with MPC under the hood and shared-secret cryptography',
  },
  {
    id: 'licence',
    question: 'What licence do you have?',
    answer: 'Velant Pay operates under a Canadian MSB licence and works with licensed third-party financial providers.',
  },
  {
    id: 'cost',
    question: 'How much does it cost?',
    // [CONFIRM: the fee model, may it be shown on the page]
    lead: 'It depends on your flow.',
    answer: 'Book a demo and we will walk you through the fees for your flow.',
  },
  {
    id: 'custom-method',
    question: 'I need a custom payment method/new currency/specific financial flow. Can you do that?',
    lead: "Probably. Tell us what you're building.",
    answer: 'We can discuss custom payment methods, currencies, settlement flows, and other requirements with our team.',
  },
]

export const cryptoProcessing: ProductContent = {
  meta: {
    title: 'Crypto Processing — Velant Pay',
    // DRAFT
    description: 'Accept crypto payments, convert them and settle to your account through one API.',
  },
  hero: {
    product: 'crypto-processing',
    title: ['Accept crypto payments', 'through one integration.'],
    // [CONFIRM: where the money goes: an account, a wallet, a balance in Velant; where the status is seen: API, webhooks, a dashboard]
    subtitle: 'Your client pays from their wallet. Velant converts the payment and settles it to your account, with a status for every payment.',
    primaryCta: bookDemo,
    secondaryCta: { label: 'See how it works', href: '#how-it-works' },
  },
  industries: { items: industries, activeId: 'ecommerce' },
  faq: { items: faqItems, openId: 'receive' },
  cta: { title: 'Ready to accept crypto payments?', subtitle: "We'll map the path from your client's wallet to your account." },
}

/** Block 1: "Follow one payment" (the scene is in PaymentJourney.tsx, its texts in sceneText.ts). */
export const flowContent = {
  title: 'Follow one payment.',
  // DRAFT. [CONFIRM: where the statuses can be seen: API, webhooks, a dashboard]
  intro: 'Press Play or pick a step to see what happens to one payment.',
} as const

/** Block 2: "Run a test payment" (the scene is in TestPayment.tsx, its texts in sceneText.ts). */
export const apiContent = {
  title: 'Run a test payment.',
  // DRAFT. [CONFIRM: how the system is told (webhooks?), the set and the names of the events]
  text: 'Your integration ends when your system learns that the order is paid. Send a test payment and watch it get there.',
} as const
