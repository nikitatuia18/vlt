import { motion, useReducedMotion } from 'motion/react'
import { duration, easeOut } from '../../../motion/tokens'

/**
 * Burger / close icon for the menu button: the three bars turn into a cross and back (the middle bar folds away,
 * the outer two meet in the centre and cross).
 * Not taken from Figma: the menu is not designed in the desktop frame.
 * Replace it with the icon from the mobile frame when that frame is processed.
 */
export function MenuToggleIcon({ isOpen }: { isOpen: boolean }) {
  const reduced = useReducedMotion()
  const transition = { duration: reduced ? 0 : duration.morph, ease: easeOut }
  const bar = { x1: 4, x2: 20, stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' } as const

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" data-open={isOpen} data-el="menu-toggle-icon">
      <motion.line {...bar} y1={7} y2={7} initial={false} animate={{ y: isOpen ? 5 : 0, rotate: isOpen ? 45 : 0 }} transition={transition} />
      <motion.line {...bar} y1={12} y2={12} initial={false} animate={{ opacity: isOpen ? 0 : 1, scaleX: isOpen ? 0 : 1 }} transition={transition} />
      <motion.line {...bar} y1={17} y2={17} initial={false} animate={{ y: isOpen ? -5 : 0, rotate: isOpen ? -45 : 0 }} transition={transition} />
    </svg>
  )
}
