import type { ComponentProps } from 'react'
import clockIcon from '../../assets/icons/clock.svg'
import { RevealLines, type TextReveal } from '../../motion/reveal'
import { Icon } from './Icon'

type BadgeProps = ComponentProps<'span'> & {
  /** Optional icon after the label. */
  icon?: 'clock'
  /** `sm`: a smaller pill for a label inside a list or a menu (padding 4 px, the caption size of the UI). */
  size?: 'md' | 'sm'
  /** How the label appears (it rises word by word). Default: when the badge comes into view. */
  labelReveal?: TextReveal
}

/** Small pill label, for example "Coming soon". */
export function Badge({ icon, size = 'md', labelReveal, className = '', children, ...spanProps }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-pill bg-surface-subtle ${size === 'sm' ? 'p-1' : 'p-2'} text-typography-primary ring-1 ring-inset ring-border-subtle ${className}`}
      {...spanProps}
    >
      <span className={`${size === 'sm' ? 'type-ui-xs' : 'type-ui-md'} px-1 whitespace-nowrap`}>
        {typeof children === 'string' ? <RevealLines as="span" lines={[children]} {...labelReveal} /> : children}
      </span>
      {icon === 'clock' && (
        <span className="flex items-center p-0.5" aria-hidden="true">
          <Icon src={clockIcon} width={18.167} height={18.1671} />
        </span>
      )}
    </span>
  )
}
