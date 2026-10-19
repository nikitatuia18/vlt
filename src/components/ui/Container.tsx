import type { ComponentProps } from 'react'

/**
 * Page content column: up to 1440 px wide, centered, with the side padding `--gutter`
 * (16 / 32 / 80 px by breakpoint, see styles/tokens.css). Every block starts with it.
 */
export function Container({ className = '', ...divProps }: ComponentProps<'div'>) {
  return <div className={`mx-auto w-full max-w-page px-(--gutter) ${className}`} {...divProps} />
}
