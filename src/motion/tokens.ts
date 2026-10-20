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

/** The change of the theme (src/lib/themeCurtain.ts): the curtain covers the screen, the theme changes under it, the curtain goes on down. */
export const themeSwitch = {
  /** Seconds the curtain needs to cover the screen, and to open it again. */
  cover: 0.45,
  reveal: 0.5,
  easeCover: 'cubic-bezier(0.7, 0, 0.3, 1)',
  easeReveal: 'cubic-bezier(0.5, 0, 0.2, 1)',
  /** Height of the soft edges of the curtain, px (at most a third of the screen). */
  edge: 240,
  /** Frames to wait after the change, so that the page has recalculated its styles before the curtain opens. */
  settleFrames: 2,
} as const

/** The language of appearing (docs/reveal.motion.md): durations in seconds, steps between neighbours, distances in px. */
export const appear = {
  /** One line of a heading rises from under its mask. */
  line: { duration: 0.9, step: 0.09 },
  /** One word of a heading or a text rises from under its mask; the words follow one another (heading by words). */
  word: { duration: 0.85, step: 0.07, paragraphStep: 0.03 },
  /** While a word (or a line) is under its mask it is a little smaller, and grows to full size as it rises (origin: the lower left). */
  mask: { scaleFrom: 0.82 },
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
