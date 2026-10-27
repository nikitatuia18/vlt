import bankingIcon from '../../../assets/icons/products/05-banking.svg'
import cryptoProcessingIcon from '../../../assets/icons/products/01-crypto-processing.svg'
import cryptoToCashIcon from '../../../assets/icons/products/03-crypto-to-cash.svg'
import invoicingIcon from '../../../assets/icons/products/02-invoicing.svg'
import massPayoutsIcon from '../../../assets/icons/products/04-mass-payouts.svg'
import walletIcon from '../../../assets/icons/products/06-wallet.svg'
import { href } from '../../../lib/route'

/** A product in the dropdown of "Products". `href` is missing while the product is "Soon": the item is not a link then. */
export type ProductMenuItem = {
  id: string
  /** The number in the list ("01"); it is also the number of the icon file in `assets/icons/products/`. */
  number: string
  label: string
  description: string
  icon: string
  href?: string
}

/**
 * The products of the dropdown, in the order of the cards of the home page (Features). Kept apart from `navigation.ts`
 * because that file is imported by the tests in Node, where the SVG imports below do not work.
 */
export const productMenuItems: readonly ProductMenuItem[] = [
  { id: 'crypto-processing', number: '01', label: 'Crypto Processing', description: 'Accept, convert and settle crypto payments via a single integration.', icon: cryptoProcessingIcon, href: href('crypto-processing') },
  { id: 'invoicing', number: '02', label: 'Invoicing', description: 'Issue invoices in your currency and accept payments in crypto.', icon: invoicingIcon, href: href('invoicing') },
  { id: 'crypto-to-cash', number: '03', label: 'Crypto to Cash', description: 'Convert between your currency and crypto, in both directions.', icon: cryptoToCashIcon, href: href('ramp') },
  { id: 'mass-payouts', number: '04', label: 'Mass Payouts', description: 'Pay teams and partners worldwide in one workflow.', icon: massPayoutsIcon, href: href('mass-payouts') },
  { id: 'banking', number: '05', label: 'Banking', description: 'Dedicated IBANs and corporate accounts with Tier-1 banks.', icon: bankingIcon },
  { id: 'wallet', number: '06', label: 'Wallet', description: 'Secure custody and digital asset management for your platform.', icon: walletIcon },
]
