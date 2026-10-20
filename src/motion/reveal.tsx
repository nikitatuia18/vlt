import { animate, motion, useMotionValue, useTransform, type HTMLMotionProps, type Variants } from 'motion/react'
import { createElement, useEffect, useRef, useState, type ElementType, type ReactNode, type Ref, type RefObject } from 'react'
import { appear, easeOut } from './tokens'
import { useFontsReady, useRevealOn } from './useReveal'

/*
 * Appearance of the page (docs/reveal.motion.md). A few ready-made ways to appear, used by all blocks, so the whole site moves
 * in one character:
 *   RevealLines  the lines of a heading rise from under a mask, one after another; with by="word" every word does, with a small step
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

const viewport = { once: true, amount: 0.2, margin: '0px 0px -8% 0px' } as const
/** For things at the very end of the page (the lower bar of the footer): the page cannot be scrolled further, so no margin. */
const viewportAtPageEnd = { once: true, amount: 0.2, margin: '0px' } as const

/** What plays the appearance: `when` (a flag set by the block), `atLoad` (once the fonts are ready), or, by default, coming into view. */
type Trigger = { when?: boolean; atLoad?: boolean; /** The element is at the very end of the page: it must appear even though it cannot come above the bottom margin. */ atPageEnd?: boolean }

function useTriggerProps({ when, atLoad, atPageEnd }: Trigger) {
  const fonts = useFontsReady()
  if (when !== undefined) return { initial: 'hidden', animate: when ? 'shown' : 'hidden' } as const
  if (atLoad) return { initial: 'hidden', animate: fonts ? 'shown' : 'hidden' } as const
  return { initial: 'hidden', whileInView: 'shown', viewport: atPageEnd ? viewportAtPageEnd : viewport } as const
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
export function Reveal({ variant = 'up', as = 'div', delay = 0, when, atLoad, atPageEnd, children, ref, ...rest }: RevealProps) {
  const on = useRevealOn()
  const trigger = useTriggerProps({ when, atLoad, atPageEnd })

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

/** A piece of a line with its own class (for example the first words of an answer in a stronger color). */
type Segment = { text: string; className?: string }
type Line = string | readonly Segment[]
const segmentsOf = (line: Line): readonly Segment[] => (typeof line === 'string' ? [{ text: line }] : line)

/** How the text of a part of the design system (a button label, a badge) appears: the same options as RevealLines. */
export type TextReveal = { delay?: number; atLoad?: boolean; when?: boolean; atPageEnd?: boolean; open?: boolean; step?: number }

type RevealLinesProps = Trigger & {
  /** The text. Every entry is a block (a forced line break); an entry may be a list of segments when parts need their own class. */
  lines: readonly Line[]
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  /** `word` (default): every word rises from its own mask, one after another (a phrase "unrolls"). `line`: a line rises as a whole. */
  by?: 'line' | 'word'
  /** Seconds between neighbours (lines or words); the default comes from `appear`. */
  step?: number
  /**
   * For a text inside a panel that opens and closes (an answer, the text of a card): the words play every time the panel
   * is open and the text is on the screen, and go back under their masks a moment after it has closed. Instead of the other triggers.
   */
  open?: boolean
  className?: string
  id?: string
  delay?: number
  'data-el'?: string
}

// A word or a line is a little smaller while it is under the mask and grows to full size as it rises; it grows from its lower left.
const lineVariants: Variants = {
  hidden: { y: '110%', scale: appear.mask.scaleFrom },
  shown: (delay: number) => ({ y: '0%', scale: 1, transition: { duration: appear.line.duration, ease: easeOut, delay } }),
}
const growFrom = { transformOrigin: '0% 100%' } as const

const wordVariants: Variants = {
  hidden: { y: '110%', scale: appear.mask.scaleFrom },
  shown: (delay: number) => ({ y: '0%', scale: 1, transition: { duration: appear.word.duration, ease: easeOut, delay } }),
}

/** After a panel has closed (its fold takes 0.7 s) the words go back under their masks, ready to play again. */
const CLOSE_RESET_MS = 900

/** For `open`: true while the text should be shown (the panel is open and the text is on the screen), with the delayed reset on closing. */
function useOpenPlay(open: boolean | undefined, holder: RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false)
  const [shown, setShown] = useState(false)
  const enabled = open !== undefined

  // A folded panel is not on the screen, so the observer also tells when the text has really been uncovered.
  useEffect(() => {
    const element = holder.current
    if (!enabled || !element) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [enabled, holder])

  useEffect(() => {
    if (!enabled) return
    if (!open) {
      // Closed: put the words back under their masks once the fold is over.
      const timer = setTimeout(() => setShown(false), CLOSE_RESET_MS)
      return () => clearTimeout(timer)
    }
    if (open && visible) {
      const timer = setTimeout(() => setShown(true), 0)
      return () => clearTimeout(timer)
    }
  }, [enabled, open, visible])

  return shown
}

/**
 * A heading or a text whose words rise from under their masks, one after another (each word a little smaller under the mask and
 * full size when it is out): the phrase unrolls. The words wrap as the text wraps, so it suits headings and paragraphs alike;
 * the entries of `lines` are separate blocks (forced line breaks). The text reads and copies as one text.
 * With `by="line"` whole lines rise instead, one after another. With `open` it plays each time a panel opens.
 */
export function RevealLines({ lines, as = 'h2', by = 'word', step, open, className, delay = 0, when, atLoad, atPageEnd, ...rest }: RevealLinesProps) {
  const on = useRevealOn()
  const holder = useRef<HTMLElement | null>(null)
  const opened = useOpenPlay(open, holder)
  const ownTrigger = useTriggerProps({ when, atLoad, atPageEnd })
  const trigger = open === undefined ? ownTrigger : ({ initial: 'hidden', animate: opened ? 'shown' : 'hidden' } as const)
  const Element = motionTags[as] as typeof motion.div
  // Inside a line of other text (a button label) the lines are inline, in a heading or a paragraph they are blocks.
  const lineBox = as === 'span' ? 'inline' : 'block'

  // Headings go a word at a time at 0.07 s, a paragraph (many words) faster, at 0.03 s.
  const gap = step ?? (by === 'word' ? (as === 'p' ? appear.word.paragraphStep : appear.word.step) : appear.line.step)

  if (!on) {
    return createElement(
      as,
      { className, ...rest },
      lines.map((line, index) => (
        <span key={index} className={lineBox}>
          {segmentsOf(line).map((segment, segmentIndex, all) => (
            <span key={segmentIndex} className={segment.className}>
              {segment.text}
              {segmentIndex < all.length - 1 ? ' ' : null}
            </span>
          ))}
          {index < lines.length - 1 ? ' ' : null}
        </span>
      )),
    )
  }

  if (by === 'word') {
    // The words are counted over all lines, so the whole phrase runs on in one beat.
    let counted = 0
    return (
      <Element ref={holder as Ref<HTMLDivElement>} className={className} {...rest} {...trigger}>
        {lines.map((line, lineIndex) => (
          <span key={lineIndex} className={lineBox}>
            {segmentsOf(line)
              .flatMap((segment) => segment.text.split(' ').filter(Boolean).map((word) => ({ word, wordClass: segment.className })))
              .map(({ word, wordClass }, wordIndex) => (
                <span key={wordIndex} className={wordClass}>
                  {wordIndex > 0 ? ' ' : null}
                  {/* Every word has its own mask (a little taller below and wider at the sides, so the tails of g, y are not cut). */}
                  <span data-mask="" className="-mx-[0.06em] -mb-[0.16em] inline-block overflow-hidden px-[0.06em] pb-[0.16em] align-top">
                    <motion.span className="inline-block" style={growFrom} variants={wordVariants} custom={delay + counted++ * gap}>
                      {word}
                    </motion.span>
                  </span>
                </span>
              ))}
            {lineIndex < lines.length - 1 ? ' ' : null}
          </span>
        ))}
      </Element>
    )
  }

  return (
    <Element ref={holder as Ref<HTMLDivElement>} className={className} {...rest} {...trigger}>
      {lines.map((line, index) => (
        // The mask: a little taller below and wider at the sides, so that the tails of g, y and the side bearings are not cut;
        // the negative margins give it back, so the layout is the same as without the mask.
        <span key={index} data-mask="" className="-mx-[0.06em] -mb-[0.16em] block overflow-hidden px-[0.06em] pb-[0.16em]">
          <motion.span className="block" style={growFrom} variants={lineVariants} custom={delay + index * gap}>
            {segmentsOf(line)
              .map((segment) => segment.text)
              .join(' ')}
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

  // The figure is hidden until it starts (it must not stand there as "0" before the count begins), then it comes up and counts.
  // The invisible copy keeps the width of the final text, so that the neighbours do not shift while the figure grows.
  return (
    <Reveal as="p" when={go} delay={delay} className={className} {...rest}>
      <span ref={holder} className="relative inline-block">
        <span className="sr-only">{value}</span>
        <span aria-hidden="true" className="invisible">
          {value}
        </span>
        <motion.span aria-hidden="true" className="absolute inset-0">
          {text}
        </motion.span>
      </span>
    </Reveal>
  )
}
