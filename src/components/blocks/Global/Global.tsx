import { useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { shiftScroll } from '../../../lib/smoothScroll'
import { CountUp, Reveal, RevealLines } from '../../../motion/reveal'
import { Container } from '../../ui/Container'
import { Globe } from './globe/Globe'

const metrics = [
  { id: 'uptime', value: '99.9%', label: 'Target SLA uptime' },
  { id: 'rails', value: '15+', label: 'Direct local rails' },
  { id: 'latency', value: '<1 sec', label: 'API processing time' },
] as const

/** Scroll the section takes after the screen is full: the globe flies to its place, then the text and the cards appear. */
const PINNED_SCROLL = '150vh'

/** The text appears (once) when the pinned scroll (0 to 1) reaches this point: the globe has mostly stood up. */
const TEXT_AT = 0.6

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
  // The big scene plays once (docs/blocks/global.md): when the block has gone up out of the screen, it becomes a plain block with the
  // globe in its place, so scrolling back up shows the finished state, not the big globe again. Reload plays it again.
  const [settled, setSettled] = useState(false)
  const heightBefore = useRef(0)
  const { scrollYProgress: leaving } = useScroll({ target: sectionRef, offset: ['end end', 'end start'] })
  const settle = () => {
    if (settled || !sectionRef.current) return
    heightBefore.current = sectionRef.current.offsetHeight
    setSettled(true)
  }
  useMotionValueEvent(leaving, 'change', (value) => {
    if (value >= 1) settle()
  })
  useLayoutEffect(() => {
    // The page may be opened already below the block (a restored scroll position or a link).
    if (sectionRef.current && sectionRef.current.getBoundingClientRect().bottom < 0) settle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // The block got shorter while it was above the screen: keep the visitor where they were (before the next frame is drawn).
  useLayoutEffect(() => {
    if (!settled || !sectionRef.current) return
    const delta = heightBefore.current - sectionRef.current.offsetHeight
    if (delta > 0) shiftScroll(-delta)
  }, [settled])
  // A plain block (reduced motion, or the scene has played): no pinning, no extra scroll length.
  const plain = reduced || settled

  // The heading rises line by line, the text comes up, the figures count (docs/reveal.motion.md); it plays once.
  const [textOn, setTextOn] = useState(false)
  useMotionValueEvent(progress, 'change', (value) => {
    if (value >= TEXT_AT) setTextOn(true)
  })

  return (
    <section
      ref={sectionRef}
      data-el="global"
      aria-labelledby="global-title"
      style={plain ? undefined : { height: `calc(100svh + ${PINNED_SCROLL})` }}
    >
      <div data-el="global__stage" className={`${plain ? 'relative' : 'sticky top-0'} h-svh min-h-160 overflow-hidden`}>
        <Globe progress={progress} appear={appear} slotRef={slotRef} frameRef={frameRef} reduced={reduced} settled={settled} />

        {/* Above the canvas but transparent to the pointer: the globe is turned and pushes dots through it. */}
        <Container className="pointer-events-none relative z-10 h-full">
          {/*
            Narrow: a column (globe, message, metrics). From 1024 px a grid: on the left the globe with the metrics right under it,
            on the right the message; both columns stand on the bottom line. The globe slot is a row of its own, so the globe always
            sits right above the metrics, whatever the height of the screen is.
          */}
          <div
            ref={frameRef}
            data-el="global__content"
            className="relative flex h-full flex-col justify-between gap-8 pt-8 pb-12 tablet:pt-12 tablet:pb-20 min-[64rem]:grid min-[64rem]:grid-cols-[minmax(0,1fr)_auto] min-[64rem]:grid-rows-[1fr_auto] min-[64rem]:gap-x-0 min-[64rem]:gap-y-1 min-[64rem]:pt-[clamp(4rem,12svh,8.75rem)] min-[64rem]:pr-0 min-[64rem]:pb-[clamp(4rem,12svh,8.75rem)] min-[64rem]:pl-[8%]"
          >
            <div
              ref={slotRef}
              data-el="global__globe-slot"
              className="min-h-0 w-full flex-1 min-[64rem]:aspect-square min-[64rem]:h-full min-[64rem]:w-auto min-[64rem]:max-w-full min-[64rem]:flex-none min-[64rem]:self-end"
            />

            <ul
              data-el="global__metrics"
              className="order-3 flex flex-wrap gap-x-8 gap-y-6 whitespace-nowrap min-[64rem]:order-none min-[64rem]:col-start-1 min-[64rem]:row-start-2"
            >
              {metrics.map((metric, index) => (
                <li key={metric.id} data-el={`global__metric-${metric.id}`} className="flex flex-col gap-2">
                  <CountUp
                    when={textOn}
                    delay={0.5 + index * 0.15}
                    value={metric.value}
                    data-el={`global__metric-${metric.id}-value`}
                    className="type-heading-lg text-typography-primary tablet:type-heading-xl min-[90rem]:type-display-sm"
                  />
                  <Reveal
                    as="p"
                    when={textOn}
                    delay={0.6 + index * 0.15}
                    data-el={`global__metric-${metric.id}-label`}
                    className="type-body-md text-typography-secondary tablet:type-body-lead"
                  >
                    {metric.label}
                  </Reveal>
                </li>
              ))}
            </ul>

            <div
              data-el="global__message"
              className="order-2 flex w-fit max-w-full flex-col gap-8 min-[64rem]:order-none min-[64rem]:col-start-2 min-[64rem]:row-span-2 min-[64rem]:row-start-1 min-[64rem]:self-end"
            >
              <RevealLines
                when={textOn}
                id="global-title"
                data-el="global__title"
                className="type-heading-lg text-typography-primary tablet:type-heading-xl desktop:type-display-sm min-[100rem]:type-display-xl"
                lines={['Go global without', 'rebuilding your', 'payments stack.']}
              />
              {/* As wide as the title above it, not wider (w-0 + min-w-full). */}
              <Reveal
                as="p"
                when={textOn}
                delay={0.45}
                data-el="global__desc"
                className="type-body-md w-0 min-w-full text-typography-secondary tablet:type-body-lead"
              >
                Connect local payment methods, international rails and crypto through one integration.
              </Reveal>
            </div>
          </div>
        </Container>
      </div>
    </section>
  )
}
