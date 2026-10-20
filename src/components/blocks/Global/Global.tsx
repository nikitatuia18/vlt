import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Container } from '../../ui/Container'
import { Globe } from './globe/Globe'

const metrics = [
  { id: 'uptime', value: '99.9%', label: 'Target SLA uptime' },
  { id: 'rails', value: '15+', label: 'Direct local rails' },
  { id: 'latency', value: '<1 sec', label: 'API processing time' },
] as const

/** Scroll the section takes after the screen is full: the globe flies to its place, then the text and the cards appear. */
const PINNED_SCROLL = '150vh'

/** The text appears (progress of the pinned scroll, 0 to 1) after the globe has mostly stood up. */
const TEXT_FROM = 0.6
const TEXT_TO = 0.9
const TEXT_RISE = 24

/**
 * "Go global without rebuilding your payments stack." Figma block `global`.
 *
 * A pinned scene (like Industries): a big dot globe appears, then flies to its place (the empty `global__globe-slot` of the
 * layout), then the text and numbers appear and the cards of the countries start on the globe. The globe, its arcs and cards
 * are in `Globe` (see docs/blocks/global.motion.md).
 *
 * Layout (derived, the design has no globe): from 1024 px the globe is on the left, metrics under it, the message on the right,
 * all at the bottom of the screen; below that the globe is above the text. With reduced motion the section is a plain block.
 * Fixed typo of the design: "throught" is "through".
 */
export function Global() {
  const reduced = useReducedMotion() ?? false
  const sectionRef = useRef<HTMLElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)

  // Two phases of one scroll: the section comes into view (the globe appears), then it stays pinned (the globe flies to its place).
  const { scrollYProgress: appear } = useScroll({ target: sectionRef, offset: ['start end', 'start start'] })
  const { scrollYProgress: progress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const textOpacity = useTransform(progress, [TEXT_FROM, TEXT_TO], [0, 1])
  const textShift = useTransform(progress, [TEXT_FROM, TEXT_TO], [TEXT_RISE, 0])

  return (
    <section
      ref={sectionRef}
      data-el="global"
      aria-labelledby="global-title"
      style={reduced ? undefined : { height: `calc(100svh + ${PINNED_SCROLL})` }}
    >
      <div data-el="global__stage" className={`${reduced ? 'relative' : 'sticky top-0'} h-svh min-h-160 overflow-hidden`}>
        <Globe progress={progress} appear={appear} slotRef={slotRef} frameRef={frameRef} reduced={reduced} />

        {/* Above the canvas but transparent to the pointer: the globe is turned and pushes dots through it. */}
        <Container className="pointer-events-none relative z-10 h-full">
          <div ref={frameRef} data-el="global__content" className="relative flex h-full flex-col justify-between gap-8 py-8 tablet:py-12 min-[64rem]:block min-[64rem]:py-0">
            <div
              ref={slotRef}
              data-el="global__globe-slot"
              className="min-h-0 w-full flex-1 min-[64rem]:absolute min-[64rem]:top-[6%] min-[64rem]:left-[8%] min-[64rem]:aspect-square min-[64rem]:w-[min(48%,calc(100svh-17rem))] min-[64rem]:flex-none"
            />

            <motion.div
              data-el="global__text-wrap"
              style={reduced ? undefined : { opacity: textOpacity, y: textShift }}
              className="relative flex flex-col-reverse gap-8 min-[64rem]:absolute min-[64rem]:inset-x-0 min-[64rem]:bottom-12 min-[64rem]:flex-row min-[64rem]:items-end min-[64rem]:justify-between min-[64rem]:gap-0"
            >
              <ul data-el="global__metrics" className="flex flex-wrap gap-x-10 gap-y-6 whitespace-nowrap min-[64rem]:ml-[8%]">
                {metrics.map((metric) => (
                  <li key={metric.id} data-el={`global__metric-${metric.id}`} className="flex flex-col gap-2">
                    <p
                      data-el={`global__metric-${metric.id}-value`}
                      className="type-heading-lg text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm"
                    >
                      {metric.value}
                    </p>
                    <p
                      data-el={`global__metric-${metric.id}-label`}
                      className="type-body-md text-typography-secondary tablet:type-body-lead"
                    >
                      {metric.label}
                    </p>
                  </li>
                ))}
              </ul>

              <div data-el="global__message" className="flex w-fit max-w-full flex-col gap-8">
                <h2
                  id="global-title"
                  data-el="global__title"
                  className="type-heading-lg text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm min-[100rem]:type-display-xl"
                >
                  Go global without
                  <br />
                  rebuilding your
                  <br />
                  payments stack.
                </h2>
                {/* As wide as the title above it, not wider (w-0 + min-w-full). */}
                <p data-el="global__desc" className="type-body-md w-0 min-w-full text-typography-secondary tablet:type-body-lead">
                  Connect local payment methods, international rails and crypto through one integration.
                </p>
              </div>
            </motion.div>
          </div>
        </Container>
      </div>
    </section>
  )
}
