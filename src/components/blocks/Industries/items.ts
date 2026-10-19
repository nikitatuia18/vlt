export type IndustryItemData = {
  /** Same slug as the Figma layer `industries__item-{id}`. */
  id: string
  title: string
  /** Description under the title when the item is open; every string is a separate line. Only "Startups" has one in the design. */
  description?: readonly string[]
  /** Button shown with the description. Only "Startups" has one in the design. */
  cta?: { label: string; href: string }
}

/**
 * Items in the order of the design. Scrolling opens them one after another.
 * "E-commerce" is spelled "E-comersce" in the design: the typo is fixed here.
 * The texts of the items without a description are not in the design yet: add them here (description, cta).
 */
export const industries: readonly IndustryItemData[] = [
  { id: 'industry-first', title: 'Industry-first scenarios' },
  { id: 'ecommerce', title: 'E-commerce' },
  {
    id: 'startups',
    title: 'Startups',
    description: ['Let your clients pay in crypto, and receive fiat.', 'Forget about chargebacks'],
    cta: { label: 'Book a demo', href: '#book-a-demo' },
  },
  { id: 'luxury-automotive', title: 'Luxury goods and Automotive' },
  { id: 'real-estate', title: 'Real estate' },
  { id: 'export-import', title: 'Export/Import' },
  { id: 'operations-payroll', title: 'Operations and payroll' },
]

/** The item that is open in the static design (and when motion is reduced). */
export const DESIGN_ACTIVE_ID = 'startups'
