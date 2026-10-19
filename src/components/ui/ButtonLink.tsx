import type { ComponentProps, ReactNode } from 'react'

type ButtonLinkVariant = 'primary' | 'secondary'

type ButtonLinkProps = Omit<ComponentProps<'a'>, 'children'> & {
  variant?: ButtonLinkVariant
  /** Optional icon shown after the label. */
  icon?: ReactNode
  children: ReactNode
}

const baseClasses =
  'inline-flex items-center justify-center rounded-pill p-3 type-ui-sm whitespace-nowrap ' +
  'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand'

const variantClasses: Record<ButtonLinkVariant, string> = {
  primary:
    'bg-surface-brand-default text-typography-static-w hover:bg-surface-brand-hover active:bg-surface-brand-active',
  secondary:
    'bg-surface-subtle text-typography-primary ring-1 ring-inset ring-border-subtle hover:bg-surface-hover',
}

/** Pill-shaped call-to-action rendered as a link (`<a>`). */
export function ButtonLink({ variant = 'primary', icon, children, className = '', ...anchorProps }: ButtonLinkProps) {
  return (
    <a className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...anchorProps}>
      <span className="px-1">{children}</span>
      {icon}
    </a>
  )
}
