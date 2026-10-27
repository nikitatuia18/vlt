import type { GlowHue } from '../../ui/GlowBackdrop'

export type IndustryItemData = {
  /** Same slug as the Figma layer `industries__item-{id}`. */
  id: string
  title: string
  /** Description under the title when the item is open; every string is a separate line. */
  description: readonly string[]
  /**
   * While this item is open the block turns dark and a glow of this hue lies behind the card (glass card).
   * No hue: the usual light block. The first and the last items have none (the scene is dark only in the middle).
   */
  glow?: GlowHue
}

/**
 * Items in the order of the design. Scrolling opens them one after another.
 *
 * Texts: only "Startups" is from the design. The other six are DRAFT copy written by the developer in the same tone
 * (two short lines) so that every card is filled; they are to be corrected with the product team.
 * "E-commerce" is spelled "E-comersce" in the design: the typo is fixed here.
 */
export const industries: readonly IndustryItemData[] = [
  {
    id: 'industry-first',
    title: 'Industry-first scenarios',
    description: ['Payment flows built around how your industry works.', 'Pick a scenario and go live faster'],
  },
  {
    id: 'ecommerce',
    glow: 'violet',
    title: 'E-commerce',
    description: ['Accept crypto at checkout and settle in local currency.', 'Reach customers in every market'],
  },
  {
    id: 'startups',
    glow: 'pink',
    title: 'Startups',
    description: ['Let your clients pay in crypto, and receive fiat.', 'Forget about chargebacks'],
  },
  {
    id: 'luxury-automotive',
    glow: 'orange',
    title: 'Luxury goods and Automotive',
    description: ['Close high-value deals with instant crypto settlement.', 'No card limits, no waiting for funds'],
  },
  {
    id: 'real-estate',
    glow: 'blue',
    title: 'Real estate',
    description: ['Take deposits and payments from buyers anywhere in the world.', 'Receive the money in the currency you need'],
  },
  {
    id: 'export-import',
    glow: 'green',
    title: 'Export/Import',
    description: ['Pay suppliers and get paid across borders in one workflow.', 'Skip slow correspondent banks'],
  },
  {
    id: 'operations-payroll',
    title: 'Operations and payroll',
    description: ['Pay teams and contractors worldwide, on schedule.', 'One batch, many currencies'],
  },
]

/** The item that is open in the static design (and when motion is reduced). */
export const DESIGN_ACTIVE_ID = 'startups'
