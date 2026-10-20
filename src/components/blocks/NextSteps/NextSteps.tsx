import { useAnimationFrame, useInView, useMotionValue, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { RevealLines } from '../../../motion/reveal'
import { ColumnFade } from '../../ui/ColumnFade'
import { Container } from '../../ui/Container'
import { CornerDots } from '../../ui/CornerDots'
import { StepCard } from './StepCard'
import { steps, STEP_SECONDS } from './steps'

/** The line of the open card in the design is drawn at 325 of 418 px. */
const DESIGN_PROGRESS = 325 / 418

/**
 * "What are our next steps?" Figma block `next-steps`.
 *
 * Four steps, one is open. When the cards are on the screen, the orange line of the open card fills for STEP_SECONDS,
 * then the card folds and the next one opens; after the fourth the first opens again. A click on a step opens it at once
 * and the line starts from it. When the cards leave the screen the time stops, and goes on when they come back.
 * The time also stops while a card is held pressed (mouse or finger) and while a card has keyboard focus: the visitor
 * may read a step as long as they want.
 * With reduced motion nothing runs by itself (the design state: step 1 open, line at 78 %); a click still opens a step.
 *
 * From the design: section border at the bottom, column 1440 px with 40 px inside, vertical padding 140 px, gap 48 px,
 * header with the title on the left and the text on the right (aligned to the bottom), cards 500 / 262 px wide and
 * 680 px high with a 24 px gap, radius 40.
 * Derived (not in the desktop frame): the row of cards from 1440 px (closed cards of 262 px do not fit a title narrower),
 * below it the cards stand one under another; smaller paddings and type sizes; the header stacks.
 */
export function NextSteps() {
  const reducedMotion = useReducedMotion()
  const cardsRef = useRef<HTMLOListElement>(null)
  const onScreen = useInView(cardsRef, { amount: 0.5 })
  const progress = useMotionValue(0)
  const [activeIndex, setActiveIndex] = useState(0)
  // Why the time is held right now (not state: the frame loop reads it, nothing needs to be drawn again).
  const holds = useRef({ pressed: false, focused: false })

  useAnimationFrame((_, delta) => {
    if (reducedMotion || !onScreen || holds.current.pressed || holds.current.focused) return
    // A long pause (a hidden tab) must not skip steps: one frame counts for at most 100 ms.
    const next = progress.get() + Math.min(delta, 100) / 1000 / STEP_SECONDS
    if (next >= 1) {
      progress.set(0)
      setActiveIndex((index) => (index + 1) % steps.length)
    } else {
      progress.set(next)
    }
  })

  useEffect(() => {
    const cards = cardsRef.current
    if (!cards) return
    // A press that starts on the cards holds the time until it ends, wherever the pointer is released.
    const release = () => {
      holds.current.pressed = false
    }
    const onPressStart = () => {
      holds.current.pressed = true
    }
    // Only focus from the keyboard holds the time: after a mouse click the button keeps focus, and the steps must go on.
    const onFocusIn = (event: FocusEvent) => {
      holds.current.focused = (event.target as Element).matches(':focus-visible')
    }
    const onFocusOut = () => {
      holds.current.focused = false
    }
    cards.addEventListener('pointerdown', onPressStart)
    cards.addEventListener('focusin', onFocusIn)
    cards.addEventListener('focusout', onFocusOut)
    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', release)
    return () => {
      cards.removeEventListener('pointerdown', onPressStart)
      cards.removeEventListener('focusin', onFocusIn)
      cards.removeEventListener('focusout', onFocusOut)
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', release)
    }
  }, [])

  const open = (index: number) => {
    if (index === activeIndex) return
    progress.set(0)
    setActiveIndex(index)
  }

  return (
    <section data-el="next-steps" aria-labelledby="next-steps-title" className="border-y border-border-subtle">
      <Container>
        <div
          data-el="next-steps__container"
          // The column lines are drawn inside (an inset shadow, like a Figma stroke), so they do not narrow the content.
          className="relative flex flex-col gap-8 py-12 column-lines tablet:gap-10 tablet:py-20 desktop:gap-12 desktop:px-10 desktop:py-35"
        >
          <div
            data-el="next-steps__header"
            className="flex flex-col gap-4 tablet:gap-6 desktop:flex-row desktop:items-end desktop:justify-between desktop:px-10"
          >
            <RevealLines
              by="word"
              id="next-steps-title"
              data-el="next-steps__title"
              className="type-heading-lg text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm desktop:w-113.5 desktop:shrink-0"
              lines={['What are our next steps?']}
            />
            <RevealLines
              as="p"
              by="word"
              step={0.04}
              delay={0.45}
              data-el="next-steps__desc"
              className="type-body-md max-w-115 text-typography-secondary tablet:type-body-lead desktop:flex-1"
              lines={['From initial consultation to your first live transaction in 4 transparent steps.']}
            />
          </div>

          {/* @container: the text of the open card takes its final width from the width of this row (see StepCard). */}
          <ol
            ref={cardsRef}
            data-el="next-steps__cards"
            className="@container flex flex-col gap-4 min-[90rem]:flex-row min-[90rem]:gap-6"
          >
            {steps.map((step, index) => (
              <StepCard
                key={step.id}
                step={step}
                isActive={index === activeIndex}
                progress={progress}
                staticProgress={reducedMotion ? DESIGN_PROGRESS : null}
                index={index}
                onOpen={() => open(index)}
              />
            ))}
          </ol>

          {/* Dots on its corners at both lines. Above it is the block global without column lines, so the lines go on
              upwards and fade out; below it the column goes on in the FAQ block without a break. */}
          <CornerDots edge="top" block="next-steps" />
          <CornerDots edge="bottom" block="next-steps" />
          <ColumnFade edge="top" block="next-steps" />
        </div>
      </Container>
    </section>
  )
}
