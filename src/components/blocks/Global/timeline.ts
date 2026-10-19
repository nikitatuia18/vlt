/*
 * Animation of the map. One shared timeline of 15 s (900 frames at 60 fps), looped:
 * the routes draw themselves, the cards (pins) appear one after another and fade out.
 *
 * Source: the Lottie export of the designer (`global__map.json`, 900 frames) and Figma Motion (`get_motion_context`).
 * Figma Motion reports a cycle of 11.18 s, but the keyframes of the last three cards (EU, Chile, Argentina) and
 * of routes 4–7 lie after that moment, so the full length of the Lottie (15 s) is used here.
 * Every time below is a frame number of the Lottie (60 per second); `at()` turns it into a fraction of the loop.
 */

export const FRAMES = 900
export const DURATION = FRAMES / 60

const at = (frame: number) => frame / FRAMES

type CubicBezier = [number, number, number, number]
type Ease = 'linear' | 'easeOut' | 'easeInOut' | CubicBezier

/** The soft S-curve that Figma uses between most keyframes. */
const soft: CubicBezier = [0.5, 0, 0.5, 1]

export type Track = { values: number[]; times: number[]; ease: Ease[] }

/** Draw-on of a route: how much of the line is drawn (0 to 1); `reverse` draws it from the other end of the path. */
export type DrawTrack = Track & { reverse: boolean }

export type RouteTimeline = { opacity: Track; draw?: DrawTrack }
export type PinTimeline = { opacity: Track; scale: Track }

/** A route is visible until `hold`, fades out until `gone`. */
const routeOpacity = (hold: number, gone: number, ease: Ease[] = ['linear', soft, 'linear']): Track => ({
  values: [1, 1, 0, 0],
  times: [0, at(hold), at(gone), 1],
  ease,
})

/** The line is drawn between `from` and `to` frames (with the same ease-in-out curve as in Figma). */
const draw = (from: number, to: number, reverse: boolean): DrawTrack => ({
  values: [0, 0, 1, 1],
  times: [0, at(from), at(to), 1],
  ease: [soft, 'easeInOut', 'linear'],
  reverse,
})

/** Routes 5, 6 and 7 are not drawn: they are there from the start and fade out at the end. */
const standing: RouteTimeline = { opacity: routeOpacity(830.94, 900) }

export const routeTimelines: Record<number, RouteTimeline> = {
  1: { opacity: routeOpacity(415.44, 443.82), draw: draw(305.9, 413.9, false) },
  2: { opacity: routeOpacity(276.48, 306.3), draw: draw(167.7, 275.7, true) },
  3: { opacity: routeOpacity(140.4, 168.72, [soft, soft, 'linear']), draw: draw(30.2, 138.2, false) },
  4: { opacity: routeOpacity(693.42, 721.74), draw: draw(582.2, 693.42, true) },
  5: standing,
  6: standing,
  7: standing,
  8: { opacity: routeOpacity(551.58, 582.78), draw: draw(444.1, 552.1, true) },
  9: { opacity: routeOpacity(277.92, 310.56), draw: draw(167.7, 275.7, true) },
}

/** The card starts at this share of its size and grows to the full size while it fades in (not in Figma: added on request). */
export const PIN_SCALE_FROM = 0.2

/**
 * A card: invisible until `show`, fades in until `shown` (and grows from PIN_SCALE_FROM to 1), stays until `hold`,
 * fades out until `gone`.
 */
const pin = (show: number, shown: number, hold: number, gone: number): PinTimeline => {
  const fadesAtTheEnd = gone >= FRAMES
  return {
    opacity: {
      values: fadesAtTheEnd ? [0, 0, 1, 1, 0] : [0, 0, 1, 1, 0, 0],
      times: (fadesAtTheEnd ? [0, show, shown, hold, gone] : [0, show, shown, hold, gone, FRAMES]).map(at),
      ease: fadesAtTheEnd ? [soft, 'easeOut', soft, soft] : [soft, 'easeOut', soft, soft, soft],
    },
    scale: {
      values: [PIN_SCALE_FROM, PIN_SCALE_FROM, 1, 1],
      times: [0, show, shown, FRAMES].map(at),
      ease: ['linear', 'easeOut', 'linear'],
    },
  }
}

export const pinTimelines: Record<string, PinTimeline> = {
  br: pin(12, 30, 146.04, 171.6),
  us: pin(150, 168, 285, 309.12),
  ge: pin(150, 168, 287.88, 310.56),
  ca: pin(288, 306, 423.96, 446.64),
  kg: pin(426, 444, 565.8, 587.04),
  in: pin(564, 582, 703.32, 723.18),
  ar: pin(702, 720, 840.84, 900),
  cl: pin(702, 720, 843.72, 900),
  eu: pin(702, 720, 846.54, 900),
}
