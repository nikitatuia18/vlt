import { ButtonLink } from '../../ui/ButtonLink'
import { Container } from '../../ui/Container'
import { InteractiveDots } from './InteractiveDots'

/**
 * First screen. Figma block `hero`.
 * The dashboard mockup (`hero__dash`) is intentionally not built yet: it will come with its animation.
 * Its place is the empty `hero__media` slot at the bottom.
 *
 * Sizes marked "derived" are not in the desktop frame; check them against the mobile frame later.
 */
export function Hero() {
  return (
    <section data-el="hero" aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* Background: the static picture `img-hero-bg` of the design is replaced by the interactive dot grid. */}
      <div data-el="hero__bg" aria-hidden="true" className="pointer-events-none absolute inset-0">
        <InteractiveDots />
      </div>

      <Container data-el="hero__content" className="relative py-12 tablet:py-20 desktop:py-35">
        <div data-el="hero__intro" className="flex flex-col items-center gap-8 tablet:gap-12 desktop:px-10">
          <div data-el="hero__text-wrap" className="flex flex-col items-center gap-4 text-center tablet:gap-6">
            {/* Title steps: mobile heading-lg, tablet heading-xl, from 1024 px display-sm, desktop display-xl (derived except desktop). */}
            <h1
              id="hero-title"
              data-el="hero__title"
              className="type-heading-lg text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm desktop:type-display-xl"
            >
              Banking for today.
              <br />
              Clients pay their way.
              <br />
              You settle yours.
            </h1>
            <p
              data-el="hero__subtitle"
              className="type-body-md max-w-175 text-typography-secondary tablet:type-body-lead"
            >
              One API for payments, crypto, payouts and financial operations — built for companies moving money across
              borders.
            </p>
          </div>

          <div data-el="hero__actions" className="flex w-full flex-col gap-4 tablet:w-auto tablet:flex-row">
            <ButtonLink
              href="#book-a-demo"
              size="lg"
              icon="export"
              data-el="hero__cta-primary"
              className="w-full tablet:w-auto"
            >
              Book a demo
            </ButtonLink>
            <ButtonLink
              href="#products"
              size="lg"
              variant="secondary"
              data-el="hero__cta-secondary"
              className="w-full tablet:w-auto"
            >
              Explore products
            </ButtonLink>
          </div>
        </div>

        {/* Slot for the dashboard mockup (Figma `hero__media` / `hero__dash`): skipped on purpose, added later with animation. */}
        <div data-el="hero__media" />
      </Container>
    </section>
  )
}
