import { useAnimationFrame, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { useRef, useState } from 'react'
import { Container } from '../../ui/Container'
import { DESIGN_ACTIVE_ID, industries } from './items'
import { IndustryItem } from './IndustryItem'

/** Scroll length per item, in viewport heights: the longer, the slower the items open one after another. Tuned with the designer. */
const SCROLL_PER_ITEM_VH = 60

/** The list follows the open item with this time constant (ms): the bigger, the softer the movement. */
const FOLLOW_MS = 260

const designActiveIndex = industries.findIndex((item) => item.id === DESIGN_ACTIVE_ID)

/**
 * "From first payment to final payout." Figma block `industries`.
 *
 * The section is pinned to the screen while you scroll through it. Scrolling opens the items of the list one after
 * another (each into a card with an animation), and the list slides so that the open item always stands opposite
 * the title, which stays in place. With reduced motion the section is a plain static block with "Startups" open, as in the design.
 *
 * From the design: column 1440 px with a subtle line on both sides, padding 140 px, title display-sm on the left,
 * list on the right, 24 px between lines. Derived: the pinned scroll, the soft fade of the list at the top and bottom,
 * the column layout below 1280 px and the smaller sizes and paddings.
 */
export function Industries() {
  const reducedMotion = useReducedMotion()
  const tallRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const regionRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const offsetRef = useRef<number | null>(null)
  const isVisibleRef = useRef(true)
  const [activeIndex, setActiveIndex] = useState(0)

  const { scrollYProgress } = useScroll({ target: tallRef, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const index = Math.min(industries.length - 1, Math.max(0, Math.floor(progress * industries.length)))
    setActiveIndex(index)
  })

  // With reduced motion nothing follows the scroll: the design state is shown.
  const shownIndex = reducedMotion ? designActiveIndex : activeIndex

  // Keep the open item opposite the title: the list slides so that the middle of the item meets the middle of its area.
  useAnimationFrame((_, delta) => {
    const stage = stageRef.current
    if (reducedMotion || !stage) return
    const rect = stage.getBoundingClientRect()
    isVisibleRef.current = rect.bottom > 0 && rect.top < window.innerHeight
    if (!isVisibleRef.current) return
    const region = regionRef.current
    const list = listRef.current
    const item = itemRefs.current[shownIndex]
    if (!region || !list || !item) return
    const target = region.clientHeight / 2 - (item.offsetTop + item.offsetHeight / 2)
    const current = offsetRef.current ?? target // the first time it stands there at once
    const next = current + (target - current) * (1 - Math.exp(-Math.min(delta, 100) / FOLLOW_MS))
    offsetRef.current = next
    list.style.transform = `translate3d(0, ${next}px, 0)`
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
            ref={stageRef}
            data-el="industries__stage"
            className={`flex flex-col items-center justify-center gap-6 px-0 desktop:flex-row desktop:gap-15 desktop:px-10 ${
              reducedMotion ? 'py-12 tablet:py-20 desktop:py-35' : 'sticky top-0 h-svh py-6 desktop:py-0'
            }`}
          >
            <div data-el="industries__header" className="w-full text-center desktop:min-w-75 desktop:flex-1 desktop:px-10 desktop:text-left">
              <h2
                id="industries-title"
                data-el="industries__title"
                className="type-heading-lg text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm"
              >
                From first payment to final payout.
              </h2>
            </div>

            {/* The area the list slides in; the list fades out softly at the top and bottom. */}
            <div
              ref={regionRef}
              data-el="industries__list-region"
              className={`relative w-full min-h-0 flex-1 desktop:w-auto desktop:flex-none desktop:self-stretch ${
                reducedMotion ? '' : 'overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)]'
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
