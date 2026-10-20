import { motion, useAnimationFrame, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { brands } from './brands'
import { WAVELENGTH, slotRange, tileBrand, tileX, tileY } from './wave'

type LogoWaveProps = {
  /** Seconds the wave needs to run one full wavelength (861 px). */
  wavePeriod: number
  /** How far (px) the whole strip drifts to the left while the section scrolls through the screen. */
  drift: number
  /** The section whose passage through the screen drives the drift. */
  scrollTarget: RefObject<HTMLElement | null>
}

/** A frame longer than this (a background tab, a freeze) is counted as this long, so the wave does not jump. */
const MAX_FRAME_MS = 100
/** The wave eases to a stop and back in about this time (ms) when the pointer enters or leaves the strip. */
const EASE_MS = 200

const tileClasses =
  'absolute top-0 left-0 isolate grid size-20 place-items-center rounded-pill bg-surface-subtle ring-1 ring-inset ring-border-subtle will-change-transform'
const linkClasses =
  'transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand'

/**
 * Logo tiles with a wave running through them (Figma `logos__track`). The parent is the content column
 * (`logos__track-wrap`, relative); the strip itself is as wide as the screen, tiles stand still along x.
 *
 * How it works (the idea is the same as on antigravity.google, the code is our own):
 * - every tile has a fixed x; its height comes from a periodic curve at x + phase (see wave.ts);
 * - the phase grows steadily, so the wave runs from right to left; one wavelength takes `wavePeriod` seconds;
 * - the whole strip drifts to the left by `drift` px as the section scrolls through the screen (tied to the scroll
 *   position, so it goes back when you scroll back);
 * - the wave eases to a stop while the pointer is over the strip or a tile has keyboard focus;
 * - nothing is computed while the strip is off screen; with `prefers-reduced-motion` the tiles stand as in the design.
 * Heights are written straight to the elements, without a React render per frame.
 */
export function LogoWave({ wavePeriod, drift, scrollTarget }: LogoWaveProps) {
  const stripRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef(new Map<number, HTMLElement>())
  const columnLeftRef = useRef(0)
  const phaseRef = useRef(0)
  const speedFactorRef = useRef(1) // 1 = running, 0 = stopped; eases between the two
  const isVisibleRef = useRef(true)
  const isHoveredRef = useRef(false)
  const hasFocusRef = useRef(false)
  const reducedMotion = useReducedMotion()
  const [range, setRange] = useState<{ first: number; last: number } | null>(null)

  const { scrollYProgress } = useScroll({ target: scrollTarget, offset: ['start end', 'end start'] })
  const shift = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [0, -drift])

  // The strip is as wide as the screen and starts at its left edge; the column may be narrower than the screen.
  useEffect(() => {
    const strip = stripRef.current
    const column = strip?.parentElement
    if (!strip || !column) return
    const measure = () => {
      const columnLeft = column.getBoundingClientRect().left
      const viewportWidth = document.documentElement.clientWidth
      columnLeftRef.current = columnLeft
      strip.style.left = `${-columnLeft}px`
      strip.style.width = `${viewportWidth + drift}px`
      setRange(slotRange(columnLeft, viewportWidth, drift))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(column)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [drift])

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting
    })
    observer.observe(strip)
    return () => observer.disconnect()
  }, [])

  const place = useCallback(() => {
    tileRefs.current.forEach((element, slot) => {
      const x = columnLeftRef.current + tileX(slot)
      element.style.transform = `translate3d(${x}px, ${tileY(slot, phaseRef.current)}px, 0)`
    })
  }, [])

  // New tiles appear with the right position at once.
  useLayoutEffect(place, [place, range])

  useAnimationFrame((_, delta) => {
    if (reducedMotion || !isVisibleRef.current) return
    const frame = Math.min(delta, MAX_FRAME_MS)
    const target = isHoveredRef.current || hasFocusRef.current ? 0 : 1
    speedFactorRef.current += (target - speedFactorRef.current) * (1 - Math.exp(-frame / EASE_MS))
    if (speedFactorRef.current < 0.001) return
    phaseRef.current = (phaseRef.current + (WAVELENGTH * frame * speedFactorRef.current) / (wavePeriod * 1000)) % WAVELENGTH
    place()
  })

  const slots = range ? Array.from({ length: range.last - range.first + 1 }, (_, index) => range.first + index) : []

  return (
    <motion.div
      ref={stripRef}
      data-el="logos__track"
      style={{ x: shift }}
      className="absolute inset-y-0"
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') isHoveredRef.current = true
      }}
      onPointerLeave={() => {
        isHoveredRef.current = false
      }}
      onFocus={() => {
        hasFocusRef.current = true
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) hasFocusRef.current = false
      }}
    >
      {slots.map((slot) => {
        const brand = brands[tileBrand(slot)]
        const setRef = (element: HTMLElement | null) => {
          if (element) tileRefs.current.set(slot, element)
          else tileRefs.current.delete(slot)
        }
        const icon = (
          <div data-el={`logos__item-${brand.slug}-icon`} className="relative size-12">
            {/* Logos are drawn in #181818 on a transparent or white box. Dark theme: invert, and screen drops the white box. */}
            <img
              src={brand.src}
              alt=""
              draggable={false}
              className="absolute max-w-none dark:mix-blend-screen dark:invert"
              style={brand.box}
            />
          </div>
        )
        return brand.href ? (
          <a
            key={slot}
            ref={setRef}
            href={brand.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={brand.name}
            data-el={`logos__item-${brand.slug}`}
            className={`${tileClasses} ${linkClasses}`}
          >
            {icon}
          </a>
        ) : (
          // A div with an inline SVG inside, so it cannot be an <img>.
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
          <div key={slot} ref={setRef} role="img" aria-label={brand.name} data-el={`logos__item-${brand.slug}`} className={tileClasses}>
            {icon}
          </div>
        )
      })}
    </motion.div>
  )
}
