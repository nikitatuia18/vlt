import { Reveal, RevealLines } from '../../../motion/reveal'
import { ArrowCircle } from '../../ui/ArrowCircle'
import { Icon } from '../../ui/Icon'
import { productMenuItems } from '../../ui/Header/productMenu'

/** The id of a product as in the dropdown of "Products" (`productMenu.ts`); only the products with a page can be linked. */
export type WorksWithProduct = 'crypto-processing' | 'crypto-to-cash' | 'invoicing' | 'mass-payouts'

export type WorksWithItem = {
  product: WorksWithProduct
  /** One line about how the two products work together (it is different on every page). */
  description: string
}

/**
 * One card: the icon of the product, the round arrow, the name and one line. The whole card is the link (a plain `<a>`, the arrow is only a picture),
 * it grows a little under the pointer and turns grey; the circle keeps its white. Layers `works-with__card-{product}` and its parts.
 * The name, the icon and the link are taken from the dropdown of "Products", so a product is called the same everywhere.
 */
export function WorksWithCard({ item, revealDelay = 0 }: { item: WorksWithItem; revealDelay?: number }) {
  const { product, description } = item
  const menuItem = productMenuItems.find((candidate) => candidate.id === product)
  if (!menuItem?.href) throw new Error(`WorksWith: "${product}" has no page to link to`)

  return (
    <Reveal
      as="a"
      variant="card"
      href={menuItem.href}
      delay={revealDelay}
      data-el={`works-with__card-${product}`}
      className="group relative isolate flex w-full flex-col justify-between gap-12 rounded-40 bg-surface-subtle p-6 ring-1 ring-inset ring-border-subtle interactive-card hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-typography-brand tablet:p-8"
    >
      <div className="flex items-center justify-between">
        <span data-el={`works-with__card-${product}-icon`} className="text-icon-primary">
          <Icon src={menuItem.icon} width={24} height={24} />
        </span>
        <ArrowCircle data-el={`works-with__card-${product}-arrow`} />
      </div>
      <div className="flex flex-col gap-2">
        <RevealLines
          as="h3"
          delay={revealDelay + 0.2}
          data-el={`works-with__card-${product}-title`}
          className="type-heading-md text-typography-primary desktop:type-heading-lg"
          lines={[menuItem.label]}
        />
        <RevealLines
          as="p"
          delay={revealDelay + 0.45}
          data-el={`works-with__card-${product}-desc`}
          className="type-body-md text-typography-secondary"
          lines={[description]}
        />
      </div>
    </Reveal>
  )
}
