import type { ComponentProps } from 'react'
import { iconButtonClasses, type IconButtonSize } from './iconButtonStyles'

type IconLinkProps = ComponentProps<'a'> & { size?: IconButtonSize }

/**
 * Round link for a single 24 px icon, looks like IconButton (for example the arrow link in a card).
 * Always give it an `aria-label`: there is no visible text.
 */
export function IconLink({ size = 'md', className = '', ...anchorProps }: IconLinkProps) {
  // The icon comes in as `children` through the spread props, and the aria-label is required (see above).
  // oxlint-disable-next-line jsx-a11y/anchor-has-content
  return <a className={`${iconButtonClasses(size)} ${className}`} {...anchorProps} />
}
