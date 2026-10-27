import { useRef, type CSSProperties } from 'react'
import iconCard from '../../../assets/cta/icon-card.svg'
import iconGlobal from '../../../assets/cta/icon-global.svg'
import iconSecurity from '../../../assets/cta/icon-security.svg'
import person from '../../../assets/cta/img-cta-person.webp'
import { Reveal, RevealLines } from '../../../motion/reveal'
import { ButtonLink } from '../../ui/ButtonLink'
import { Container } from '../../ui/Container'
import { CornerDots } from '../../ui/CornerDots'
import { InteractiveDots } from '../../ui/InteractiveDots'
import { CtaBadge } from './CtaBadge'
import { useCtaScale } from './useCtaScale'

/**
 * "Tell us what you're building." Figma block `cta`.
 *
 * An orange banner with the text and the button on the left and a person on the right, who stands on the lower edge of the
 * banner and rises 96 px above its upper edge; three glass badges hang next to the person (the first one is behind the person,
 * the other two in front, as in the design). The picture with the badges is one "stage" drawn for the banner of the design
 * (1358 px) and scaled with it (`--s`, see useCtaScale).
 *
 * The background of the banner is the dot grid of the UI Kit (the static picture `img-cta-bg` of the design is a dot grid too),
 * light dots that fade out from the right with the same radial mask as in the design.
 *
 * From the design: section border at the bottom, column 1440 px with 40 px inside, vertical padding 140 px, banner radius 60 px
 * (a new token), padding 60 px, gap 48 px between the text and the button.
 * Derived (not in the desktop frame): below 1280 px the picture stands under the text inside the banner; smaller paddings and
 * type; the title is 72 px between 1280 and 1599 px (80 px with a 1358 px banner needs the full width of the design).
 */
export type CtaProps = {
  /** The heading. Default: the one of the design. */
  title?: string
  /** The line under the heading. Default: the one of the design. */
  subtitle?: string
}

export function Cta({ title = "Tell us what you're building.", subtitle = "We'll map your payment flow and show you how Velant can handle it." }: CtaProps = {}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const scale = useCtaScale(wrapRef)

  return (
    <section id="contact" data-el="cta" aria-labelledby="cta-title" className="border-b border-border-subtle">
      <Container>
        <div
          data-el="cta__container"
          // The column lines are drawn inside (an inset shadow, like a Figma stroke), so they do not narrow the content.
          className="relative py-12 column-lines tablet:px-8 tablet:py-20 desktop:px-10 desktop:py-35"
        >
          <div ref={wrapRef} data-el="cta__banner-wrap" className="relative" style={{ '--s': scale } as CSSProperties}>
            <Reveal
              variant="shutter"
              data-el="cta__banner"
              // Below 1280 px the bottom padding keeps room for the picture that stands under the text.
              className="relative overflow-clip rounded-40 bg-surface-brand-default desktop:rounded-60 p-6 max-desktop:pb-[calc(592px*var(--s)+24px)] tablet:p-10 tablet:max-desktop:pb-[calc(592px*var(--s)+40px)] desktop:p-15"
            >
              {/* Dot grid, a bit larger than the banner and cut by it, faded by a radial mask: strong at 71 % from the left. */}
              <div
                data-el="cta__bg"
                aria-hidden="true"
                className="pointer-events-none absolute top-[-13.6%] left-0 h-[134%] w-[106%] opacity-70 [mask-image:radial-gradient(ellipse_90.9%_180%_at_70.9%_51.8%,#000_0%,transparent_100%)]"
              >
                <InteractiveDots colorClass="text-icon-static-w" ripple={{ delay: 0.5, duration: 1.4, origin: [0.7, 0.5] }} />
              </div>

              <div data-el="cta__content" className="relative flex flex-col items-start gap-8 desktop:gap-12">
                <div data-el="cta__text-wrap" className="flex flex-col gap-4 text-typography-static-w desktop:w-150 desktop:gap-8">
                  <RevealLines
                    delay={0.55}
                    id="cta-title"
                    data-el="cta__title"
                    className="type-heading-xl tablet:type-display-sm desktop:type-display-lg min-[100rem]:type-display-xl"
                    lines={[title]}
                  />
                  <RevealLines
                    as="p"
                    delay={1}
                    data-el="cta__subtitle"
                    className="type-body-md max-w-107 tablet:type-body-lead desktop:type-heading-md"
                    lines={[subtitle]}
                  />
                </div>
                <Reveal variant="fade" delay={1.5}>
                  <ButtonLink href="#book-a-demo" variant="inverse" size="lg" icon="arrow" labelReveal={{ delay: 1.6 }} data-el="cta__cta-primary">
                    Book a demo
                  </ButtonLink>
                </Reveal>
              </div>
            </Reveal>

            {/* The picture and the badges: bottom edge on the lower edge of the banner, rising above its upper edge (wide screens). */}
            <div
              data-el="cta__stage"
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 h-[calc(592px*var(--s))] w-[calc(666px*var(--s))] max-desktop:left-1/2 max-desktop:-translate-x-1/2 desktop:right-[calc(59px*var(--s))]"
            >
              <CtaBadge id="payments" icon={iconCard} label="Pay-in / Pay-out" left={0} top={36} size={1} from={{ x: 270, y: 250 }} revealDelay={1} />
              <Reveal variant="rise" delay={0.7} data-el="img-cta-person" className="absolute top-0 left-[10.96%] h-full w-[76.1%] overflow-hidden">
                {/* The design shows the middle part of the picture: 150 % high, shifted up by 13.5 %. */}
                <img
                  src={person}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute top-[-13.51%] left-[-0.24%] h-[150%] w-[100.2%] max-w-none"
                />
              </Reveal>
              <CtaBadge id="multi-currency" icon={iconGlobal} label="Multi-currency" left={0} top={73.99} size={1.2137} from={{ x: 95, y: 440 }} revealDelay={1.2} />
              <CtaBadge id="kyb" icon={iconSecurity} label="Instant KYB" left={72.22} top={55.07} size={1.1696} from={{ x: 390, y: 330 }} revealDelay={1.4} />
            </div>
          </div>

          {/* The end of the block: dots on the corners at the line; the column goes on in the footer below without a break. The top continues the column of the FAQ. */}
          <CornerDots edge="bottom" block="cta" />
        </div>
      </Container>
    </section>
  )
}
