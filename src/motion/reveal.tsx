import { animate, motion, useMotionValue, useTransform, type HTMLMotionProps } from 'motion/react'
import { useEffect, useRef, useState, type ElementType, type ReactNode, type Ref } from 'react'
import { useTriggerProps, type Trigger } from './revealTrigger'
import { motionTags, variants, type Tag, type Variant } from './revealVariants'
import { easeOut } from './tokens'
import { useFontsReady, useRevealOn } from './useReveal'

export { RevealLines, type Line, type Segment, type TextReveal } from './RevealLines'

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
  const fonts = useFontsReady(when === undefined && !!atLoad)
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
