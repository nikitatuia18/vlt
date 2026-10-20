import type { ComponentProps, ReactNode } from 'react'
import exportIconSrc from '../../assets/icons/export.svg'
import { RevealLines, type TextReveal } from '../../motion/reveal'
import { Icon } from './Icon'

export type ButtonLinkVariant = 'primary' | 'secondary' | 'inverse'
export type ButtonLinkSize = 'md' | 'lg'
export type ButtonLinkIcon = 'export'

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
  'inline-flex items-center justify-center rounded-pill whitespace-nowrap transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand'

const sizeClasses: Record<ButtonLinkSize, string> = {
  md: 'p-3 type-ui-sm',
  lg: 'gap-1 p-4 type-ui-md',
}

const variantClasses: Record<ButtonLinkVariant, string> = {
  primary:
    'bg-surface-brand-default text-typography-static-w hover:bg-surface-brand-hover active:bg-surface-brand-active',
  secondary:
    'bg-surface-subtle text-typography-primary ring-1 ring-inset ring-border-subtle hover:bg-surface-hover',
  // White in both themes (static colors): for a button on a brand-colored banner.
  inverse: 'bg-surface-static-w text-typography-static-b hover:bg-surface-static-w/90',
}

// Icon slot (px) per button size, and the glyph size inside the slot as drawn in Figma (insets 4.58% / 5.21%).
const iconSlot: Record<ButtonLinkSize, 20 | 24> = { md: 20, lg: 24 }
const exportGlyph = { 20: 18.1671, 24: 21.5 } as const

function ButtonIcon({ name, size }: { name: ButtonLinkIcon; size: ButtonLinkSize }) {
  const slot = iconSlot[size]
  const glyph = exportGlyph[slot]
  // Only one icon exists so far; add new ones to this switch together with their sizes.
  if (name === 'export') {
    return (
      <span className="grid place-items-center" style={{ width: slot, height: slot }}>
        <Icon src={exportIconSrc} width={glyph} height={glyph} />
      </span>
    )
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
