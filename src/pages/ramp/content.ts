import type { FaqItemData } from '../../components/blocks/Faq/items'
import type { IndustryItemData } from '../../components/blocks/Industries/items'
import type { ProductContent } from '../ProductPage'
import { href } from '../../lib/route'

/*
 * Texts of the Crypto to Cash page: DRAFT, written with the copywriter (docs/pages/ramp.md, where the questions to the product are).
 * Texts marked "from the design" are the ones of the home page. [CONFIRM] = a fact we do not have yet: the text is written without it.
 */

const bookDemo = { label: 'Book a demo', href: href('book-a-demo') }

/** Industries: who moves money between a bank and a wallet, in the order the cards open (the first and the last are light, the others glow). */
const industries: readonly IndustryItemData[] = [
  {
    id: 'platforms-psps',
    glow: 'violet',
    title: 'Platforms & PSPs',
    description: ['Embed a ramp in your product.', 'Let your users top up by bank transfer and cash out to their own account, under your brand and through our API.'],
  },
  {
    id: 'treasury',
    glow: 'pink',
    title: 'Treasury',
    description: ['Move between stablecoins and cash.', 'Rebalance crypto revenue into operating currencies, or park cash in stablecoins between payment runs.'],
  },
  {
    id: 'otc',
    title: 'OTC',
    description: ['Large tickets, one desk.', 'For high-value conversions, our OTC desk quotes and executes with you directly.'],
  },
]

const faqItems: readonly FaqItemData[] = [
  {
    id: 'cost',
    question: 'What does conversion cost?',
    answer: 'Fees start from 0.0%. Your exact price depends on the corridors and volumes you need: book a call and we will send you a quote.',
  },
  {
    id: 'directions',
    question: 'Do you support both on-ramp and off-ramp?',
    answer: 'Yes. Money to crypto and crypto to money run through the same integration.',
  },
  {
    id: 'large',
    question: 'Can I convert large amounts?',
    answer: 'Yes. Large tickets go to our OTC desk, which quotes and executes with you directly.',
  },
  {
    id: 'start',
    question: 'What do I need to get started?',
    answer: 'A completed KYB check with our compliance team. Integration typically takes from one week, with KYB done during onboarding.',
  },
]

export const ramp: ProductContent = {
  meta: {
    title: 'Crypto to Cash — Velant Pay',
    // DRAFT [CONFIRM: 0.0%, payout to a bank]
    description: 'Convert between fiat and crypto with fees from 0.0%. Deposit from your bank, receive crypto in your wallet, or pay out to your bank.',
  },
  hero: {
    product: 'ramp',
    // The designer's heading (2026-10-29): an arrow icon between the words, the fee in the brand color.
    title: [
      [{ text: 'Cash' }, { text: '⇄', icon: 'swap' }, { text: 'crypto.' }],
      [{ text: 'From' }, { text: '0.0%.', className: 'text-typography-brand' }],
    ],
    // [CONFIRM: the rate and the fee are shown before the confirmation (as in the scene); "crypto": which coins]
    subtitle: 'Turn fiat into crypto and back. See the fee and the rate before you convert.',
    primaryCta: bookDemo,
    secondaryCta: { label: 'See how it works', href: '#how-it-works' },
  },
  // DRAFT [CONFIRM: the lines about how the products work together]
  worksWith: {
    items: [
      { product: 'crypto-processing', description: 'Accept crypto, cash out in one place.' },
      { product: 'invoicing', description: 'Invoice in local currency, settle in crypto.' },
      { product: 'mass-payouts', description: 'Fund a batch from your balance.' },
    ],
  },
  industries: { items: industries, activeId: 'platforms-psps', eyebrow: "Who it's for", title: 'Platforms, treasuries and traders.' },
  faq: { items: faqItems, openId: 'cost' },
  cta: { title: 'Ready to move money both ways?', subtitle: "We'll walk through a transfer from bank to wallet and back." },
}

/** Block 1: "Pick your route." (the scene is in RampRoutes.tsx, its texts in sceneText.ts). */
export const routesContent = {
  title: 'Pick your route.',
  // [CONFIRM: the rails and networks of the ramp; the number of rails]
  intro: 'Choose a bank rail and a network, then see the route your money takes.',
} as const

/** Block 2: "Know the price before you pay." (the scene is in RampQuote.tsx, its texts in sceneText.ts). */
export const quoteContent = {
  title: 'Know the price before you pay.',
  // [CONFIRM: 30 seconds is the decision of the designer, not of the product]
  intro: 'Watch the rate move, lock it for 30 seconds, then confirm or cancel.',
} as const
