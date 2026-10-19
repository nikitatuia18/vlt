/*
 * Animation of the map, as exported from Figma Motion (`get_motion_context`, cohort "1110:8484", 11.18 s, loop).
 * One shared timeline: the routes draw themselves, the cards (pins) appear one after another and fade out.
 * `times` are fractions of DURATION; `ease` has one entry per segment (cubic-bezier or a named easing).
 */

export const DURATION = 11.18

type CubicBezier = [number, number, number, number]
type Ease = 'linear' | 'easeOut' | 'easeInOut' | CubicBezier

/** The soft S-curve that Figma uses between most keyframes. */
const soft: CubicBezier = [0.5, 0, 0.5, 1]

export type OpacityTrack = { values: number[]; times: number[]; ease: Ease[] }

/** Draw-on of a route: dash length 0 → 1 of the normalized path, optionally with an offset (drawing from the other end). */
export type DashTrack = { dasharray: string[]; offset?: number[]; times: number[]; ease: Ease[]; initialOffset: number }

export type RouteTimeline = { opacity: OpacityTrack; dash?: DashTrack }

const drawn = ['0 1', '0 1', '1 1', '1 1']
const fadeOut = (times: number[], ease: Ease[]): OpacityTrack => ({ values: [1, 1, 0, 0], times, ease })

/** Routes 5, 6 and 7 are not drawn in Figma: they are always there (opacity only). */
const alwaysThere: RouteTimeline = {
  opacity: { values: [1, 1, 0], times: [0, 0.9999, 1], ease: ['linear', soft] },
}

export const routeTimelines: Record<number, RouteTimeline> = {
  1: {
    opacity: fadeOut([0, 0.6193, 0.6616, 1], ['linear', soft, 'linear']),
    dash: { dasharray: drawn, times: [0, 0.456, 0.617, 1], ease: [soft, 'easeInOut', [0.509, 0, 0.744, 0.52]], initialOffset: 0 },
  },
  2: {
    opacity: fadeOut([0, 0.4122, 0.4566, 1], ['linear', soft, 'linear']),
    dash: {
      dasharray: drawn,
      offset: [-1, -1, 0, 0],
      times: [0, 0.25, 0.411, 1],
      ease: [soft, 'easeInOut', [0.53, 0, 0.704, 0.603]],
      initialOffset: -1,
    },
  },
  3: {
    opacity: fadeOut([0, 0.2093, 0.2515, 1], [soft, soft, 'linear']),
    dash: { dasharray: drawn, times: [0, 0.045, 0.206, 1], ease: [soft, 'easeInOut', [0.533, 0, 0.669, 0.663]], initialOffset: 0 },
  },
  4: {
    opacity: fadeOut([0, 0.9998, 0.9999, 1], ['linear', soft, 'linear']),
    dash: {
      dasharray: ['0 1', '0 1', '0.9359 1'],
      offset: [-1, -1, -0.0641],
      times: [0, 0.868, 1],
      ease: [soft, [0.432, 0, 0.638, 0.764]],
      initialOffset: -1,
    },
  },
  5: alwaysThere,
  6: alwaysThere,
  7: alwaysThere,
  8: {
    opacity: fadeOut([0, 0.8223, 0.8688, 1], ['linear', soft, 'linear']),
    dash: {
      dasharray: drawn,
      offset: [-1, -1, 0, 0],
      times: [0, 0.662, 0.823, 1],
      ease: [soft, 'easeInOut', [0.438, 0, 0.746, 0.416]],
      initialOffset: -1,
    },
  },
  9: {
    opacity: fadeOut([0, 0.4143, 0.463, 1], ['linear', soft, 'linear']),
    dash: {
      dasharray: drawn,
      offset: [-1, -1, 0, 0],
      times: [0, 0.25, 0.411, 1],
      ease: [soft, 'easeInOut', [0.53, 0, 0.704, 0.603]],
      initialOffset: -1,
    },
  },
}

/** A card appears (fast, easeOut), stays, and fades out. */
const pinTrack = (times: number[]): OpacityTrack => ({
  values: [0, 0, 1, 1, 0, 0],
  times,
  ease: [soft, 'easeOut', soft, soft, soft],
})

/**
 * As exported from Figma, the EU, Chile and Argentina cards are visible only for a split second at the very end of the loop
 * (times 0.9997 to 1): most likely the keyframes of these three go past the end of the loop in the file.
 * They are kept as exported; to show them earlier, change these times (or fix them in Figma and export again).
 */
const pinAtTheEnd: OpacityTrack = { values: [0, 0, 1, 1, 0], times: [0, 0.9997, 0.9998, 0.9999, 1], ease: [soft, 'easeOut', soft, soft] }

export const pinTimelines: Record<string, OpacityTrack> = {
  br: pinTrack([0, 0.0179, 0.0447, 0.2177, 0.2558, 1]),
  us: pinTrack([0, 0.2236, 0.2504, 0.4249, 0.4608, 1]),
  ge: pinTrack([0, 0.2236, 0.2504, 0.4292, 0.463, 1]),
  ca: pinTrack([0, 0.4293, 0.4562, 0.632, 0.6658, 1]),
  kg: pinTrack([0, 0.6351, 0.6619, 0.8435, 0.8751, 1]),
  in: pinTrack([0, 0.8408, 0.8676, 0.9998, 0.9999, 1]),
  eu: pinAtTheEnd,
  cl: pinAtTheEnd,
  ar: pinAtTheEnd,
}
