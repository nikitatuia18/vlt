import { Reveal, RevealLines } from '../../../motion/reveal'
import { ButtonLink } from '../../ui/ButtonLink'
import { Container } from '../../ui/Container'
import { InteractiveDots } from '../../ui/InteractiveDots'

/**
 * First screen. Figma block `hero`.
 * `hero__media` is the white rounded card from the design. The dashboard mockup (`hero__dash`) is intentionally
 * not built yet: it will come with its animation, so the card is an empty placeholder for now.
 *
 * Sizes marked "derived" are not in the desktop frame; check them against the mobile frame later.
 */
export function Hero() {
  return (
    <section data-el="hero" aria-labelledby="hero-title" className="relative overflow-hidden">
      {/*
        Background: the static picture `img-hero-bg` of the design is replaced by the interactive dot grid (UI Kit).
        As in the design, a gradient in the page color lies over the dots: fully transparent at the top, solid at the bottom,
        so the dots fade out. Geometry from the design (frame 1273 px high, starting 78 px above the section, section 1608 px)
        in percent of the section height, so it scales with the section: top -4.85 %, height 79.17 %. Below it the page is plain.
      */}
      <div data-el="hero__bg" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[-4.85%] h-[79.17%]">
        {/* The dots appear as a ripple from the upper middle (docs/reveal.motion.md). */}
        <InteractiveDots ripple={{ delay: 0.25, duration: 1.4, origin: [0.5, 0.3] }} />
        <div data-el="hero__bg-fade" className="absolute inset-0 bg-linear-to-b from-surface-page/0 to-surface-page" />
      </div>

      <Container data-el="hero__content" className="relative py-12 tablet:py-20 desktop:py-35">
        <div data-el="hero__intro" className="flex flex-col items-center gap-8 tablet:gap-12 desktop:px-10">
          <div data-el="hero__text-wrap" className="flex flex-col items-center gap-4 text-center tablet:gap-6">
            {/* Title steps: mobile heading-lg, tablet heading-xl, from 1024 px display-sm, desktop display-xl (derived except desktop). */}
            <RevealLines
              as="h1"
              atLoad
              delay={0.35}
              id="hero-title"
              data-el="hero__title"
              className="type-heading-lg text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm desktop:type-display-xl"
              lines={['Banking for today.', 'Clients pay their way.', 'You settle yours.']}
            />
            <Reveal
              as="p"
              atLoad
              delay={0.85}
              data-el="hero__subtitle"
              className="type-body-md max-w-175 text-typography-secondary tablet:type-body-lead"
            >
              One API for payments, crypto, payouts and financial operations — built for companies moving money across
              borders.
            </Reveal>
          </div>

          <div data-el="hero__actions" className="flex w-full flex-col gap-4 tablet:w-auto tablet:flex-row">
            <Reveal atLoad delay={1} className="w-full tablet:w-auto">
              <ButtonLink
                href="#book-a-demo"
                size="lg"
                icon="export"
                data-el="hero__cta-primary"
                className="w-full tablet:w-auto"
              >
                Book a demo
              </ButtonLink>
            </Reveal>
            <Reveal atLoad delay={1.1} className="w-full tablet:w-auto">
              <ButtonLink
                href="#products"
                size="lg"
                variant="secondary"
                data-el="hero__cta-secondary"
                className="w-full tablet:w-auto"
              >
                Explore products
              </ButtonLink>
            </Reveal>
          </div>
        </div>

        {/*
          Hero Media: 1440 x 800 card, radius 48, fill surface-subtle, 1 px inside border border-subtle, clips its content.
          The proportion 1440 : 800 is kept at every width, so the whole composition scales with the column.
          Gap above (80 on desktop) and radius 32 below desktop are derived. Nothing goes inside until the mockup comes.
        */}
        <Reveal
          variant="card"
          atLoad
          delay={1.2}
          data-el="hero__media"
          className="mt-12 aspect-[1440/800] w-full overflow-hidden rounded-32 bg-surface-subtle ring-1 ring-inset ring-border-subtle tablet:mt-16 desktop:mt-20 desktop:rounded-48"
        />
      </Container>
    </section>
  )
}
