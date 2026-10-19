import type { ComponentProps } from 'react'
import { iconButtonClasses, type IconButtonSize } from './iconButtonStyles'

type IconLinkProps = ComponentProps<'a'> & { size?: IconButtonSize }

/**
 * Round link for a single 24 px icon, looks like IconButton (for example the arrow link in a card).
 * Always give it an `aria-label`: there is no visible text.
 */
export function IconLink({ size = 'md', className = '', ...anchorProps }: IconLinkProps) {
  return <a className={`${iconButtonClasses(size)} ${className}`} {...anchorProps} />
}
