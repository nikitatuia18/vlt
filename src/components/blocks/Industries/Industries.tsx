import { useAnimationFrame, useInView, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import { useForcedTheme } from '../../../lib/theme'
import { RevealLines } from '../../../motion/reveal'
import { ColumnFade } from '../../ui/ColumnFade'
import { GlowBackdrop, type GlowHue } from '../../ui/GlowBackdrop'
import { Container } from '../../ui/Container'
import { CornerDots } from '../../ui/CornerDots'
import { DESIGN_ACTIVE_ID, industries } from './items'
import { IndustryItem } from './IndustryItem'

/** Scroll length per item, in viewport heights: the longer, the slower the items open one after another. Tuned with the designer. */
const SCROLL_PER_ITEM_VH = 60

/** The content follows the open item with this time constant (ms): the bigger, the softer the movement. */
const FOLLOW_MS = 260

const designActiveIndex = industries.findIndex((item) => item.id === DESIGN_ACTIVE_ID)

/** The hues that exist in the list (one glow layer each; they cross-fade). */
const glowHues = [...new Set(industries.flatMap((item) => (item.glow ? [item.glow] : [])))] as GlowHue[]

/**
 * "From first payment to final payout." Figma block `industries`.
 *
 * The section is pinned to the screen while you scroll through it. The content (the title and under it the list) is one
 * piece that slides vertically so that the open item is ALWAYS in the middle of the screen, the first and the last one too.
 * Scrolling opens the items one after another (each into a card with an animation). Nothing is pinned or hidden on purpose:
 * the title is just the first thing of the content and slides away upwards after the first item; the other items stay
 * visible above and below the open one and leave the screen at its edges, without any fade.
 * With reduced motion the section is a plain static block with "Startups" open, as in the design.
 *
 * From the design: column 1440 px with a subtle line on both sides, text steps, lines of the list, the open card.
 * Derived: the pinned scroll, the title above the list (the design has it on the left), the smaller sizes and paddings.
 */
export function Industries() {
  const reducedMotion = useReducedMotion()
  const tallRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const offsetRef = useRef<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  // With reduced motion the scroll opens nothing, so the items are opened by hand (the design state, Startups, is open at first).
  const [pickedIndex, setPickedIndex] = useState(designActiveIndex)
  // A stable function (not a new one per render), so the items that did not change are not drawn again when the open one changes.
  const registerItem = useCallback((index: number, element: HTMLLIElement | null) => {
    itemRefs.current[index] = element
  }, [])

  const { scrollYProgress } = useScroll({ target: tallRef, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const index = Math.min(industries.length - 1, Math.max(0, Math.floor(progress * industries.length)))
    setActiveIndex(index)
  })

  // With reduced motion nothing follows the scroll: the design state is shown first, then the item the visitor picked.
  const shownIndex = reducedMotion ? pickedIndex : activeIndex
  // The open item sets the scene: some items turn the whole block dark and light a colored glow behind the card.
  const glow = industries[shownIndex]?.glow
  // The dark scenes darken the whole site (the header, the page), and the theme toggle is locked meanwhile.
  // The theme changes as a circle that spreads from the middle of the screen (where the open card stands); inside it the page is already dark.
  // With reduced motion the block is a plain one that shows the dark scene of Startups at once: it darkens the site only while it is on the screen.
  const sectionRef = useRef<HTMLElement>(null)
  const onScreen = useInView(sectionRef, { amount: 0.3 })
  const darkScene = glow && (!reducedMotion || onScreen)
  useForcedTheme(darkScene ? 'dark' : null, { origin: { x: 0.5, y: 0.5 } })

  // Far from the block (a screen above or below, the margin also covers the stage that hangs out below the block) nothing is measured:
  // reading the layout in every frame of the whole page would cost a forced layout each time.
  const nearScreen = useInView(tallRef, { margin: '100% 0px 100% 0px' })

  // Keep the open item in the middle of the screen: the content slides inside the stage (the stage cuts it at the screen edges).
  useAnimationFrame((_, delta) => {
    const stage = stageRef.current
    const slider = sliderRef.current
    const list = listRef.current
    const item = itemRefs.current[shownIndex]
    if (reducedMotion || !nearScreen || !stage || !slider || !list || !item) return
    const bounds = stage.getBoundingClientRect()
    if (bounds.bottom < 0 || bounds.top > window.innerHeight) return // not on screen: nothing to do

    // Middle of the open item measured from the top of the content (without the current shift), and the middle of the stage.
    const itemCenter = list.offsetTop + item.offsetTop + item.offsetHeight / 2
    const target = stage.clientHeight / 2 - itemCenter

    const current = offsetRef.current ?? target // the first time it stands there at once
    const next = current + (target - current) * (1 - Math.exp(-Math.min(delta, 100) / FOLLOW_MS))
    offsetRef.current = next
    slider.style.transform = `translate3d(0, ${next}px, 0)`
  })

  const scrollLength = `calc(100svh + ${(industries.length - 1) * SCROLL_PER_ITEM_VH}vh)`

  return (
    <section
      ref={sectionRef}
      data-el="industries"
      data-glow={glow}
      aria-labelledby="industries-title"
      className="relative border-b border-border-subtle bg-surface-page transition-[background-color,border-color] duration-500 ease-out"
    >
      {/*
        The glow lies behind the content, as wide as the screen (it goes beyond the column), and stays in the middle of the screen
        where the open card always is. It is pinned like the stage and takes no room in the flow.
      */}
      <div
        data-el="industries__glow"
        aria-hidden="true"
        className={`pointer-events-none overflow-hidden ${reducedMotion ? 'absolute inset-0' : 'sticky top-0 -mb-[100svh] h-svh'}`}
      >
        <div data-el="industries__glow-layers" className="absolute inset-0">
          {glowHues.map((hue) => (
            <GlowBackdrop
              key={hue}
              hue={hue}
              visible={glow === hue}
              data-el={`industries__glow-${hue}`}
              className="absolute top-1/2 left-1/2 h-[clamp(22rem,58svh,36rem)] w-[max(166vw,70rem)] max-w-none -translate-x-1/2 -translate-y-1/2 max-tablet:h-[52svh]"
            />
          ))}
        </div>
      </div>
      <Container ref={tallRef} className="relative z-10" style={reducedMotion ? undefined : { height: scrollLength }}>
        <div
          data-el="industries__container"
          className="relative h-full column-lines transition-shadow duration-500 ease-out"
        >
          <div
            ref={stageRef}
            data-el="industries__stage"
            // Pinned: the stage is the screen and cuts the sliding content at its edges.
            // The negative bottom margin lets the stage hang out below the end of the block: the open last card stands in the middle
            // of the screen, so the empty half under it would be a big gap; this way the end of the block comes 18rem under the middle.
            // Static (reduced motion): a plain block with the usual paddings of a section.
            className={reducedMotion ? 'py-12 tablet:py-20 desktop:py-35' : 'sticky top-0 -mb-[max(0px,calc(50svh-18rem))] h-svh overflow-hidden'}
          >
            <div
              ref={sliderRef}
              data-el="industries__slider"
              className="relative flex flex-col items-center gap-8 will-change-transform tablet:gap-10 desktop:gap-12 desktop:px-10"
            >
              <div data-el="industries__header" className="flex w-full flex-col items-center text-center">
                <RevealLines
                  id="industries-title"
                  data-el="industries__title"
                  className="type-heading-lg max-w-156 text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm"
                  lines={['From first payment to final payout.']}
                />
              </div>

              <ul ref={listRef} data-el="industries__list" className="relative flex w-full flex-col gap-6">
                {industries.map((item, index) => (
                  <IndustryItem
                    key={item.id}
                    item={item}
                    isActive={index === shownIndex}
                    index={index}
                    registerRef={registerItem}
                    onPick={reducedMotion ? setPickedIndex : undefined}
                  />
                ))}
              </ul>
            </div>
          </div>

          {/* The end of the block, like the top of the block above: a line with dots on the corners. The column lines go
              on below the block and fade out into the next one (it has no column lines). */}
          <CornerDots edge="bottom" block="industries" />
          <ColumnFade edge="bottom" block="industries" />
        </div>
      </Container>
    </section>
  )
}
