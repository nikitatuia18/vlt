import { easingDefinitionToFunction, interpolate } from 'motion/react'
import type { Track } from './timeline'

/** Turns a keyframe track of the timeline into a function: loop time as a fraction (0 to 1) → value. */
export const sampleTrack = (track: Track) =>
  interpolate(track.times, track.values, { ease: track.ease.map((ease) => easingDefinitionToFunction(ease)) })
