import { ProductPage } from '../ProductPage'
import { cryptoProcessing } from './content'
import { DotMapScene } from './DotMapScene'
import { PaymentJourney } from './PaymentJourney'
import { TestPayment } from './TestPayment'

/** The page of the first product, `/crypto-processing` (structure and texts: docs/pages/crypto-processing.md). */
export default function CryptoProcessingPage() {
  return (
    <ProductPage
      content={cryptoProcessing}
      heroMedia={<DotMapScene />}
      // A phone needs a taller card: the map is small there and the panel stands under it.
      heroMediaClassName="max-tablet:aspect-[4/5]"
      sections={
        <>
          <PaymentJourney />
          <TestPayment />
        </>
      }
    />
  )
}
