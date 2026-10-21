import { Reveal, RevealLines } from '../../../motion/reveal'
import { PlusMinusIcon } from '../../ui/PlusMinusIcon'
import type { FaqItemData } from './items'

type FaqItemProps = {
  item: FaqItemData
  isOpen: boolean
  onToggle: () => void
  /** The last item has no line under it. */
  isLast: boolean
  /** Place in the list: the questions appear one after another. */
  index: number
}

/**
 * One question. Figma `faq__item-{id}` (`--open` / `--closed`).
 * The whole line with the question is one button (the design draws only the round toggle, but the question is the natural
 * target); the round toggle shows plus or minus and turns one into the other. The answer unfolds under it: the row grows from 0 to its height while the text
 * keeps its width (max 560 px), so it never re-wraps and does not jump; it fades in a little later.
 */
export function FaqItem({ item, isOpen, onToggle, isLast, index }: FaqItemProps) {
  const { id, question, lead, answer } = item
  const panelId = `faq-panel-${id}`

  return (
    <Reveal
      as="li"
      variant="card"
      delay={index * 0.1}
      data-el={`faq__item-${id}`}
      data-open={isOpen}
      className="relative py-6 tablet:py-8"
    >
      {/* The line under the question draws itself from the left (it was a border). */}
      {isLast ? null : (
        <Reveal variant="line-x" delay={0.5 + index * 0.1} aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px origin-left bg-border-subtle" />
      )}
      <h3>
        <button
          type="button"
          id={`faq-heading-${id}`}
          data-el={`faq__item-${id}-head`}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="group flex w-full items-start justify-between gap-6 rounded-32 text-left focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-typography-brand"
        >
          <RevealLines
            as="span"
            delay={0.15 + index * 0.1}
            data-el={`faq__item-${id}-question`}
            className="type-heading-sm max-w-140 text-typography-primary tablet:type-heading-md desktop:type-heading-lg"
            lines={[question]}
          />
          {/* Looks like the round icon button of the UI Kit; it is the same shape, but a plain box, because a button cannot hold a button. */}
          <span
            data-el={`faq__item-${id}-toggle`}
            aria-hidden="true"
            className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-pill bg-surface-subtle text-icon-primary ring-1 ring-border-subtle ring-inset transition-colors group-hover:bg-surface-hover"
          >
            {/* The plus turns into the minus and back (the vertical bar lies down); the picture is the Figma icons redrawn as two bars. */}
            <PlusMinusIcon isMinus={isOpen} />
          </span>
        </button>
      </h3>

      {/* Folded to nothing while closed (grid row 0fr to 1fr). The button names the panel through aria-controls; no region role (five landmarks would clutter the page). */}
      <div
        id={panelId}
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`grid transition-[grid-template-rows] duration-700 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="min-h-0 overflow-hidden">
          {/* The words rise from their masks each time the question is opened (the lead of the answer is in the stronger color). */}
          <RevealLines
            as="p"
            open={isOpen}
            delay={0.2}
            data-el={`faq__item-${id}-answer`}
            className={`type-body-md max-w-140 pt-4 text-typography-secondary transition-opacity ease-out tablet:type-body-lead ${
              isOpen ? 'opacity-100 delay-200 duration-500' : 'opacity-0 duration-200'
            }`}
            lines={[lead ? [{ text: lead, className: 'text-typography-primary' }, { text: answer }] : [{ text: answer }]]}
          />
        </div>
      </div>
    </Reveal>
  )
}
