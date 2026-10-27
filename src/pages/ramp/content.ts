import type { FaqItemData } from '../../components/blocks/Faq/items'
import type { IndustryItemData } from '../../components/blocks/Industries/items'
import type { ProductContent } from '../ProductPage'

/*
 * Texts of the Crypto to Cash page: DRAFT, written with the copywriter (docs/pages/ramp.md, where the questions to the product are).
 * Texts marked "from the design" are the ones of the home page. [CONFIRM] = a fact we do not have yet: the text is written without it.
 */

const bookDemo = { label: 'Book a demo', href: '#book-a-demo' }

/** Industries: who moves money between a bank and a wallet, in the order the cards open (the first and the last are light, the others glow). */
const industries: readonly IndustryItemData[] = [
  {
    id: 'industry-first',
    title: 'Industry-first scenarios',
    description: ['Crypto to Cash shaped around your industry.', 'Choose the flow that looks like yours'],
    cta: bookDemo,
  },
  {
    id: 'fintech',
    glow: 'violet',
    title: 'Fintech and neobanks',
    // [CONFIRM: may it be built into the product of a client; the API]
    description: ['Offer Crypto to Cash inside your product.', 'Connect once through the API'],
    cta: bookDemo,
  },
  {
    id: 'crypto-native',
    glow: 'pink',
    title: 'Crypto-native companies',
    // [CONFIRM: the coin]
    description: ['Pay fiat costs from crypto you already hold.', 'Sell USDT, get money in your bank'],
    cta: bookDemo,
  },
  {
    id: 'treasury',
    glow: 'orange',
    title: 'Treasury and finance teams',
    // [CONFIRM: locking of the rate]
    description: ['Move company funds between bank and wallet.', 'Lock the rate before each transfer'],
    cta: bookDemo,
  },
  {
    id: 'marketplaces',
    glow: 'blue',
    title: 'Marketplaces and platforms',
    // [CONFIRM: a scenario for the clients of a client; the border with Mass Payouts]
    description: ['Fund user balances from bank transfers.', 'Pay users out to their local banks'],
    cta: bookDemo,
  },
  {
    id: 'import-export',
    glow: 'green',
    title: 'Import and export',
    // [CONFIRM: the coin]
    description: ['Pay suppliers abroad in USDT.', 'Fund it from your own bank account'],
    cta: bookDemo,
  },
  {
    id: 'agencies',
    title: 'Agencies and freelancers',
    // [CONFIRM: the rail of the payout]
    description: ['Turn crypto from clients into local currency.', 'Cash out to your bank by a local rail'],
    cta: bookDemo,
  },
]

const faqItems: readonly FaqItemData[] = [
  {
    id: 'cost',
    question: 'How much does it cost?',
    // [CONFIRM: 0.5% is from the card of the home page (design); a fee or a margin of the rate; steps by volume; may it be named on the page]
    lead: 'Rates from 0.5%.',
    answer: 'The final fee depends on your flow. Book a demo and we will walk you through it.',
  },
  {
    id: 'rate',
    question: 'How long is the rate locked?',
    // [CONFIRM: 30 seconds is the decision of the designer, not of the product; what happens after]
    lead: 'For 30 seconds.',
    answer: 'Then the quote updates, so you confirm a current rate.',
  },
  {
    id: 'rails',
    question: 'Which banks and payment rails do you support?',
    // [CONFIRM: "15+" is from the Global block of the design; does it belong to the ramp; the list by country]
    lead: '15+ direct local rails.',
    answer: 'Tell us your country and currency, and we will confirm the rails for it.',
  },
  {
    id: 'coins',
    question: 'Which coins and networks can I use?',
    // [CONFIRM: coins and networks]
    lead: 'Tell us what you hold.',
    answer: 'We will confirm the coins and networks available for your flow during the demo.',
  },
  {
    id: 'wallet',
    question: 'Do I need my own wallet?',
    // [CONFIRM: own wallet or a wallet of Velant (Wallet on the home page is "Coming soon")]
    lead: 'You choose the address and the network.',
    answer: 'We will confirm the wallet options for your setup during the demo.',
  },
  {
    id: 'limits-time',
    question: 'How much can I convert, and how fast?',
    // [CONFIRM: limits, times by rail]
    lead: 'It depends on the rail and the network.',
    answer: 'We will confirm limits and typical times for your setup during the demo.',
  },
  {
    id: 'start',
    question: 'How do I get started?',
    // [CONFIRM: does "from 1 week" hold for the ramp] (lead and answer are from the home page and Crypto Processing)
    lead: 'From 1 week.',
    answer: 'Book a demo, pass KYB, and send your first live transaction. KYB is included as part of the onboarding process.',
  },
  {
    id: 'licence',
    question: 'What licence do you have?',
    answer: 'Velant Pay operates under a Canadian MSB licence and works with licensed third-party financial providers.',
  },
]

export const ramp: ProductContent = {
  meta: {
    title: 'Crypto to Cash — Velant Pay',
    // DRAFT [CONFIRM: 0.5%, payout to a bank]
    description: 'Convert between fiat and crypto with rates from 0.5%. Deposit from your bank, receive crypto in your wallet, or pay out to your bank.',
  },
  hero: {
    product: 'ramp',
    title: ['Move money between', 'your bank and your wallet.'],
    // [CONFIRM: the rate and the fee are shown before the confirmation (as in the scene); "crypto": which coins]
    subtitle: 'Turn fiat into crypto and back. See the fee and the rate before you convert.',
    primaryCta: bookDemo,
    secondaryCta: { label: 'See how it works', href: '#how-it-works' },
  },
  industries: { items: industries, activeId: 'fintech' },
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
