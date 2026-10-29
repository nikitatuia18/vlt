import bank from '../../assets/icons/benefits/bank.svg'
import card from '../../assets/icons/benefits/card.svg'
import chart from '../../assets/icons/benefits/chart.svg'
import shield from '../../assets/icons/benefits/shield.svg'
import swap from '../../assets/icons/swap.svg'
import user from '../../assets/icons/benefits/user.svg'
import { Container } from '../../components/ui/Container'
import { CornerDots } from '../../components/ui/CornerDots'
import { Icon } from '../../components/ui/Icon'
import { appear } from '../../motion/tokens'
import { Reveal, RevealLines } from '../../motion/reveal'
import { whatYouGetContent } from './content'

const icons = { swap, bank, card, shield, chart, user } as const

/**
 * "What you get": the eyebrow, a two-line heading and six plain cards (an icon in a circle on top, the name and a line at the bottom).
 * `crypto-processing__benefits`. Not in Figma (product pages are built in code); from the designer's reference image.
 * The cards are not links, so they do not answer the pointer. One column below the tablet width, two on a tablet, three from 1024 px.
 */
export function WhatYouGet() {
  return (
    <section data-el="crypto-processing__benefits" aria-labelledby="crypto-processing-benefits-title" className="border-b border-border-subtle">
      <Container>
        <div className="relative flex flex-col gap-8 py-12 column-lines tablet:gap-10 tablet:px-8 tablet:py-20 desktop:gap-12 desktop:px-10 desktop:py-25">
          <div data-el="crypto-processing__benefits-header" className="flex w-full flex-col items-center gap-3 text-center">
            <RevealLines
              as="p"
              data-el="crypto-processing__benefits-eyebrow"
              className="type-body-md text-typography-secondary tablet:type-body-lead"
              lines={[whatYouGetContent.eyebrow]}
            />
            <RevealLines
              id="crypto-processing-benefits-title"
              data-el="crypto-processing__benefits-title"
              className="type-heading-lg text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm"
              lines={whatYouGetContent.title}
            />
          </div>

          <ul data-el="crypto-processing__benefits-list" className="grid grid-cols-1 gap-4 tablet:grid-cols-2 tablet:gap-6 min-[64rem]:grid-cols-3">
            {whatYouGetContent.items.map((item, index) => (
              <li key={item.id} className="flex">
                <Reveal
                  variant="card"
                  delay={index * appear.card.step}
                  data-el={`crypto-processing__benefit-${item.id}`}
                  className="flex min-h-72 w-full flex-col justify-between gap-12 rounded-40 bg-surface-subtle p-6 ring-1 ring-inset ring-border-subtle tablet:p-8"
                >
                  <span
                    aria-hidden="true"
                    data-el={`crypto-processing__benefit-${item.id}-icon`}
                    className="inline-flex size-12 shrink-0 items-center justify-center rounded-pill bg-surface-page text-icon-primary ring-1 ring-inset ring-border-subtle"
                  >
                    <Icon src={icons[item.icon]} width={20} height={20} />
                  </span>
                  <div className="flex flex-col gap-2">
                    <RevealLines
                      as="h3"
                      delay={index * appear.card.step + 0.2}
                      data-el={`crypto-processing__benefit-${item.id}-title`}
                      className="type-heading-md text-typography-primary desktop:type-heading-lg"
                      lines={[item.title]}
                    />
                    <RevealLines
                      as="p"
                      delay={index * appear.card.step + 0.45}
                      data-el={`crypto-processing__benefit-${item.id}-text`}
                      className="type-body-md text-typography-secondary"
                      lines={[item.text]}
                    />
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>

          <CornerDots edge="top" block="crypto-processing-benefits" />
          <CornerDots edge="bottom" block="crypto-processing-benefits" />
        </div>
      </Container>
    </section>
  )
}
