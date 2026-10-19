export type IconButtonSize = 'md' | 'lg'

/** md: 44 px (theme toggle, menu toggle). lg: 48 px (card links). Both hold a 24 px icon. */
const sizeClasses: Record<IconButtonSize, string> = { md: 'size-11', lg: 'size-12' }

/** Look shared by IconButton (`<button>`) and IconLink (`<a>`). */
export const iconButtonClasses = (size: IconButtonSize) =>
  `inline-flex ${sizeClasses[size]} items-center justify-center rounded-pill bg-surface-subtle text-icon-primary ` +
  'ring-1 ring-inset ring-border-subtle transition-colors hover:bg-surface-hover ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand'
