import { Container } from '../../components/ui/Container'
import { CornerDots } from '../../components/ui/CornerDots'
import { InteractiveDots } from '../../components/ui/InteractiveDots'
import { usePageMeta } from '../../lib/usePageMeta'
import { Reveal, RevealLines } from '../../motion/reveal'
import { appear } from '../../motion/tokens'
import { PageShell } from '../PageShell'
import { BookingCard } from './BookingCard'
import { bookDemo } from './content'

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * The page of the button "Book a demo", `/book-a-demo` (texts and states: docs/pages/book-a-demo.md). Not in Figma: built from the design system.
 * The heading, then the text of the call (what we will show, the three steps) and the card with the booking: from the desktop width
 * side by side, below it one under another (the card last, it is where the visitor ends up).
 */
export default function BookDemoPage() {
  usePageMeta(bookDemo.meta)
  return (
    <PageShell currentId="book-a-demo">
      <section data-el="book-a-demo" aria-labelledby="book-a-demo-title" className="relative overflow-hidden border-b border-border-subtle">
        <div data-el="book-a-demo__bg" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[60%]">
          <InteractiveDots ripple={{ delay: 0.25, duration: 1.4, origin: [0.5, 0.2] }} />
          <div className="absolute inset-0 bg-linear-to-b from-surface-page/0 to-surface-page" />
        </div>

        <Container>
          <div className="relative flex flex-col gap-10 py-12 column-lines tablet:gap-14 tablet:px-8 tablet:py-20 desktop:gap-20 desktop:px-10 desktop:py-35">
            <RevealLines
              as="h1"
              atLoad
              delay={0.35}
              id="book-a-demo-title"
              data-el="book-a-demo__title"
              className="type-heading-lg mx-auto max-w-300 text-center text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm desktop:type-display-lg"
              lines={[bookDemo.title]}
            />

            <div className="grid gap-10 desktop:grid-cols-2 desktop:items-start desktop:gap-12">
              <div className="flex flex-col gap-10 tablet:gap-12">
                <div data-el="book-a-demo__list-block" className="flex flex-col gap-5">
                  <RevealLines as="h2" atLoad delay={0.9} data-el="book-a-demo__list-title" className="type-heading-md text-typography-primary" lines={[bookDemo.listTitle]} />
                  <ul data-el="book-a-demo__list" className="flex flex-col gap-3">
                    {bookDemo.list.map((item, index) => (
                      <li key={item} className="flex items-start gap-3">
                        <Reveal variant="pop" atLoad delay={1.1 + index * 0.08} className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-pill bg-surface-brand-light text-icon-brand">
                          <CheckIcon />
                        </Reveal>
                        <RevealLines as="p" atLoad delay={1.1 + index * 0.08} className="type-body-lead text-typography-primary" lines={[item]} />
                      </li>
                    ))}
                  </ul>
                </div>

                <div data-el="book-a-demo__steps-block" className="flex flex-col gap-5">
                  <RevealLines as="h2" delay={0.1} data-el="book-a-demo__steps-title" className="type-heading-md text-typography-primary" lines={[bookDemo.stepsTitle]} />
                  <ol data-el="book-a-demo__steps" className="flex flex-col gap-3">
                    {bookDemo.steps.map((step, index) => (
                      <Reveal as="li" variant="card" key={step.label} delay={index * appear.card.step} className="flex flex-col gap-1 rounded-24 bg-surface-subtle p-5 ring-1 ring-inset ring-border-subtle">
                        <RevealLines as="span" className="type-ui-sm text-typography-secondary" lines={[step.label]} />
                        <RevealLines as="p" className="type-body-md text-typography-primary" lines={[step.text]} />
                      </Reveal>
                    ))}
                  </ol>
                </div>
              </div>

              <Reveal variant="card" atLoad delay={1.2}>
                <BookingCard />
              </Reveal>
            </div>

            <CornerDots edge="bottom" block="book-a-demo" />
          </div>
        </Container>
      </section>
    </PageShell>
  )
}
