import arrowUpRight from '../../assets/icons/arrow-up-right.svg'
import { Icon } from './Icon'

type ArrowCircleProps = {
  className?: string
  'data-el'?: string
}

/**
 * The round "go there" mark of a clickable card: a thin arrow up and to the right in a white circle.
 * It only looks like the round icon button of the UI Kit: it is a plain box, because the whole card is the link and a link cannot hold a link.
 * The circle keeps its own color while the card turns grey under the pointer, so it stands out on it, and the arrow gives a short push
 * up and to the right (`interactive-nudge`). Put it inside a `.group` card; the card sets `data-el` (`{block}__card-{id}-arrow`).
 */
export function ArrowCircle({ className = '', ...rest }: ArrowCircleProps) {
  return (
    <span
      aria-hidden="true"
      {...rest}
      className={`inline-flex size-12 shrink-0 items-center justify-center rounded-pill bg-surface-subtle text-icon-primary ring-1 ring-inset ring-border-subtle ${className}`}
    >
      <Icon src={arrowUpRight} width={24} height={24} className="interactive-nudge" />
    </span>
  )
}
