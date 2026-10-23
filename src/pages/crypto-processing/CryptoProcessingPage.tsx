import { ProductPage } from '../ProductPage'
import { ApiEvents } from './ApiEvents'
import { cryptoProcessing } from './content'
import { PaymentFlow } from './PaymentFlow'

/** The page of the first product, `/crypto-processing` (structure and texts: docs/pages/crypto-processing.md). */
export default function CryptoProcessingPage() {
  return (
    <ProductPage
      content={cryptoProcessing}
      sections={
        <>
          <PaymentFlow />
          <ApiEvents />
        </>
      }
    />
  )
}
