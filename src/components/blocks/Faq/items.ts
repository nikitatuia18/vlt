export type FaqItemData = {
  /** Same slug as the Figma layer `faq__item-{id}`. */
  id: string
  question: string
  /** First part of the answer, set in the primary text color in the design (optional). */
  lead?: string
  /** The rest of the answer, in the secondary text color. */
  answer: string
}

/**
 * Questions and answers from the design, in its order. The answers of the closed items are hidden layers in Figma:
 * their texts are taken from there. Fixed in the design: "VelantPay" is written "Velant Pay" like the brand everywhere else,
 * the stray spaces at the end of two questions are removed.
 */
export const faqItems: readonly FaqItemData[] = [
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
    id: 'timeline',
    question: 'What is the estimated time for integration?',
    lead: 'From 1 week.',
    answer: 'KYB is included as part of the onboarding process.',
  },
  {
    id: 'support',
    question: 'Do you provide integration and customer support?',
    answer: 'Yes. Our team can support you through integration, onboarding, and ongoing operations.',
  },
  {
    id: 'custom-method',
    question: 'I need a custom payment method/new currency/specific financial flow. Can you do that?',
    lead: "Probably. Tell us what you're building.",
    answer: 'We can discuss custom payment methods, currencies, settlement flows, and other requirements with our team.',
  },
]

/** The item that is open in the design (and when the page loads). */
export const DESIGN_OPEN_ID = 'safety'
