import cornerDot from '../../../assets/decor/corner-dot.svg'
import { Container } from '../../ui/Container'
import { Icon } from '../../ui/Icon'
import { mainCards, soonCards } from './cards'
import { FeatureCard, SoonCard } from './FeatureCard'

/**
 * Product cards. Figma block `features`.
 * The illustrations inside the cards (and their animations) are not built yet: the cards keep the size of the design
 * and have a slot for them (`illustration` of FeatureCard).
 *
 * From the design: section border at the bottom, content column 1440 px with 40 px inside, vertical padding 140 px,
 * gap 48 px between the header and the grid, grid of 3 columns with a 24 px gap, title steps like in the hero.
 * Derived (not in the desktop frame): 2 columns from 768 px, 1 column below; smaller paddings, gaps and type sizes.
 */
export function Features() {
  return (
    <section data-el="features" aria-labelledby="features-title" className="border-b border-border-subtle">
      <Container>
        <div
          data-el="features__container"
          // The column outline is drawn inside (a ring, like a Figma stroke), so it does not narrow the content. It is fully transparent (border/alpha-0).
          className="relative flex flex-col items-center gap-8 py-12 ring-1 ring-border-alpha-0 ring-inset tablet:gap-10 tablet:py-20 desktop:gap-12 desktop:px-10 desktop:py-35"
        >
          <div
            data-el="features__header"
            className="flex flex-col items-center gap-4 text-center tablet:gap-6 desktop:px-10"
          >
            <p
              data-el="features__eyebrow"
              className="type-heading-sm max-w-120 text-typography-secondary tablet:type-heading-md desktop:type-heading-lg"
            >
              Accept. Move. Hold. Pay out.
            </p>
            <h2
              id="features-title"
              data-el="features__title"
              className="type-heading-lg max-w-156 text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm"
            >
              Everything you need to move money.
            </h2>
          </div>

          <div data-el="features__grid" className="grid w-full grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
            {mainCards.map((card, index) => (
              <FeatureCard
                key={card.id}
                {...card}
                // The first card spans two columns. The crypto text is a fixed 400 px wide in the design.
                className={index === 0 ? 'tablet:col-span-2' : ''}
                textClassName={index === 0 ? 'w-full desktop:w-100' : 'w-full'}
              />
            ))}
            <div data-el="features__col-soon" className="flex flex-col justify-center gap-6 self-stretch">
              {soonCards.map((card) => (
                <SoonCard key={card.id} {...card} />
              ))}
            </div>
          </div>

          {/* Decorative 5 px dots on the bottom corners of the column, as in the design. */}
          <span data-el="features__deco-corner-bl" aria-hidden="true" className="absolute -bottom-[3px] -left-[3px] text-icon-primary">
            <Icon src={cornerDot} width={5} height={5} />
          </span>
          <span data-el="features__deco-corner-br" aria-hidden="true" className="absolute -right-[3px] -bottom-[3px] text-icon-primary">
            <Icon src={cornerDot} width={5} height={5} />
          </span>
        </div>
      </Container>
    </section>
  )
}
