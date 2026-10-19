import { useState } from 'react'
import { ColumnFade } from '../../ui/ColumnFade'
import { Container } from '../../ui/Container'
import { CornerDots } from '../../ui/CornerDots'
import { FaqItem } from './FaqItem'
import { DESIGN_OPEN_ID, faqItems } from './items'

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
export function Faq() {
  const [openId, setOpenId] = useState<string | null>(DESIGN_OPEN_ID)

  return (
    <section data-el="faq" aria-labelledby="faq-title" className="border-b border-border-subtle">
      <Container>
        <div
          data-el="faq__container"
          // The column lines are drawn inside (an inset shadow, like a Figma stroke), so they do not narrow the content.
          // px: the text must not touch the column lines (unlike the cards of other blocks, whose borders stand on the lines).
          className="relative flex flex-col gap-8 px-4 py-12 shadow-[inset_1px_0_0_var(--color-border-subtle),inset_-1px_0_0_var(--color-border-subtle)] tablet:gap-10 tablet:px-8 tablet:py-20 desktop:flex-row desktop:items-center desktop:gap-12 desktop:px-10 desktop:py-35"
        >
          <h2
            id="faq-title"
            data-el="faq__title"
            // 64 px type needs about 330 px for "questions?"; between 1280 and 1599 px the title column is narrower, so one step smaller there.
            className="type-heading-lg text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm desktop:type-heading-xl desktop:min-w-72.5 desktop:flex-1 desktop:px-px min-[100rem]:type-display-sm"
          >
            Still have questions?
          </h2>

          <ul data-el="faq__list" className="w-full desktop:w-226.5 desktop:min-w-175 desktop:shrink">
            {faqItems.map((item, index) => (
              <FaqItem
                key={item.id}
                item={item}
                isOpen={item.id === openId}
                isLast={index === faqItems.length - 1}
                onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
              />
            ))}
          </ul>

          {/* The end of the block: dots on the corners at the line. The block below (the call to action) is not built yet,
              so the column lines go on and fade out for now. */}
          <CornerDots edge="bottom" block="faq" />
          <ColumnFade edge="bottom" block="faq" />
        </div>
      </Container>
    </section>
  )
}
