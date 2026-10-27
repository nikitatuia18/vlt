import { RevealLines } from '../../../motion/reveal'
import { appear } from '../../../motion/tokens'
import { Container } from '../../ui/Container'
import { CornerDots } from '../../ui/CornerDots'
import { WorksWithCard, type WorksWithItem } from './WorksWithCard'

export type WorksWithProps = {
  /** The products that go well with this one, in the order of the cards (three on the product pages). */
  items: readonly WorksWithItem[]
}

/**
 * "Works great with": the other products of Velant Pay that this one is used together with, one card each, every card is a link to that product.
 * The block is not in the Figma design (the product pages are built in code); it uses the cards and tokens of the UI Kit.
 * One card below the tablet width in a column, three in a row from it.
 */
export function WorksWith({ items }: WorksWithProps) {
  return (
    <section data-el="works-with" aria-labelledby="works-with-title" className="border-b border-border-subtle">
      <Container>
        <div className="relative flex flex-col gap-8 py-12 column-lines tablet:gap-10 tablet:px-8 tablet:py-20 desktop:gap-12 desktop:px-10 desktop:py-25">
          <div data-el="works-with__header" className="flex w-full flex-col items-center text-center">
            <RevealLines
              as="h2"
              id="works-with-title"
              data-el="works-with__title"
              className="type-heading-lg max-w-156 text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm"
              lines={['Works great with']}
            />
          </div>
          <ul data-el="works-with__list" className="grid grid-cols-1 gap-4 tablet:grid-cols-3 tablet:gap-6">
            {items.map((item, index) => (
              <li key={item.product} className="flex">
                <WorksWithCard item={item} revealDelay={index * appear.card.step} />
              </li>
            ))}
          </ul>

          <CornerDots edge="top" block="works-with" />
          <CornerDots edge="bottom" block="works-with" />
        </div>
      </Container>
    </section>
  )
}
