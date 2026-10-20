import { useSpring } from 'motion/react'
import { useCallback, type PointerEvent } from 'react'

/**
 * Depth: a colored glow behind a card follows the pointer a little while the pointer is over the card (px at the edge of the card),
 * and comes back to the middle when it leaves. A soft spring, so the glow floats. Flip the sign of x or y to go against the pointer.
 */
export const GLOW_PARALLAX = { x: 28, y: 14, margin: 24 }
const SPRING = { stiffness: 70, damping: 18, mass: 1 }

/**
 * Returns the two motion values to put on the glow layers (`style={{ x, y }}` of a motion element) and the handlers:
 * `follow(event, card)` on pointer move (card = the rectangle the pointer must be over, or null for none) and `reset()`.
 * Mouse and pen only; `enabled: false` (reduced motion) keeps the glow still.
 */
export function useGlowParallax(enabled: boolean) {
  const x = useSpring(0, SPRING)
  const y = useSpring(0, SPRING)

  const reset = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  const follow = (event: PointerEvent, card: DOMRect | null | undefined) => {
    if (!enabled || event.pointerType === 'touch') return
    const { margin } = GLOW_PARALLAX
    const over =
      card &&
      event.clientX >= card.left - margin &&
      event.clientX <= card.right + margin &&
      event.clientY >= card.top - margin &&
      event.clientY <= card.bottom + margin
    if (!card || !over) return reset()
    const nx = Math.max(-1, Math.min(1, (event.clientX - (card.left + card.width / 2)) / (card.width / 2)))
    const ny = Math.max(-1, Math.min(1, (event.clientY - (card.top + card.height / 2)) / (card.height / 2)))
    x.set(nx * GLOW_PARALLAX.x)
    y.set(ny * GLOW_PARALLAX.y)
  }

  return { x, y, follow, reset }
}
