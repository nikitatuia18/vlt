import { ArrowCircle } from '../components/ui/ArrowCircle'
import { Section } from './Section'

/** The round arrow of a clickable card in its card: the card turns grey under the pointer, the circle stays white, the arrow gives a short push. */
export function ArrowShowcase() {
  return (
    <Section
      id="arrow-circle"
      title="Arrow circle"
      note="ArrowCircle: the round mark of a card that is a link as a whole (Features, Works great with). Under the pointer the card turns grey (hover:bg-surface-hover with interactive-card), the circle stays white and the arrow gives one short push up and to the right and back (interactive-nudge, 0.45 s). Hover the card."
    >
      <div
        data-el="ui-kit__arrow-circle-card"
        className="group flex max-w-sm flex-col gap-8 rounded-40 bg-surface-subtle p-6 ring-1 ring-inset ring-border-subtle interactive-card hover:bg-surface-hover"
      >
        <div className="flex flex-col gap-2">
          <h3 className="type-heading-md text-typography-primary">A card that is a link</h3>
          <p className="type-body-md text-typography-secondary">The whole card is one link; the arrow is only a picture.</p>
        </div>
        <ArrowCircle className="self-end" />
      </div>
    </Section>
  )
}
