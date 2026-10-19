import type { ComponentProps } from 'react'

/**
 * Page content column: the content is up to 1440 px wide (`--container-page`), centered, with the side padding
 * `--gutter` (16 / 32 / 80 px by breakpoint, see styles/tokens.css) OUTSIDE of those 1440 px, as in the design
 * (column 1440 px inside 160 px of padding on the 2560 px frame). Every block starts with it.
 */
export function Container({ className = '', ...divProps }: ComponentProps<'div'>) {
  return (
    <div
      className={`mx-auto w-full max-w-[calc(var(--container-page)+2*var(--gutter))] px-(--gutter) ${className}`}
      {...divProps}
    />
  )
}
