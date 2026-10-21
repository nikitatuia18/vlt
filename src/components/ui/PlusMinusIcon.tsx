import { motion, useReducedMotion } from 'motion/react'
import { duration, easeOut } from '../../motion/tokens'

/**
 * Plus that turns into a minus and back (the vertical bar lies down onto the horizontal one). 24 px, drawn in the current text
 * color. The bars are the same as in the Figma icons `icon-expand-button` / `icon-collapse-button` (11.5 px long, 1.5 px thick, round ends).
 */
export function PlusMinusIcon({ isMinus, className = '' }: { isMinus: boolean; className?: string }) {
  const reduced = useReducedMotion()
  const bar = { stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' } as const

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" data-minus={isMinus} className={className}>
      <line {...bar} x1={6.25} x2={17.75} y1={12} y2={12} />
      <motion.line
        {...bar}
        x1={12}
        x2={12}
        y1={6.25}
        y2={17.75}
        initial={false}
        animate={{ rotate: isMinus ? 90 : 0 }}
        transition={{ duration: reduced ? 0 : duration.morph, ease: easeOut }}
      />
    </svg>
  )
}
