import cryptoProcessingIcon from '../../../assets/icons/products/1.svg'
import invoicingIcon from '../../../assets/icons/products/2.svg'
import cryptoToCashIcon from '../../../assets/icons/products/3.svg'
import massPayoutsIcon from '../../../assets/icons/products/4.svg'
import bankingIcon from '../../../assets/icons/products/5.svg'
import walletIcon from '../../../assets/icons/products/6.svg'
import { href } from '../../../lib/route'

/** A product in the dropdown of "Products". `href` is missing while the product is "Soon": the item is not a link then. */
export type ProductMenuItem = {
  id: string
  label: string
  description: string
  icon: string
  href?: string
}

/**
 * The products of the dropdown, in the order set by the designer: read down the left column, then down the right one (the panel fills its columns top to bottom). Kept apart from `navigation.ts`
 * because that file is imported by the tests in Node, where the SVG imports below do not work.
 */
export const productMenuItems: readonly ProductMenuItem[] = [
  { id: 'crypto-processing', label: 'Crypto Processing', description: 'Accept, convert and settle crypto via one integration.', icon: cryptoProcessingIcon, href: href('crypto-processing') },
  { id: 'crypto-to-cash', label: 'Crypto to Cash', description: 'Convert between your currency and crypto, in both directions.', icon: cryptoToCashIcon, href: href('ramp') },
  { id: 'invoicing', label: 'Invoicing', description: 'Issue invoices in your currency and accept payments in crypto.', icon: invoicingIcon, href: href('invoicing') },
  { id: 'mass-payouts', label: 'Mass Payouts', description: 'Pay teams and partners worldwide in one workflow.', icon: massPayoutsIcon, href: href('mass-payouts') },
  { id: 'banking', label: 'Banking', description: 'Dedicated IBANs and corporate accounts with Tier-1 banks.', icon: bankingIcon },
  { id: 'wallet', label: 'Wallet', description: 'Secure custody and digital asset management for your platform.', icon: walletIcon },
]
