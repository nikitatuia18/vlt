import { motion } from 'motion/react'
import { duration, easeOut } from '../../../motion/tokens'
import { ButtonLink } from '../../ui/ButtonLink'
import type { IndustryItemData } from './items'

type IndustryItemProps = {
  item: IndustryItemData
  isActive: boolean
  /** The list reads the position of the open item to keep it in view. */
  setRef: (element: HTMLLIElement | null) => void
}

/** Text steps like the headings of the page: mobile heading-lg, tablet heading-xl, from 1024 px display-sm (design). */
const titleClasses = 'type-heading-lg tablet:type-heading-xl min-[64rem]:type-display-sm text-balance'

/**
 * One line of the list. Figma `industries__item-{id}`.
 * Closed: a grey title. Open: the title turns dark and the line becomes a white card (radius 32, border,
 * padding 60 x 40 on desktop), and the description and the button unfold under the title.
 * Card and colors change with CSS (700 ms), the unfolding with motion.
 */
export function IndustryItem({ item, isActive, setRef }: IndustryItemProps) {
  const { id, title, description, cta } = item

  return (
    <li ref={setRef} data-el={`industries__item-${id}`} data-active={isActive} className="flex justify-center">
      <div
        data-el={`industries__item-${id}-inner`}
        className={`flex flex-col items-center rounded-32 text-center ring-1 ring-inset transition-[background-color,box-shadow,padding] duration-700 ease-out ${
          isActive
            ? 'bg-surface-subtle px-6 py-6 ring-border-subtle tablet:px-10 tablet:py-8 desktop:px-15 desktop:py-10'
            : 'bg-transparent px-0 py-0 ring-transparent'
        }`}
      >
        <h3
          data-el={`industries__item-${id}-title`}
          className={`${titleClasses} transition-colors duration-700 desktop:whitespace-nowrap ${
            isActive ? 'text-typography-primary' : 'text-typography-tertiary'
          }`}
        >
          {title}
        </h3>

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
            <p
              data-el={`industries__item-${id}-desc`}
              className="type-body-md max-w-142.5 text-typography-secondary tablet:type-body-lead"
            >
              {description.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <ButtonLink
              href={cta.href}
              size="lg"
              icon="export"
              data-el={`industries__item-${id}-cta`}
              tabIndex={isActive ? undefined : -1}
            >
              {cta.label}
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    </li>
  )
}
