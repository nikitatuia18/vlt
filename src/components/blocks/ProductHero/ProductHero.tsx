import type { ReactNode } from 'react'
import { Reveal, RevealLines } from '../../../motion/reveal'
import { ButtonLink } from '../../ui/ButtonLink'
import { Container } from '../../ui/Container'
import { InteractiveDots } from '../../ui/InteractiveDots'

export type ProductHeroProps = {
  /** Slug of the product: the `data-el` of the block is `{product}__hero`. */
  product: string
  /** The heading, one string per line. */
  title: readonly string[]
  subtitle: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  /** The scene inside the big card under the text (a micro interface of the product). Empty until it is made. */
  media?: ReactNode
  /** Extra classes of the card (for example another proportion on narrow screens). */
  mediaClassName?: string
}

/**
 * First screen of a product page: the same composition as the hero of the home page (centered text, two buttons, a big card),
 * with the text and the scene given by the page. The dots, the type steps and the card (1440 : 800, radius 48) are the ones of `Hero`.
 */
export function ProductHero({ product, title, subtitle, primaryCta, secondaryCta, media, mediaClassName = '' }: ProductHeroProps) {
  const el = (name: string) => `${product}__${name}`
  return (
    <section data-el={el('hero')} aria-labelledby={`${product}-title`} className="relative overflow-hidden">
      <div data-el={el('hero__bg')} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[-4.85%] h-[79.17%]">
        <InteractiveDots ripple={{ delay: 0.25, duration: 1.4, origin: [0.5, 0.3] }} />
        <div className="absolute inset-0 bg-linear-to-b from-surface-page/0 to-surface-page" />
      </div>

      <Container data-el={el('hero__content')} className="relative py-12 tablet:py-20 desktop:py-35">
        <div className="flex flex-col items-center gap-8 tablet:gap-12 desktop:px-10">
          <div className="flex flex-col items-center gap-4 text-center tablet:gap-6">
            <RevealLines
              as="h1"
              atLoad
              delay={0.35}
              id={`${product}-title`}
              data-el={el('hero__title')}
              className="type-heading-lg text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm desktop:type-display-xl"
              lines={[...title]}
            />
            <RevealLines
              as="p"
              atLoad
              delay={0.85}
              data-el={el('hero__subtitle')}
              className="type-body-md max-w-175 text-typography-secondary tablet:type-body-lead"
              lines={[subtitle]}
            />
          </div>

          <div className="flex w-full flex-col gap-4 tablet:w-auto tablet:flex-row">
            <Reveal variant="fade" atLoad delay={1.35} className="w-full tablet:w-auto">
              <ButtonLink
                href={primaryCta.href}
                size="lg"
                icon="export"
                labelReveal={{ atLoad: true, delay: 1.45 }}
                data-el={el('hero__cta-primary')}
                className="w-full tablet:w-auto"
              >
                {primaryCta.label}
              </ButtonLink>
            </Reveal>
            <Reveal variant="fade" atLoad delay={1.45} className="w-full tablet:w-auto">
              <ButtonLink
                href={secondaryCta.href}
                size="lg"
                variant="secondary"
                labelReveal={{ atLoad: true, delay: 1.55 }}
                data-el={el('hero__cta-secondary')}
                className="w-full tablet:w-auto"
              >
                {secondaryCta.label}
              </ButtonLink>
            </Reveal>
          </div>
        </div>

        <Reveal
          variant="card"
          atLoad
          delay={1.55}
          data-el={el('hero__media')}
          className={`mt-12 aspect-[1440/800] w-full overflow-hidden rounded-32 bg-surface-subtle ring-1 ring-inset ring-border-subtle tablet:mt-16 desktop:mt-20 desktop:rounded-48 ${mediaClassName}`}
        >
          {media}
        </Reveal>
      </Container>
    </section>
  )
}
