import type { ReactNode } from 'react'
import { InteractiveDots } from '../../../ui/InteractiveDots'
import { InvoicingIllustration } from './InvoicingIllustration'
import { PayoutsIllustration } from './PayoutsIllustration'
import { RampIllustration } from './RampIllustration'
import { TesseractIllustration } from './TesseractIllustration'

/**
 * The animated picture of a card of the block "features", by the id of the card (`features__card-{id}`). Spec: docs/blocks/features.motion.md.
 * Crypto Processing: the dot background of the UI Kit (it replaces the static picture `features__card-crypto-bg`) and the tesseract above it.
 */
export const cardIllustrations: Record<string, ReactNode> = {
  crypto: (
    <>
      <InteractiveDots ripple={{ delay: 0.4, duration: 1.2 }} />
      <TesseractIllustration />
    </>
  ),
  invoicing: <InvoicingIllustration />,
  ramp: <RampIllustration />,
  payouts: <PayoutsIllustration />,
}
