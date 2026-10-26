import { ProductPage } from '../ProductPage'
import { ramp } from './content'
import { RampQuote } from './RampQuote'
import { RampRoutes } from './RampRoutes'
import { RampScene } from './RampScene'

/** The page of the third product, `/ramp` (structure and texts: docs/pages/ramp.md, "версия 2"). Below the desktop the card of the hero grows with its content. */
export default function RampPage() {
  return (
    <ProductPage
      content={ramp}
      heroMedia={<RampScene />}
      heroMediaClassName="max-desktop:aspect-auto"
      sections={
        <>
          <RampRoutes />
          <RampQuote />
        </>
      }
    />
  )
}
