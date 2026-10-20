import { animate, motion, useMotionValue, useTransform, type HTMLMotionProps, type Variants } from 'motion/react'
import { createElement, useEffect, useRef, useState, type ElementType, type ReactNode, type Ref } from 'react'
import { appear, easeOut } from './tokens'
import { useFontsReady, useRevealOn } from './useReveal'

/*
 * Appearance of the page (docs/reveal.motion.md). A few ready-made ways to appear, used by all blocks, so the whole site moves
 * in one character:
 *   RevealLines  the lines of a heading rise from under a mask, one after another
 *   Reveal       one element: variant "up" (text, buttons), "card", "fade", "rise", "pop", "line-x" / "line-y"
 *   CountUp      a figure counts up from zero
 * Everything plays once, when the element comes into view (or when `when` says so, or at once after the fonts are loaded: `atLoad`).
 * Only transform and opacity move (plus a light blur for "up"), so the layout never changes.
 * Without motion (reduced motion, the emergency switch, the test flag) the elements are plain: nothing is hidden, nothing moves.
 */

type Variant = 'up' | 'drop' | 'card' | 'fade' | 'rise' | 'pop' | 'spring' | 'shutter' | 'line-x' | 'line-y'

/** The delay is given to every variant through `custom`, so one set of variants serves all elements. */
const variants: Record<Variant, Variants> = {
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
  spring: {
    hidden: { opacity: 0, scale: 0.6 },
    shown: (delay: number) => ({
      opacity: 1,
      scale: [0.6, 1.06, 1],
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

const viewport = { once: true, amount: 0.2, margin: '0px 0px -8% 0px' } as const

/** What plays the appearance: `when` (a flag set by the block), `atLoad` (once the fonts are ready), or, by default, coming into view. */
type Trigger = { when?: boolean; atLoad?: boolean }

function useTriggerProps({ when, atLoad }: Trigger) {
  const fonts = useFontsReady()
  if (when !== undefined) return { initial: 'hidden', animate: when ? 'shown' : 'hidden' } as const
  if (atLoad) return { initial: 'hidden', animate: fonts ? 'shown' : 'hidden' } as const
  return { initial: 'hidden', whileInView: 'shown', viewport } as const
}

type Tag = 'div' | 'p' | 'span' | 'ul' | 'ol' | 'li' | 'article' | 'h1' | 'h2' | 'h3' | 'a'
const motionTags = {
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

type RevealProps = Trigger &
  Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'animate' | 'whileInView' | 'viewport' | 'custom' | 'ref' | 'children'> & {
    variant?: Variant
    as?: Tag
    /** Seconds to wait after the trigger (the step between neighbours is set by the caller: `index * appear.card.step`). */
    delay?: number
    ref?: Ref<HTMLElement>
    /** For `as="a"`. */
    href?: string
    children?: ReactNode
  }

/** One element that appears. `className`, `style`, `data-el` and the rest go to the element itself (it is `as`, a div by default). */
export function Reveal({ variant = 'up', as = 'div', delay = 0, when, atLoad, children, ref, ...rest }: RevealProps) {
  const on = useRevealOn()
  const trigger = useTriggerProps({ when, atLoad })

  if (!on) {
    const Plain = as as ElementType
    return (
      <Plain ref={ref} {...(rest as object)}>
        {children}
      </Plain>
    )
  }

  const Element = motionTags[as] as typeof motion.div
  return (
    <Element
      {...rest}
      {...trigger}
      ref={ref as Ref<HTMLDivElement>}
      variants={variants[variant]}
      custom={delay}
    >
      {children}
    </Element>
  )
}

type RevealLinesProps = Trigger & {
  lines: readonly string[]
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
  id?: string
  delay?: number
  'data-el'?: string
}

const lineVariants: Variants = {
  hidden: { y: '110%' },
  shown: (delay: number) => ({ y: '0%', transition: { duration: appear.line.duration, ease: easeOut, delay } }),
}

/**
 * A heading whose lines rise from under a mask, one after another. The lines are given as an array (the page breaks them
 * with `<br />` anyway); the heading reads and copies as one text.
 */
export function RevealLines({ lines, as = 'h2', className, delay = 0, when, atLoad, ...rest }: RevealLinesProps) {
  const on = useRevealOn()
  const trigger = useTriggerProps({ when, atLoad })
  const Element = motionTags[as] as typeof motion.div

  if (!on) {
    return createElement(
      as,
      { className, ...rest },
      lines.map((line, index) => (
        <span key={line} className="block">
          {line}
          {index < lines.length - 1 ? ' ' : null}
        </span>
      )),
    )
  }

  return (
    <Element className={className} {...rest} {...trigger}>
      {lines.map((line, index) => (
        // The mask: a little taller below and wider at the sides, so that the tails of g, y and the side bearings are not cut;
        // the negative margins give it back, so the layout is the same as without the mask.
        <span key={line} className="-mx-[0.06em] -mb-[0.16em] block overflow-hidden px-[0.06em] pb-[0.16em]">
          <motion.span className="block" variants={lineVariants} custom={delay + index * appear.line.step}>
            {line}
          </motion.span>
          {index < lines.length - 1 ? ' ' : null}
        </span>
      ))}
    </Element>
  )
}

type CountUpProps = Trigger & {
  /** The final text, like "99.9%", "15+" or "<1 sec": the first number in it is counted from zero. */
  value: string
  className?: string
  delay?: number
  'data-el'?: string
}

const NUMBER = /\d+(\.\d+)?/

/** A figure that counts up from zero to the number in `value` (the rest of the text stays), then stands still. */
export function CountUp({ value, className, delay = 0, when, atLoad, ...rest }: CountUpProps) {
  const on = useRevealOn()
  const fonts = useFontsReady()
  const [inView, setInView] = useState(false)
  const holder = useRef<HTMLSpanElement>(null)
  const count = useMotionValue(0)

  const match = value.match(NUMBER)
  const target = match ? Number(match[0]) : 0
  const decimals = match?.[1] ? match[1].length - 1 : 0
  const [before, after] = match ? [value.slice(0, match.index), value.slice((match.index ?? 0) + match[0].length)] : [value, '']
  const text = useTransform(count, (current) => `${before}${current.toFixed(decimals)}${after}`)

  // Default trigger: coming into view.
  useEffect(() => {
    if (!on || when !== undefined || atLoad || !holder.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setInView(true)
        observer.disconnect()
      },
      { threshold: 0.5 },
    )
    observer.observe(holder.current)
    return () => observer.disconnect()
  }, [on, when, atLoad])

  const go = on && match !== null && (when !== undefined ? when : atLoad ? fonts : inView)
  useEffect(() => {
    if (!go) return
    const controls = animate(count, target, { duration: 1.2, ease: easeOut, delay })
    return () => controls.stop()
  }, [go, count, target, delay])

  if (!on || !match) {
    return (
      <p className={className} {...rest}>
        {value}
      </p>
    )
  }

  // The invisible copy keeps the width of the final text, so that the neighbours do not shift while the figure grows.
  return (
    <p className={className} {...rest}>
      <span ref={holder} className="relative inline-block">
        <span className="sr-only">{value}</span>
        <span aria-hidden="true" className="invisible">
          {value}
        </span>
        <motion.span aria-hidden="true" className="absolute inset-0">
          {text}
        </motion.span>
      </span>
    </p>
  )
}
