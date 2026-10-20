/** How long one step stays open before the next one opens (seconds). Set with the designer: about 5 s. */
export const STEP_SECONDS = 5

export type StepData = {
  /** Same slug as in the Figma layers `next-steps__card-{id}`. */
  id: string
  number: string
  title: string
  description: string
}

/**
 * The four steps. Only the first one has a text in the design (the others are closed there):
 * the texts of steps 2 to 4 are DRAFTS written by the developer and must be checked with the product team.
 * Fixed in the design: "Pass kyb" is "Pass KYB" (an abbreviation), a full stop is added at the end of the first text.
 */
export const steps: readonly StepData[] = [
  {
    id: 'book-demo',
    number: '01',
    title: 'Book a demo',
    description:
      'We will show you our product and discuss how it can benefit your business. So you can choose what best covers your needs.',
  },
  {
    id: 'pass-kyb',
    number: '02',
    title: 'Pass KYB',
    description:
      'Our compliance team checks your documents and verifies your business. We guide you through every requirement, so approval is quick and clear.',
  },
  {
    id: 'start-process',
    number: '03',
    title: 'Start the process',
    description:
      'We set up your account, connect the payment rails you need and run the first test payments together with your team.',
  },
  {
    id: 'go-live',
    number: '04',
    title: 'Go live',
    description:
      'You send your first live transaction. After the launch our team stays with you, so every payment keeps moving.',
  },
]
