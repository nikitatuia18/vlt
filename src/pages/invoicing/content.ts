import type { FaqItemData } from '../../components/blocks/Faq/items'
import type { IndustryItemData } from '../../components/blocks/Industries/items'
import type { ProductContent } from '../ProductPage'

/*
 * Texts of the Invoicing page: DRAFT, written with the copywriter (docs/pages/invoicing.md, section "Тексты (версия 2)", where the questions
 * to the product are). [CONFIRM] = a fact we do not have yet: the text is written without it.
 */

const bookDemo = { label: 'Book a demo', href: '#book-a-demo' }

/** Industries: who bills across borders, in the order the cards open (the first and the last are light, the others glow). */
const industries: readonly IndustryItemData[] = [
  {
    id: 'industry-first',
    title: 'Industry-first scenarios',
    description: ['Invoicing shaped around how your industry bills.', 'Pick the scenario closest to yours'],
    cta: bookDemo,
  },
  {
    id: 'agencies',
    glow: 'violet',
    title: 'Agencies and media buyers',
    description: ['Invoice every client in their own currency.', 'See who opened it and who paid'],
    cta: bookDemo,
  },
  {
    id: 'saas',
    glow: 'pink',
    title: 'SaaS and subscriptions',
    // [CONFIRM: recurring invoices and subscriptions]
    description: ['Bill customers abroad in their local currency.', 'Every payment is matched to its invoice'],
    cta: bookDemo,
  },
  {
    id: 'wholesale',
    glow: 'orange',
    title: 'B2B trade and wholesale',
    // [CONFIRM: limits on the size of an invoice]
    description: ['Send large invoices to buyers in other countries.', 'Share one link instead of bank details'],
    cta: bookDemo,
  },
  {
    id: 'consulting',
    glow: 'blue',
    title: 'Consulting and freelancers',
    description: ['Send a clean invoice to a client in any country.', 'Follow it from sent to paid'],
    cta: bookDemo,
  },
  {
    id: 'marketplaces',
    glow: 'green',
    title: 'Marketplaces and platforms',
    // [CONFIRM: events and API]
    description: ['Issue invoices to users in every market.', 'Get an event when each one is paid'],
    cta: bookDemo,
  },
  {
    id: 'logistics',
    title: 'Logistics and freight',
    description: ['Invoice shippers and carriers in local currency.', 'One payment link for every shipment'],
    cta: bookDemo,
  },
]

const faqItems: readonly FaqItemData[] = [
  {
    id: 'payer',
    question: 'Who can pay an invoice, and do they need an account?',
    // [CONFIRM: account and checks of the payer]
    lead: 'Your client pays from their own wallet.',
    answer: 'We will confirm during the demo whether they need to sign up first.',
  },
  {
    id: 'currencies',
    question: 'Which currencies can I invoice in?',
    // [CONFIRM: the list of currencies, what the company receives]
    lead: "Your client's local currency.",
    answer: 'We will confirm the list of supported currencies during the demo.',
  },
  {
    id: 'mismatch',
    question: 'What if a client pays too little or too much?',
    // [CONFIRM: underpayment, overpayment, partial payment, refunds]
    answer: 'We will walk you through how underpayments and overpayments are handled for your flow.',
  },
  {
    id: 'rate',
    question: 'How long are the rate and the payment link valid?',
    // [CONFIRM: when the rate is fixed, the life of the link]
    answer: 'On the demo we will confirm how the rate is set and how long a link stays active.',
  },
  {
    id: 'reminders',
    question: 'Can I send reminders or recurring invoices?',
    // [CONFIRM: reminders, recurring invoices]
    lead: 'Tell us how you bill.',
    answer: 'We will confirm which reminders and billing schedules fit your setup.',
  },
  {
    id: 'branding',
    question: 'Can I add my logo and send a PDF?',
    // [CONFIRM: PDF, logo, templates]
    answer: 'We will confirm PDF export and branding options during the demo.',
  },
  {
    id: 'matching',
    question: 'How is an invoice matched to a payment?',
    // [CONFIRM: the mechanism of matching, the events, the API, accounting integrations]
    lead: 'The payment finds its own invoice.',
    answer: 'Your system gets an event when an invoice is paid and reconciled. We will confirm the events and API for your setup during the demo.',
  },
  {
    id: 'cost-timeline',
    question: 'How much does it cost, and how fast can I start?',
    // [CONFIRM: the fees; whether "from 1 week" is about invoices] ("From 1 week" and KYB are from the home page)
    lead: 'It depends on your flow.',
    answer: 'Book a demo and we will walk you through the fees. Integration takes from 1 week, and KYB is included in onboarding.',
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
  industries: { items: industries, activeId: 'agencies' },
  faq: { items: faqItems, openId: 'payer' },
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
