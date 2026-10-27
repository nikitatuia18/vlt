import { ArrowCircle } from '../components/ui/ArrowCircle'
import { Section } from './Section'

const nudges = [
  { id: 'a', title: 'A. One step', note: 'The arrow moves 3 px up and to the right and stays there while the pointer is on the card.', arrowClassName: 'nudge-a' },
  { id: 'b', title: 'B. A push and back', note: 'A short push of 4 px up and to the right and back, once per hover (0.45 s).', arrowClassName: 'nudge-b' },
  { id: 'c', title: 'C. Through the circle', note: 'The arrow leaves the circle up and to the right and comes back from the lower left, once per hover (0.6 s).', arrowClassName: 'nudge-c' },
] as const

/** The round arrow of a clickable card, still and with the three variants of its nudge on hover (to be chosen by the designer). */
export function ArrowShowcase() {
  return (
    <Section
      id="arrow-circle"
      title="Arrow circle"
      note="ArrowCircle: the round mark of a card that is a link as a whole (Features, Works great with). The card turns grey under the pointer and the circle stays white. Hover the cards to compare the nudge of the arrow."
    >
      <div className="grid gap-6 tablet:grid-cols-3">
        {nudges.map((nudge) => (
          <div
            key={nudge.id}
            data-el={`ui-kit__arrow-circle-${nudge.id}`}
            className="group flex flex-col justify-between gap-8 rounded-40 bg-surface-subtle p-6 ring-1 ring-inset ring-border-subtle interactive-card hover:bg-surface-hover"
          >
            <div className="flex flex-col gap-2">
              <h3 className="type-heading-md text-typography-primary">{nudge.title}</h3>
              <p className="type-body-md text-typography-secondary">{nudge.note}</p>
            </div>
            <ArrowCircle className="self-end" arrowClassName={nudge.arrowClassName} />
          </div>
        ))}
      </div>
    </Section>
  )
}
