import { animate, useInView, useMotionValue, useReducedMotion, type AnimationPlaybackControls } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useRevealOn } from '../../../../motion/useReveal'
import { FPS } from './tracks'

type ClockOptions = {
  /** Length of the timeline in frames (60 per second). */
  frames: number
  /** `loop`: plays again and again while the card is on the screen. `once`: plays when the card comes into view and stays at the last frame. */
  mode: 'loop' | 'once'
  /** Seconds of pause between two runs of a loop. */
  gap?: number
  /** The frame that shows the state of the design: with reduced motion (and while the appearance animations are off) the clock stands here. */
  restFrame: number
}

/**
 * The clock of one card illustration: a motion value that counts frames, so every element of the card follows it without a React render.
 * It runs only while the card is at least 40 % on the screen. Without motion (reduced motion, the switch of the appearance animations,
 * the flag of the tests) it stands on `restFrame`, which is the picture of the design.
 */
export function useIllustrationClock({ frames, mode, gap = 0, restFrame }: ClockOptions) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useMotionValue(restFrame)
  const reduced = useReducedMotion() ?? false
  const revealOn = useRevealOn()
  const animated = !reduced && revealOn
  const inView = useInView(ref, { amount: 0.4 })
  const controls = useRef<AnimationPlaybackControls | null>(null)
  // A `once` clock restarts every time the card comes into view; a loop does not care (it only pauses, see below).
  const restartOnView = mode === 'once' ? inView : false

  // The run from the first frame. A `once` clock also starts again every time the card comes back into view.
  useEffect(() => {
    if (!animated) {
      frame.set(restFrame)
      return
    }
    if (mode === 'once' && !restartOnView) return
    frame.set(0)
    const clock = animate(frame, frames, {
      duration: frames / FPS,
      ease: 'linear',
      repeat: mode === 'loop' ? Infinity : 0,
      repeatDelay: gap,
    })
    controls.current = clock
    return () => {
      clock.stop()
      controls.current = null
    }
  }, [animated, frame, frames, gap, mode, restFrame, restartOnView])

  // A loop stands still while the card is off the screen and goes on when it is back. Declared after the effect above: it sees the new clock.
  useEffect(() => {
    const clock = controls.current
    if (!clock) return
    if (inView) clock.play()
    else clock.pause()
  }, [inView, animated])

  return { ref, frame }
}
