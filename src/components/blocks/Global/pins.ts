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
  /** Where the flag stands on the globe, degrees (a city or the middle of the country). */
  lat: number
  lon: number
  /** Which way the text goes from the flag. Neighbours (Chile / Argentina) go in opposite directions so that their cards do not overlap. */
  side: 'right' | 'left'
}

/** The nine cards of the globe, in the order of the Figma layers. */
export const pins: readonly Pin[] = [
  { id: 'ca', code: 'CAD', rails: 'Interac e-Transfer / EFT', flag: ca, lat: 51, lon: -100, side: 'right' },
  { id: 'us', code: 'USD', rails: 'ACH / Fedwire / FedNow', flag: us, lat: 38, lon: -98, side: 'right' },
  { id: 'eu', code: 'EUR', rails: 'SEPA / INSTANT', flag: eu, lat: 50, lon: 9, side: 'right' },
  { id: 'ge', code: 'GEL', rails: 'RTGS / RIPS', flag: ge, lat: 42, lon: 44, side: 'right' },
  { id: 'in', code: 'INR', rails: 'IMPS / NEFT / UPI', flag: india, lat: 22, lon: 79, side: 'right' },
  { id: 'br', code: 'BRL', rails: 'Pix / TED', flag: br, lat: -12, lon: -52, side: 'right' },
  { id: 'cl', code: 'CLP', rails: 'TEF', flag: cl, lat: -24, lon: -70, side: 'left' },
  { id: 'kg', code: 'KGS', rails: 'AZIPS / XKS', flag: kg, lat: 41, lon: 74, side: 'right' },
  { id: 'ar', code: 'ARS', rails: 'CBU / CVU', flag: ar, lat: -38, lon: -64, side: 'right' },
]
