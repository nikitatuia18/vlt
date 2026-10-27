import { motion } from 'motion/react'
import { memo } from 'react'
import { RevealLines } from '../../../motion/reveal'
import { duration, easeOut } from '../../../motion/tokens'
import type { IndustryItemData } from './items'

type IndustryItemProps = {
  item: IndustryItemData
  isActive: boolean
  /** Place in the list: the neighbours appear with a small step. */
  index: number
  /** The list reads the position of the open item to keep it in view. Must be a stable function (see `memo` below). */
  registerRef: (index: number, element: HTMLLIElement | null) => void
  /** Only with reduced motion (the scroll opens nothing then): the closed item becomes a button that opens it. Must be stable. */
  onPick?: (index: number) => void
}

/** Text steps like the headings of the page: mobile heading-lg, tablet heading-xl, from 1024 px display-sm (design). */
const titleClasses = 'type-heading-lg tablet:type-heading-xl min-[64rem]:type-display-sm text-balance'

/**
 * One line of the list. Figma `industries__item-{id}`.
 * Closed: a grey title. Open: the title turns dark and the line becomes a white card (radius 32, border,
 * padding 60 x 40 on desktop), and the description unfolds under the title.
 * Card and colors change with CSS (700 ms), the unfolding with motion.
 */
export const IndustryItem = memo(function IndustryItem({ item, isActive, index, registerRef, onPick }: IndustryItemProps) {
  const { id, title, description, glow } = item

  // The box of the card. Open: padding and a fill (a white card; in a dark scene a faint see-through one, the glow shows through); closed: nothing.
  const boxClasses = `flex flex-col items-center rounded-32 text-center ring-1 ring-inset transition-[background-color,box-shadow,padding] duration-700 ease-out ${
    isActive
      ? `px-6 py-6 ring-border-subtle tablet:px-10 tablet:py-8 desktop:px-15 desktop:py-10 ${glow ? 'bg-surface-white-16' : 'bg-surface-subtle'}`
      : 'bg-transparent px-0 py-0 ring-transparent'
  }`

  const content = (
    <>
      <RevealLines
        as="h3"
        delay={index * 0.06}
        data-el={`industries__item-${id}-title`}
        className={`${titleClasses} transition-colors duration-400 ease-out desktop:whitespace-nowrap ${
          isActive ? 'text-typography-primary' : 'text-typography-tertiary'
        }`}
        lines={[title]}
      />

      {/* Always in the page (screen readers and search see the text), but folded and not focusable while the item is closed. */}
      <motion.div
        data-el={`industries__item-${id}-details`}
        initial={false}
        animate={{ height: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
        transition={{ duration: duration.reveal, ease: easeOut }}
        aria-hidden={!isActive}
        inert={!isActive}
        className="overflow-hidden"
      >
        <div className="flex flex-col items-center gap-8 pt-4">
          {/* The words rise from their masks each time the card opens. */}
          <RevealLines
            as="p"
            open={isActive}
            delay={0.25}
            // On a phone the two phrases flow as one text.
            joinBelowTablet
            data-el={`industries__item-${id}-desc`}
            className="type-body-md max-w-142.5 text-typography-secondary tablet:type-body-lead"
            lines={description}
          />
        </div>
      </motion.div>
    </>
  )

  return (
    <li
      ref={(element) => registerRef(index, element)}
      data-el={`industries__item-${id}`}
      data-active={isActive}
      className="flex justify-center"
    >
      <div data-el={`industries__item-${id}-inner`} className={`${boxClasses} relative`}>
        {content}
        {onPick && !isActive && (
          // A button over the whole closed item (the open one needs none).
          <button
            type="button"
            data-el={`industries__item-${id}-open`}
            aria-label={title}
            aria-expanded={false}
            onClick={() => onPick(index)}
            className="absolute -inset-x-4 -inset-y-2 rounded-32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-typography-brand focus-visible:ring-inset"
          />
        )}
      </div>
    </li>
  )
})
