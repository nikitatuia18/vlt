import ar from '../../../assets/global/flags/ar.svg'
import br from '../../../assets/global/flags/br.svg'
import ca from '../../../assets/global/flags/ca.svg'
import cl from '../../../assets/global/flags/cl.svg'
import eu from '../../../assets/global/flags/eu.svg'
import ge from '../../../assets/global/flags/ge.svg'
import india from '../../../assets/global/flags/in.svg'
import kg from '../../../assets/global/flags/kg.svg'
import us from '../../../assets/global/flags/us.svg'

export type Pin = {
  /** Same slug as the Figma layer `global__pin-{id}` (country / region code). */
  id: string
  /** Currency code shown on the card. */
  code: string
  /** Payment rails shown under the code. */
  rails: string
  flag: string
  /** Position of the card in the map artboard (1935 x 1202 px): left and top, px. */
  left: number
  top: number
}

/** The nine cards of the map, in the order of the Figma layers. */
export const pins: readonly Pin[] = [
  { id: 'ca', code: 'CAD', rails: 'Interac e-Transfer / EFT', flag: ca, left: 285, top: 365 },
  { id: 'us', code: 'USD', rails: 'ACH / Fedwire / FedNow', flag: us, left: 414, top: 608 },
  { id: 'eu', code: 'EUR', rails: 'SEPA / INSTANT', flag: eu, left: 906, top: 503 },
  { id: 'ge', code: 'GEL', rails: 'RTGS / RIPS', flag: ge, left: 1121, top: 554 },
  { id: 'in', code: 'INR', rails: 'IMPS / NEFT / UPI', flag: india, left: 1240, top: 684 },
  { id: 'br', code: 'BRL', rails: 'Pix / TED', flag: br, left: 594, top: 787 },
  { id: 'cl', code: 'CLP', rails: 'TEF', flag: cl, left: 500, top: 936 },
  { id: 'kg', code: 'KGS', rails: 'AZIPS / XKS', flag: kg, left: 1279, top: 493 },
  { id: 'ar', code: 'ARS', rails: 'CBU / CVU', flag: ar, left: 664, top: 910 },
]
