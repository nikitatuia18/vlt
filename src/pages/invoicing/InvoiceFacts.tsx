import { Container } from '../../components/ui/Container'
import { CornerDots } from '../../components/ui/CornerDots'
import { appear } from '../../motion/tokens'
import { Reveal, RevealLines } from '../../motion/reveal'
import { factsContent } from './content'

/**
 * The strip of three facts under the steps: "1 link / 0% / 24/7". `invoicing__facts`.
 * Not in Figma (product pages are built in code): a light card of the UI Kit with big figures and a grey line under each.
 * The top line is the bottom border of the steps block, so only the bottom one is drawn here.
 */
export function InvoiceFacts() {
  return (
    <section data-el="invoicing__facts" aria-label={factsContent.label} className="border-b border-border-subtle">
      <Container>
        <div className="relative py-12 column-lines tablet:px-8 tablet:py-20 desktop:px-10 desktop:py-25">
          <Reveal
            variant="card"
            className="rounded-32 bg-surface-subtle p-6 ring-1 ring-border-subtle ring-inset tablet:p-8 desktop:rounded-48 desktop:p-12"
          >
            <ul data-el="invoicing__facts-list" className="grid grid-cols-1 gap-8 tablet:grid-cols-3 tablet:gap-6 desktop:gap-10">
              {factsContent.items.map((fact, index) => (
                <li key={fact.id} data-el={`invoicing__fact-${fact.id}`} className="flex flex-col gap-2 tablet:gap-4">
                  <RevealLines
                    as="p"
                    delay={index * appear.card.step}
                    data-el={`invoicing__fact-${fact.id}-value`}
                    className="type-display-sm text-typography-primary desktop:type-display-xl"
                    lines={[fact.value]}
                  />
                  <RevealLines
                    as="p"
                    delay={0.25 + index * appear.card.step}
                    data-el={`invoicing__fact-${fact.id}-text`}
                    className="type-body-md max-w-80 text-typography-secondary tablet:type-body-lead"
                    lines={[fact.text]}
                  />
                </li>
              ))}
            </ul>
          </Reveal>

          <CornerDots edge="top" block="invoicing-facts" />
          <CornerDots edge="bottom" block="invoicing-facts" />
        </div>
      </Container>
    </section>
  )
}
