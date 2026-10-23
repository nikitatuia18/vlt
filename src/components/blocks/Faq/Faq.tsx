import { useState } from 'react'
import { RevealLines } from '../../../motion/reveal'
import { Container } from '../../ui/Container'
import { CornerDots } from '../../ui/CornerDots'
import { FaqItem } from './FaqItem'
import { DESIGN_OPEN_ID, faqItems, type FaqItemData } from './items'

/**
 * "Still have questions?" Figma block `faq`.
 * Five questions, one answer open at a time (the one in the design is open at the start); a click on an open question closes it.
 *
 * From the design: section border at the bottom, column 1440 px with 40 px inside, vertical padding 140 px, gap 48 px,
 * the title on the left (min 290 px, 64 px type) and the list on the right (906 px, not narrower than 700), both centered
 * vertically; items with 32 px above and below and a line under each, question 32 px type, answer 20 px type up to 560 px wide.
 * Derived (not in the desktop frame): below 1280 px the title stands above the list; smaller paddings and type sizes
 * (the title is 40 px between 1280 and 1599 px, where its column is too narrow for 64 px); side padding on small screens.
 */
export type FaqProps = {
  /** Questions and answers in the order shown. Default: the ones of the home page. */
  items?: readonly FaqItemData[]
  /** The heading on the left. Default: the one of the design. */
  title?: string
  /** The answer that is open at the start (null: all closed). Default: the one of the design; falls back to the first item. */
  openId?: string | null
}

export function Faq({ items = faqItems, title = 'Still have questions?', openId: firstOpenId = DESIGN_OPEN_ID }: FaqProps = {}) {
  const [openId, setOpenId] = useState<string | null>(firstOpenId === null || items.some((item) => item.id === firstOpenId) ? firstOpenId : (items[0]?.id ?? null))

  return (
    <section data-el="faq" aria-labelledby="faq-title" className="border-b border-border-subtle">
      <Container>
        <div
          data-el="faq__container"
          // The column lines are drawn inside (an inset shadow, like a Figma stroke), so they do not narrow the content.
          // px: the text must not touch the column lines (unlike the cards of other blocks, whose borders stand on the lines).
          className="relative flex flex-col gap-8 py-12 column-lines tablet:gap-10 tablet:px-8 tablet:py-20 desktop:flex-row desktop:items-center desktop:gap-12 desktop:px-10 desktop:py-35"
        >
          <RevealLines
            id="faq-title"
            data-el="faq__title"
            // 64 px type needs about 330 px for "questions?"; between 1280 and 1599 px the title column is narrower, so one step smaller there.
            className="type-heading-lg text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm desktop:type-heading-xl desktop:min-w-72.5 desktop:flex-1 desktop:px-px min-[100rem]:type-display-sm"
            lines={[title]}
          />

          <ul data-el="faq__list" className="w-full desktop:w-226.5 desktop:min-w-175 desktop:shrink">
            {items.map((item, index) => (
              <FaqItem
                key={item.id}
                item={item}
                isOpen={item.id === openId}
                isLast={index === items.length - 1}
                index={index}
                onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
              />
            ))}
          </ul>

          {/* The end of the block: dots on the corners at the line; the column goes on in the call to action below without a break. */}
          <CornerDots edge="bottom" block="faq" />
        </div>
      </Container>
    </section>
  )
}
