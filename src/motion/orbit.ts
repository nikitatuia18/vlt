import type { CSSProperties } from 'react'
import { appear } from './tokens'

/**
 * The path of `Reveal variant="orbit"`, for the element inside the revealed box (the box animates `--p` from 0 to 1).
 * (dx, dy) is where the element finally stands, in px of the drawing, counted from the centre it swirls around.
 * The vector to the final place starts turned back by `sweep` degrees and a bit longer, and winds in to (dx, dy) along a flattened
 * circle; the element grows from nothing while it flies. Done in CSS (sin / cos), so `--s` (the scale of the picture) is used as it is.
 * Without the animation `--p` is not set and the element simply stands in its place.
 */
export function orbitStyle(dx: number, dy: number): CSSProperties {
  const { sweep, swing, flatten } = appear.orbit
  const turn = `(1 - var(--p, 1))`
  // The vector on the round (not flattened) orbit: it is turned, then squeezed back to the real height.
  const ux = dx
  const uy = dy / flatten
  const k = `var(--orbit-k)`
  const cos = `cos(var(--orbit-a))`
  const sin = `sin(var(--orbit-a))`
  return {
    '--orbit-a': `calc(${turn} * ${sweep}deg)`,
    '--orbit-k': `calc(1 + ${turn} * ${swing - 1})`,
    translate: `calc(var(--s) * 1px * (${k} * (${ux} * ${cos} - ${uy} * ${sin}) - ${dx})) calc(var(--s) * 1px * (${flatten} * ${k} * (${ux} * ${sin} + ${uy} * ${cos}) - ${dy}))`,
    scale: 'clamp(0, calc(var(--p, 1) * 4), 1)',
  } as CSSProperties
}
