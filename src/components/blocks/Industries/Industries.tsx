import { useAnimationFrame, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { useRef, useState } from 'react'
import { Container } from '../../ui/Container'
import { DESIGN_ACTIVE_ID, industries } from './items'
import { IndustryItem } from './IndustryItem'

/** Scroll length per item, in viewport heights: the longer, the slower the items open one after another. Tuned with the designer. */
const SCROLL_PER_ITEM_VH = 60

/** The list follows the open item with this time constant (ms): the bigger, the softer the movement. */
const FOLLOW_MS = 260

/** Length (px) of the soft fade at the top and bottom of the list, where the list is cut by the edge of its area. */
const FADE_PX = 56

const designActiveIndex = industries.findIndex((item) => item.id === DESIGN_ACTIVE_ID)

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * "From first payment to final payout." Figma block `industries`.
 *
 * The section is pinned to the screen while you scroll through it. The title stays at the top, centered, like
 * the headers of the other blocks, and does not depend on the list. Scrolling opens the items of the list one
 * after another (each into a card with an animation); the list slides to keep the open item in view:
 * at the start the list begins right under the title, in the middle the open item is centered, at the end the list
 * rests on the bottom. With reduced motion the section is a plain static block with "Startups" open, as in the design.
 *
 * From the design: column 1440 px with a subtle line on both sides, text steps, lines of the list, the open card.
 * Derived: the pinned scroll, the title above the list (the design has it on the left), the fade of the list where
 * it is cut, the smaller sizes and paddings.
 */
export function Industries() {
  const reducedMotion = useReducedMotion()
  const tallRef = useRef<HTMLDivElement>(null)
  const regionRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const offsetRef = useRef<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const { scrollYProgress } = useScroll({ target: tallRef, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const index = Math.min(industries.length - 1, Math.max(0, Math.floor(progress * industries.length)))
    setActiveIndex(index)
  })

  // With reduced motion nothing follows the scroll: the design state is shown.
  const shownIndex = reducedMotion ? designActiveIndex : activeIndex

  // Keep the open item in view: the list slides inside its area (the area is cut at its edges).
  useAnimationFrame((_, delta) => {
    const region = regionRef.current
    const list = listRef.current
    const item = itemRefs.current[shownIndex]
    if (reducedMotion || !region || !list || !item) return
    const bounds = region.getBoundingClientRect()
    if (bounds.bottom < 0 || bounds.top > window.innerHeight) return // not on screen: nothing to do

    const areaHeight = region.clientHeight
    const listHeight = list.offsetHeight
    const itemCenter = item.offsetTop + item.offsetHeight / 2
    // A list that fits is centered as a whole. A longer one starts at the top, centers the open item in the middle
    // and rests on the bottom at the end.
    const target =
      listHeight <= areaHeight ? (areaHeight - listHeight) / 2 : clamp(areaHeight / 2 - itemCenter, areaHeight - listHeight, 0)

    const current = offsetRef.current ?? target // the first time it stands there at once
    const next = current + (target - current) * (1 - Math.exp(-Math.min(delta, 100) / FOLLOW_MS))
    offsetRef.current = next
    list.style.transform = `translate3d(0, ${next}px, 0)`

    // Fade only where the list is really cut: nothing at the top while it starts there, nothing at the bottom at the end.
    const hiddenAbove = Math.max(0, -next)
    const hiddenBelow = Math.max(0, listHeight + next - areaHeight)
    region.style.setProperty('--fade-top', `${Math.min(FADE_PX, hiddenAbove)}px`)
    region.style.setProperty('--fade-bottom', `${Math.min(FADE_PX, hiddenBelow)}px`)
  })

  const scrollLength = `calc(100svh + ${(industries.length - 1) * SCROLL_PER_ITEM_VH}vh)`

  return (
    <section data-el="industries" aria-labelledby="industries-title">
      <Container ref={tallRef} style={reducedMotion ? undefined : { height: scrollLength }}>
        <div
          data-el="industries__container"
          className="h-full shadow-[inset_1px_0_0_var(--color-border-subtle),inset_-1px_0_0_var(--color-border-subtle)]"
        >
          <div
            data-el="industries__stage"
            className={`flex flex-col items-center gap-8 tablet:gap-10 desktop:gap-12 desktop:px-10 ${
              reducedMotion ? 'py-12 tablet:py-20 desktop:py-35' : 'sticky top-0 h-svh pt-10 tablet:pt-16 desktop:pt-24'
            }`}
          >
            <div data-el="industries__header" className="flex w-full flex-col items-center text-center">
              <h2
                id="industries-title"
                data-el="industries__title"
                className="type-heading-lg max-w-156 text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm"
              >
                From first payment to final payout.
              </h2>
            </div>

            {/* The area the list slides in; the list fades out softly where the edge of the area cuts it. */}
            <div
              ref={regionRef}
              data-el="industries__list-region"
              className={`relative w-full ${
                reducedMotion
                  ? ''
                  : 'min-h-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0,#000_var(--fade-top,0px),#000_calc(100%-var(--fade-bottom,0px)),transparent_100%)]'
              }`}
            >
              <ul ref={listRef} data-el="industries__list" className="relative flex flex-col gap-6 will-change-transform">
                {industries.map((item, index) => (
                  <IndustryItem
                    key={item.id}
                    item={item}
                    isActive={index === shownIndex}
                    setRef={(element) => {
                      itemRefs.current[index] = element
                    }}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
