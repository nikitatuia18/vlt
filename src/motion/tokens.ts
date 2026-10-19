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
