import { href } from '../../../lib/route'

export type FeatureCardData = {
  /** Same slug as the Figma layer `features__card-{id}`. */
  id: string
  title: string
  description: string
  /** Link target of the round "Learn more" button. Placeholders: the design has no URLs. */
  href: string
}

/** The four main cards, in the order of the design (the first spans two columns on wide screens). */
export const mainCards: readonly FeatureCardData[] = [
  {
    id: 'crypto',
    title: 'Crypto Processing',
    description: 'Accept, convert, and settle crypto payments via a single integration.',
    href: href('crypto-processing'),
  },
  {
    id: 'invoicing',
    title: 'Invoicing',
    description: 'Issue invoices in local currency and accept payments in crypto.',
    href: href('invoicing'),
  },
  {
    id: 'ramp',
    title: 'Crypto on- and off-ramp',
    description: 'Convert seamlessly between fiat and crypto with rates from 0.5%.',
    href: '#crypto-ramp',
  },
  {
    id: 'payouts',
    title: 'Mass Payouts',
    description: 'Automate global payouts to teams and partners in a single workflow.',
    href: '#mass-payouts',
  },
]

/** The two cards of the "coming soon" column: no link, a badge instead. */
export const soonCards: readonly Omit<FeatureCardData, 'href'>[] = [
  {
    id: 'banking',
    title: 'Banking',
    description: 'Dedicated IBANs and corporate accounts in Tier-1 banks.',
  },
  {
    id: 'wallet',
    title: 'Wallet',
    description: 'Secure custody and digital asset management for your platform.',
  },
]
