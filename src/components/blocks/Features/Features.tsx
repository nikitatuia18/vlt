import { RevealLines } from '../../../motion/reveal'
import { ColumnFade } from '../../ui/ColumnFade'
import { Container } from '../../ui/Container'
import { CornerDots } from '../../ui/CornerDots'
import { InteractiveDots } from '../../ui/InteractiveDots'
import { appear } from '../../../motion/tokens'
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
    <section data-el="features" aria-labelledby="features-title" className="border-y border-border-subtle">
      <Container>
        <div
          data-el="features__container"
          // The column lines are drawn inside (an inset shadow, like a Figma stroke), so they do not narrow the content.
          className="relative flex flex-col items-center gap-8 py-12 column-lines tablet:gap-10 tablet:py-20 desktop:gap-12 desktop:px-10 desktop:py-35"
        >
          <div
            data-el="features__header"
            className="flex flex-col items-center gap-4 text-center tablet:gap-6 desktop:px-10"
          >
            <RevealLines
              as="p"
              step={0.06}
              data-el="features__eyebrow"
              className="type-heading-sm max-w-120 text-typography-secondary tablet:type-heading-md desktop:type-heading-lg"
              lines={['Accept. Move. Hold. Pay out.']}
            />
            <RevealLines
              delay={0.3}
              id="features-title"
              data-el="features__title"
              className="type-heading-lg max-w-156 text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm"
              lines={['Everything you need to move money.']}
            />
          </div>

          <div data-el="features__grid" className="grid w-full grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
            {mainCards.map((card, index) => (
              <FeatureCard
                key={card.id}
                {...card}
                // The cards come one after another along the row (the rows come into view one by one anyway).
                revealDelay={(index % 3) * appear.card.step * 1.5}
                // The first card spans two columns. The crypto text is a fixed 400 px wide in the design.
                className={index === 0 ? 'tablet:col-span-2' : ''}
                textClassName={index === 0 ? 'w-full desktop:w-100' : 'w-full'}
                // The background of the crypto card is the same dot grid as in the hero (the static picture `features__card-crypto-bg`
                // of the design is replaced by the UI Kit component). The tesseract (`img-tesseract`) will be added to this slot later.
                illustration={index === 0 ? <InteractiveDots ripple={{ delay: 0.4, duration: 1.2 }} /> : undefined}
              />
            ))}
            <div data-el="features__col-soon" className="flex flex-col justify-center gap-6 self-stretch">
              {soonCards.map((card, index) => (
                <SoonCard key={card.id} {...card} revealDelay={0.24 + index * appear.card.step * 1.5} />
              ))}
            </div>
          </div>

          {/* Decorative dots on the corners of the column where it meets the lines above and below (UI Kit component). */}
          <CornerDots edge="top" block="features" />
          <CornerDots edge="bottom" block="features" />
          {/* The column lines go on above the block and fade out (the block above has no column lines). */}
          <ColumnFade edge="top" block="features" />
        </div>
      </Container>
    </section>
  )
}
