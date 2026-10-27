/** The texts of the page "Book a demo". The list and the steps are the ones of the brief; the texts of the card are drafts (docs/pages/book-a-demo.md). */
export const bookDemo = {
  meta: {
    title: 'Book a demo — Velant Pay',
    description: 'Pick a time for a call with the Velant Pay team and get a tailored integration plan.',
  },
  title: 'Discover benefits of Velant Pay products for your business',
  listTitle: "During the call, we'll show you how to:",
  list: [
    'Accept crypto from customers worldwide',
    'Receive settlements directly to your bank account',
    'Reduce payment processing costs',
    'Go live in under 7 days',
    'Automate payment operations and reconciliation',
  ],
  stepsTitle: 'Next steps',
  steps: [
    { label: 'Step 1', text: 'Choose a convenient time slot below' },
    { label: 'Step 2', text: 'Receive an instant calendar invitation to your email' },
    { label: 'Step 3', text: 'Meet our team and get a tailored integration plan' },
  ],
  // Draft: the brief gives the meaning ("the meeting is booked, check your mail, see you on the call"), not the words.
  card: {
    button: 'Book a demo',
    loading: 'Opening the calendar…',
    bookedTitle: 'Your meeting is booked.',
    bookedText: 'Check your email for the calendar invitation. See you on the call.',
    errorText: 'We could not open the calendar.',
    errorLink: 'Open the calendar in a new tab',
  },
} as const
