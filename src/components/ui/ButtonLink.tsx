import type { ComponentProps, ReactNode } from 'react'
import arrowUpRight from '../../assets/icons/arrow-up-right.svg'
import { RevealLines, type TextReveal } from '../../motion/reveal'
import { Icon } from './Icon'

export type ButtonLinkVariant = 'primary' | 'dark' | 'secondary' | 'inverse'
export type ButtonLinkSize = 'md' | 'lg'
export type ButtonLinkIcon = 'arrow'

type ButtonLinkProps = Omit<ComponentProps<'a'>, 'children'> & {
  variant?: ButtonLinkVariant
  /** md: 44 px high (header). lg: 56 px high (hero and page sections). */
  size?: ButtonLinkSize
  /** Optional icon shown after the label. */
  icon?: ButtonLinkIcon
  /** How the label appears (a text label always rises word by word): when, the delay. Default: when the button comes into view. */
  labelReveal?: TextReveal
  children: ReactNode
}

const baseClasses =
  'group inline-flex items-center justify-center rounded-pill whitespace-nowrap interactive ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand'

const sizeClasses: Record<ButtonLinkSize, string> = {
  md: 'p-3 type-ui-sm',
  lg: 'gap-1 p-4 type-ui-md',
}

const variantClasses: Record<ButtonLinkVariant, string> = {
  primary:
    'bg-surface-brand-default text-typography-static-w hover:bg-surface-brand-hover active:bg-surface-brand-active',
  // The accent of the page body: the orange primary is kept for the header only.
  dark: 'bg-surface-inverse text-typography-inverse hover:bg-surface-inverse/90 active:bg-surface-inverse/80',
  secondary:
    'bg-surface-subtle text-typography-primary ring-1 ring-inset ring-border-subtle hover:bg-surface-hover',
  // White in both themes (static colors): for a button on a brand-colored banner.
  inverse: 'bg-surface-static-w text-typography-static-b hover:bg-surface-static-w/90 active:bg-surface-static-w/80',
}

// Icon slot (px) per button size; the arrow is drawn on a 24 px grid and scaled to the slot.
const iconSlot: Record<ButtonLinkSize, 20 | 24> = { md: 20, lg: 24 }

function ButtonIcon({ name, size }: { name: ButtonLinkIcon; size: ButtonLinkSize }) {
  const slot = iconSlot[size]
  // Only one icon exists so far; add new ones to this switch together with their sizes.
  if (name === 'arrow') {
    // The same arrow as on the cards; the button is a `.group`, so the arrow nudges up and to the right on hover.
    return <Icon src={arrowUpRight} width={slot} height={slot} className="interactive-nudge" />
  }
  return null
}

/** Pill-shaped call-to-action rendered as a link (`<a>`). */
export function ButtonLink({
  variant = 'primary',
  size = 'md',
  icon,
  labelReveal,
  children,
  className = '',
  ...anchorProps
}: ButtonLinkProps) {
  return (
    <a className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} {...anchorProps}>
      <span className="px-1">
        {typeof children === 'string' ? <RevealLines as="span" lines={[children]} {...labelReveal} /> : children}
      </span>
      {icon && <ButtonIcon name={icon} size={size} />}
    </a>
  )
}
