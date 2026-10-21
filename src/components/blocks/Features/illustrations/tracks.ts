import { cubicBezier, easingDefinitionToFunction, interpolate } from 'motion/react'
import { easeOut } from '../../../../motion/tokens'

/*
 * Helpers for the timelines of the card illustrations (docs/blocks/features.motion.md). The designer's Lottie files run at 60 frames
 * per second, so every time below is a frame number; a card clock (`useIllustrationClock`) turns the seconds into frames and every
 * element follows the frame through a track. A track is a function: frame → value.
 */

export const FPS = 60

/** The soft landing of the whole site (`easeOut` of tokens.ts), as a function; Lottie uses the same bezier (0.22 1 0.36 1). */
export const outCurve = easingDefinitionToFunction([...easeOut])
/** The S curve that Lottie puts on opacity fades of whole layers. */
export const inOutCurve = cubicBezier(0.5, 0, 0.5, 1)

type Points = readonly (readonly [frame: number, value: number])[]

/** Straight lines through sampled points (the per-frame curves of Lottie reduced to a few points); outside the range the end values hold. */
export const through = (points: Points) =>
  interpolate(
    points.map(([frame]) => frame),
    points.map(([, value]) => value),
  )

/** From `from` to `to` between two frames with one easing curve; before and after the values hold. */
export const between = (from: number, to: number, start: number, end: number, curve = outCurve) =>
  interpolate([start, end], [from, to], { ease: curve })

/** A track that is the sum of other tracks (an element that appears and, much later, is pushed away). */
export const sum =
  (...tracks: ((frame: number) => number)[]) =>
  (frame: number) =>
    tracks.reduce((total, track) => total + track(frame), 0)
