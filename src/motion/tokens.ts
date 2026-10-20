/*
 * Shared motion parameters (motion.dev). Blocks take their easing and durations from here
 * so that the whole page moves in one character. Values are starting points, tuned with the designer.
 */

/** Soft landing: fast start, long gentle end (ease-out quint-like). Used for things that open or appear. */
export const easeOut = [0.22, 1, 0.36, 1] as const

/** Durations in seconds. */
export const duration = {
  /** A card or a text block opening and closing. Slow and careful on purpose. */
  reveal: 0.7,
} as const

/**
 * Emergency switch of all appearance animations (docs/reveal.motion.md): `false` shows the whole site at once, as before.
 * Tests switch the appearance off with `localStorage['velant-reveal'] = 'off'` (see playwright.config.ts).
 */
export const REVEAL_ENABLED = true

/** The language of appearing (docs/reveal.motion.md): durations in seconds, steps between neighbours, distances in px. */
export const appear = {
  /** One line of a heading rises from under its mask. */
  line: { duration: 0.9, step: 0.09 },
  /** Text and buttons: rise, clear up from a light blur. */
  up: { duration: 0.8, y: 24, blur: 6 },
  /** Small things that come down into place (the parts of the header). */
  drop: { duration: 0.7, y: 14 },
  /** Cards: rise and grow a little. */
  card: { duration: 0.9, y: 48, scale: 0.96, step: 0.08 },
  /** A line draws itself. */
  draw: { duration: 1 },
  /** A dot pops (overshoots a little, then settles). */
  pop: { duration: 0.5 },
  /** A glass badge jumps out. */
  spring: { duration: 0.7 },
  /** The banner opens like a shutter. */
  shutter: { duration: 1.1 },
  /** A figure comes in from below (the person of the banner). */
  rise: { duration: 1, y: 60 },
} as const
