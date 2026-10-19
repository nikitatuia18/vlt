import type { ComponentProps } from 'react'
import { iconButtonClasses, type IconButtonSize } from './iconButtonStyles'

type IconButtonProps = ComponentProps<'button'> & { size?: IconButtonSize }

/**
 * Round button for a single 24 px icon (theme toggle, menu toggle): md is 44 px, lg is 48 px.
 * Always give it an `aria-label`: there is no visible text.
 */
export function IconButton({ size = 'md', className = '', type = 'button', ...buttonProps }: IconButtonProps) {
  return <button type={type} className={`${iconButtonClasses(size)} ${className}`} {...buttonProps} />
}
