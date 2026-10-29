import type { FaqItemData } from '../../components/blocks/Faq/items'
import type { IndustryItemData } from '../../components/blocks/Industries/items'
import type { ProductContent } from '../ProductPage'
import { href } from '../../lib/route'

/*
 * Texts of the Crypto Processing page: DRAFT, written with the copywriter (docs/pages/crypto-processing.md, where the questions
 * to the product are). Texts marked "from the design" are the ones of the home page. [CONFIRM] = a fact we do not have yet:
 * the text is written without it.
 */

const bookDemo = { label: 'Book a demo', href: href('book-a-demo') }

/** Industries: scenes of accepting crypto, in the order they open (the first and the last are light, the others glow). */
const industries: readonly IndustryItemData[] = [
  {
    id: 'luxury-automotive',
    glow: 'violet',
    title: 'Luxury & automotive',
    description: ['Close high-value deals and receive the money the same day.', 'No card limits, no waiting for funds'],
    flow: { label: 'Typical flow', steps: ['Buyer pays for the order in USDT', 'Converted to EUR on arrival', 'Goods released the same day'] },
  },
  {
    id: 'ecommerce',
    glow: 'pink',
    title: 'E-commerce',
    description: ['Accept crypto at checkout and settle in local currency.', 'Reach buyers in markets where cards fail'],
    flow: { label: 'Typical flow', steps: ['Customer picks crypto at checkout', 'Hosted page handles the payment', 'You receive local currency'] },
  },
  {
    id: 'real-estate',
    glow: 'orange',
    title: 'Real estate',
    description: ['Take deposits and payments from buyers anywhere in the world.', 'Receive the money in the currency you need'],
    flow: { label: 'Typical flow', steps: ['Buyer abroad sends a deposit in crypto', 'Converted on arrival', 'Settled to your EUR or GEL account'] },
  },
  {
    id: 'startups',
    title: 'Startups',
    description: ['Let clients pay in crypto while you receive your own currency.', 'No chargebacks to dispute'],
    flow: { label: 'Typical flow', steps: ['Client pays in stablecoins', 'Converted automatically, no chargebacks', 'Money in your account'] },
  },
]

const faqItems: readonly FaqItemData[] = [
  {
    id: 'assets',
    question: 'Which assets can my customers pay with?',
    answer: 'BTC, ETH and the main stablecoins, USDT and USDC. The current list of assets and networks is in the documentation.',
  },
  {
    id: 'volatility',
    question: 'Am I exposed to crypto price volatility?',
    answer: 'No. With auto-conversion the payment is converted the moment it is made, so you receive exactly the amount you charged.',
  },
  {
    id: 'timeline',
    question: 'How long does integration take?',
    answer: 'Typically from one week, with KYB done as part of onboarding.',
  },
  {
    id: 'safety',
    question: 'How do you keep funds safe?',
    answer: 'Funds are held in custody built on MPC and shared-secret cryptography, so no single key can move them. Every incoming transaction is also screened for AML risk.',
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
  // DRAFT [CONFIRM: the lines about how the products work together]
  worksWith: {
    items: [
      { product: 'invoicing', description: 'Bill in local currency, get paid in crypto.' },
      { product: 'crypto-to-cash', description: 'Crypto to your currency and back, from 0.5%.' },
      { product: 'mass-payouts', description: 'Pay teams and partners in one batch.' },
    ],
  },
  industries: { items: industries, activeId: 'luxury-automotive', eyebrow: "Who it's for", title: 'Made for high-value and cross-border sales.' },
  faq: { items: faqItems, openId: 'assets' },
  cta: { title: 'Ready to accept crypto payments?', subtitle: "We'll map the path from your client's wallet to your account." },
}

/**
 * The strip of three points under the hero (Highlights.tsx). The texts are the designer's; each one is split at its own comma or colon:
 * the first part is the point (dark), the rest is the detail (grey).
 */
export const highlightsContent = {
  label: 'Crypto Processing in three points',
  items: [
    { id: 'converted', lead: 'Converted at the moment of payment,', detail: 'safe from price swings' },
    { id: 'local-rails', lead: 'Paid out to your bank over local rails:', detail: 'SEPA Instant, FedNow, Pix, UPI, RIPS…' },
    { id: 'no-chargebacks', lead: 'No chargebacks:', detail: 'a crypto payment cannot be pulled back' },
  ],
} as const

/** The six cards "What you get" (WhatYouGet.tsx), the texts of the designer's reference "Velant Pay — product pages". */
export const whatYouGetContent = {
  eyebrow: 'What you get',
  title: ['Built for finance teams,', 'not just developers.'],
  items: [
    { id: 'auto-convert', icon: 'swap', title: 'Instant auto-convert', text: 'The rate is locked when the customer pays. Settle everything in your currency, or keep a share in stablecoins.' },
    { id: 'settlement-rails', icon: 'bank', title: 'Local settlement rails', text: 'EUR via SEPA Instant, USD via FedNow, BRL via Pix, INR via UPI, GEL via RIPS and more.' },
    { id: 'checkout-api', icon: 'card', title: 'Hosted checkout or API', text: 'Launch with a hosted payment page, or build your own checkout on the API and webhooks.' },
    { id: 'custody', icon: 'shield', title: 'MPC custody', text: 'Funds in transit are protected by MPC custody and shared-secret cryptography: no single key can move them.' },
    { id: 'reporting', icon: 'chart', title: 'Real-time reporting', text: 'Follow each payment from detection to settlement, and export it for accounting and reconciliation.' },
    { id: 'compliance', icon: 'user', title: 'Compliance built in', text: 'Registered MSB in Canada, KYB as part of onboarding, AML screening on every payment.' },
  ],
} as const

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
