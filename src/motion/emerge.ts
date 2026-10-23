import type { CSSProperties } from 'react'

/**
 * The path of `Reveal variant="emerge"`, for the element inside the revealed box (the box animates `--p` from 0 to 1).
 * (dx, dy) is where the element starts, in px of the drawing, counted from the place where it finally stands: it flies from there
 * to its place in a straight line and grows from nothing to its own size (so it is not seen before its turn). Done in CSS, so `--s` (the scale of the picture) is used as it is.
 * Without the animation `--p` is not set and the element simply stands in its place.
 */
export function emergeStyle(dx: number, dy: number): CSSProperties {
  return {
    translate: `calc(var(--s) * 1px * ${dx} * (1 - var(--p, 1))) calc(var(--s) * 1px * ${dy} * (1 - var(--p, 1)))`,
    scale: 'clamp(0, calc(var(--p, 1) * 2), 1)',
  } as CSSProperties
}
