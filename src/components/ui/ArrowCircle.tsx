import arrowUpRight from '../../assets/icons/arrow-up-right.svg'
import { Icon } from './Icon'

type ArrowCircleProps = {
  className?: string
  /** Classes of the arrow itself (the way it answers the hover of the card). */
  arrowClassName?: string
  'data-el'?: string
}

/**
 * The round "go there" mark of a clickable card: a thin arrow up and to the right in a white circle.
 * It only looks like the round icon button of the UI Kit: it is a plain box, because the whole card is the link and a link cannot hold a link.
 * The circle keeps its own color while the card turns grey under the pointer, so it stands out on it.
 * Put it inside a `.group` card; the arrow answers the hover of the card (`data-el` is set by the card: `{block}__card-{id}-arrow`).
 * The circle clips what moves in it, so an arrow that leaves the circle does not show outside.
 */
export function ArrowCircle({ className = '', arrowClassName = '', ...rest }: ArrowCircleProps) {
  return (
    <span
      aria-hidden="true"
      {...rest}
      className={`inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-pill bg-surface-subtle text-icon-primary ring-1 ring-inset ring-border-subtle ${className}`}
    >
      <Icon src={arrowUpRight} width={24} height={24} className={arrowClassName} />
    </span>
  )
}
