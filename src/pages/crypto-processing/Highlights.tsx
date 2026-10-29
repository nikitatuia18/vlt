import { Container } from '../../components/ui/Container'
import { CornerDots } from '../../components/ui/CornerDots'
import { appear } from '../../motion/tokens'
import { Reveal, RevealLines } from '../../motion/reveal'
import { highlightsContent } from './content'

/**
 * The strip of three points right under the hero: what the product does for the money. `crypto-processing__highlights`.
 * Not in Figma (product pages are built in code): the light card of the UI Kit (as the facts of Invoicing), three columns,
 * in each the point in the dark color and its detail in grey. The top line is drawn here, the bottom one is the top of the next block.
 */
export function Highlights() {
  return (
    <section data-el="crypto-processing__highlights" aria-label={highlightsContent.label} className="border-t border-border-subtle">
      <Container>
        <div className="relative py-12 column-lines tablet:px-8 tablet:py-20 desktop:px-10 desktop:py-25">
          <Reveal
            variant="card"
            className="rounded-32 bg-surface-subtle p-6 ring-1 ring-border-subtle ring-inset tablet:p-8 desktop:rounded-48 desktop:p-12"
          >
            <ul data-el="crypto-processing__highlights-list" className="grid grid-cols-1 gap-8 min-[64rem]:grid-cols-3 min-[64rem]:gap-6 desktop:gap-10">
              {highlightsContent.items.map((item, index) => (
                <li key={item.id} data-el={`crypto-processing__highlight-${item.id}`}>
                  <RevealLines
                    as="p"
                    delay={index * appear.card.step}
                    data-el={`crypto-processing__highlight-${item.id}-text`}
                    className="type-heading-md text-typography-secondary desktop:type-heading-lg"
                    lines={[[{ text: item.lead, className: 'text-typography-primary' }, { text: item.detail }]]}
                  />
                </li>
              ))}
            </ul>
          </Reveal>

          <CornerDots edge="top" block="crypto-processing-highlights" />
          <CornerDots edge="bottom" block="crypto-processing-highlights" />
        </div>
      </Container>
    </section>
  )
}
