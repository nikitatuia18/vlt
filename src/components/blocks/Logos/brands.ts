import alltrust from '../../../assets/logos/alltrust.svg'
import applePay from '../../../assets/logos/apple-pay.svg'
import bybit from '../../../assets/logos/bybit.svg'
import flitt from '../../../assets/logos/flitt.svg'
import googlePay from '../../../assets/logos/google-pay.svg'
import multimoney from '../../../assets/logos/multimoney.svg'
import sepa from '../../../assets/logos/sepa.svg'
import swift from '../../../assets/logos/swift.svg'
import utila from '../../../assets/logos/utila.svg'

export type Brand = {
  /** Same slug as the Figma layer `logos__item-{slug}`. */
  slug: string
  /** Accessible name. */
  name: string
  src: string
  /** Position and size of the logo inside the 48 x 48 px icon slot, as in the design (px). */
  box: { left: number; top: number; width: number; height: number }
}

/** The order is the order of the tiles in the design, left to right; it repeats every 9 tiles. */
export const brands: readonly Brand[] = [
  { slug: 'bybit', name: 'Bybit', src: bybit, box: { left: 0, top: 16, width: 48, height: 16.0958 } },
  { slug: 'utila', name: 'Utila', src: utila, box: { left: 0.36, top: 6.53, width: 48, height: 34 } },
  { slug: 'multimoney', name: 'MultiMoney', src: multimoney, box: { left: 0, top: 0, width: 48, height: 48.0547 } },
  { slug: 'flitt', name: 'Flitt', src: flitt, box: { left: 0, top: 0, width: 48.0859, height: 48 } },
  { slug: 'apple-pay', name: 'Apple Pay', src: applePay, box: { left: 0, top: 0, width: 48.5, height: 48 } },
  { slug: 'google-pay', name: 'Google Pay', src: googlePay, box: { left: -0.04, top: 11.79, width: 48, height: 23 } },
  { slug: 'alltrust', name: 'AllTrust', src: alltrust, box: { left: 2.32, top: 0.26, width: 44, height: 48 } },
  { slug: 'sepa', name: 'SEPA', src: sepa, box: { left: -0.27, top: 0, width: 48.2734, height: 48 } },
  { slug: 'swift', name: 'SWIFT', src: swift, box: { left: 0, top: 0, width: 48.0938, height: 48 } },
]
