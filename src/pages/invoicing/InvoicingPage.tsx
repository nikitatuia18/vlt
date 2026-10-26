import { ProductPage } from '../ProductPage'
import { CabinetScene } from './CabinetScene'
import { invoicing } from './content'
import { InvoiceSteps } from './InvoiceSteps'

/** The page of the second product, `/invoicing` (structure and texts: docs/pages/invoicing.md). */
export default function InvoicingPage() {
  return <ProductPage content={invoicing} heroMedia={<CabinetScene />} heroMediaClassName="max-desktop:aspect-auto" sections={<InvoiceSteps />} />
}
