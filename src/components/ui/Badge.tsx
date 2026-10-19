import type { ComponentProps } from 'react'
import clockIcon from '../../assets/icons/clock.svg'
import { Icon } from './Icon'

type BadgeProps = ComponentProps<'span'> & {
  /** Optional icon after the label. */
  icon?: 'clock'
}

/** Small pill label, for example "Coming soon". */
export function Badge({ icon, className = '', children, ...spanProps }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-pill bg-surface-subtle p-2 text-typography-primary ring-1 ring-inset ring-border-subtle ${className}`}
      {...spanProps}
    >
      <span className="type-ui-md px-1 whitespace-nowrap">{children}</span>
      {icon === 'clock' && (
        <span className="flex items-center p-0.5" aria-hidden="true">
          <Icon src={clockIcon} width={18.167} height={18.1671} />
        </span>
      )}
    </span>
  )
}
