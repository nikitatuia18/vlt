import type { ComponentProps } from 'react'

/**
 * Round 44 px button for a single 24 px icon (theme toggle, menu toggle).
 * Always give it an `aria-label`: there is no visible text.
 */
export function IconButton({ className = '', type = 'button', ...buttonProps }: ComponentProps<'button'>) {
  return (
    <button
      type={type}
      className={
        'inline-flex size-11 items-center justify-center rounded-pill bg-surface-subtle text-icon-primary ' +
        'ring-1 ring-inset ring-border-subtle transition-colors hover:bg-surface-hover ' +
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand ' +
        className
      }
      {...buttonProps}
    />
  )
}
