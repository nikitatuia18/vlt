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
  const { id, title, description, glow, flow } = item

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
            // On a phone the two phrases flow as one text (a card with a scenario shows only the first phrase here, the second is the pill).
            joinBelowTablet={!flow}
            data-el={`industries__item-${id}-desc`}
            className="type-body-md max-w-142.5 text-typography-secondary tablet:type-body-lead"
            lines={flow ? description.slice(0, 1) : description}
          />
          {flow && (
            <>
              <span
                data-el={`industries__item-${id}-benefit`}
                className="-mt-4 inline-flex items-center gap-1 rounded-pill bg-surface-success-secondary px-3 py-1 text-typography-success"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0">
                  <path d="M2.5 7.4l2.9 2.9 6.1-6.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <RevealLines as="span" open={isActive} delay={0.35} className="type-ui-xs" lines={description.slice(1)} />
              </span>
              <div data-el={`industries__item-${id}-flow`} className="flex w-full flex-col gap-2 text-left">
                <RevealLines as="p" open={isActive} delay={0.4} className="type-ui-caps text-typography-tertiary" lines={[flow.label]} />
                <ol className="flex flex-col">
                  {flow.steps.map((step, stepIndex) => (
                    <li key={step} className="flex items-center gap-4 border-t border-border-subtle py-3">
                      <span data-el={`industries__item-${id}-step-${stepIndex + 1}-number`} className="type-ui-md w-8 shrink-0 text-typography-brand tabular-nums">{String(stepIndex + 1).padStart(2, '0')}</span>
                      <RevealLines as="span" open={isActive} delay={0.45 + stepIndex * 0.08} className="type-body-md text-typography-primary" lines={[step]} />
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}
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
