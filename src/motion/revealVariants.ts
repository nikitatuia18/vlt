import { motion, type Variants } from 'motion/react'
import { appear, easeOut } from './tokens'

/* The ready-made ways to appear (docs/reveal.motion.md): the numbers come from `appear` in tokens.ts. */

export type Variant = 'up' | 'drop' | 'card' | 'fade' | 'rise' | 'pop' | 'spring' | 'shutter' | 'line-x' | 'line-y'

/** The delay is given to every variant through `custom`, so one set of variants serves all elements. */
export const variants: Record<Variant, Variants> = {
  up: {
    hidden: { opacity: 0, y: appear.up.y, filter: `blur(${appear.up.blur}px)` },
    shown: (delay: number) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: appear.up.duration, ease: easeOut, delay },
      // A blur of 0 px still makes the element a layer of its own: remove the filter when the blur is gone.
      transitionEnd: { filter: 'none' },
    }),
  },
  drop: {
    hidden: { opacity: 0, y: -appear.drop.y },
    shown: (delay: number) => ({ opacity: 1, y: 0, transition: { duration: appear.drop.duration, ease: easeOut, delay } }),
  },
  card: {
    hidden: { opacity: 0, y: appear.card.y, scale: appear.card.scale },
    shown: (delay: number) => ({ opacity: 1, y: 0, scale: 1, transition: { duration: appear.card.duration, ease: easeOut, delay } }),
  },
  fade: {
    hidden: { opacity: 0 },
    shown: (delay: number) => ({ opacity: 1, transition: { duration: appear.up.duration, ease: easeOut, delay } }),
  },
  rise: {
    hidden: { opacity: 0, y: appear.rise.y },
    shown: (delay: number) => ({ opacity: 1, y: 0, transition: { duration: appear.rise.duration, ease: easeOut, delay } }),
  },
  pop: {
    hidden: { opacity: 0, scale: 0 },
    shown: (delay: number) => ({
      opacity: 1,
      scale: [0, 1.35, 1],
      transition: { duration: appear.pop.duration, ease: easeOut, delay, times: [0, 0.6, 1] },
    }),
  },
  // A glass badge jumps out with a small overshoot.
  // (No opacity: a glass badge with a blurred backdrop inside a half-transparent box blinks when the box becomes solid.)
  spring: {
    hidden: { scale: 0 },
    shown: (delay: number) => ({
      scale: [0, 1.06, 1],
      transition: { duration: appear.spring.duration, ease: easeOut, delay, times: [0, 0.65, 1] },
    }),
  },
  // The banner opens like a shutter: a narrow strip in the middle widens to the full width.
  shutter: {
    hidden: { opacity: 0, clipPath: 'inset(0% 38% 0% 38% round 60px)' },
    shown: (delay: number) => ({
      opacity: 1,
      clipPath: 'inset(0% 0% 0% 0% round 0px)',
      transition: { duration: appear.shutter.duration, ease: easeOut, delay },
      transitionEnd: { clipPath: 'none' },
    }),
  },
  'line-x': {
    hidden: { scaleX: 0 },
    shown: (delay: number) => ({ scaleX: 1, transition: { duration: appear.draw.duration, ease: easeOut, delay } }),
  },
  'line-y': {
    hidden: { scaleY: 0 },
    shown: (delay: number) => ({ scaleY: 1, transition: { duration: appear.draw.duration, ease: easeOut, delay } }),
  },
}

export type Tag = 'div' | 'p' | 'span' | 'ul' | 'ol' | 'li' | 'article' | 'h1' | 'h2' | 'h3' | 'a'
export const motionTags = {
  div: motion.div,
  p: motion.p,
  span: motion.span,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  article: motion.article,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  a: motion.a,
} as const
