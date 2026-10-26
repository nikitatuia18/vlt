import { ProductPage } from '../ProductPage'
import { BatchScene } from './BatchScene'
import { massPayouts } from './content'
import { CrowdScene } from './CrowdScene'
import { RoutingScene } from './RoutingScene'

/** The page of the fourth product, `/mass-payouts` (structure and texts: docs/pages/mass-payouts.md). Below the desktop the card of the hero grows with its content. */
export default function MassPayoutsPage() {
  return (
    <ProductPage
      content={massPayouts}
      heroMedia={<CrowdScene />}
      heroMediaClassName="max-desktop:aspect-auto"
      sections={
        <>
          <BatchScene />
          <RoutingScene />
        </>
      }
    />
  )
}
