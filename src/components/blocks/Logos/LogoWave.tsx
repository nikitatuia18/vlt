import { useAnimationFrame, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { brands } from './brands'
import { LOOP_LENGTH, slotRange, tilePosition } from './wave'

type LogoWaveProps = {
  /** Speed of the run from right to left, px per second. */
  speed: number
}

/** A frame longer than this (a background tab, a freeze) is counted as this long, so the run does not jump. */
const MAX_FRAME_MS = 100

/**
 * Logo tiles running along the wave from right to left (Figma `logos__track`).
 * The parent is the content column (`logos__track-wrap`, relative); tiles may stick out of it to both sides.
 *
 * The tiles slide along a fixed curve (see wave.ts). After LOOP_LENGTH px the picture repeats exactly,
 * so the offset just wraps around and the run is endless. Positions are written straight to the elements
 * (no React render per frame).
 * Still with `prefers-reduced-motion`; paused while the strip is off screen.
 */
export function LogoWave({ speed }: LogoWaveProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef(new Map<number, HTMLDivElement>())
  const offsetRef = useRef(0)
  const isVisibleRef = useRef(true)
  const reducedMotion = useReducedMotion()
  const [range, setRange] = useState<{ first: number; last: number } | null>(null)

  // Enough tiles for the screen width, measured from the left edge of the column.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measure = () => setRange(slotRange(track.getBoundingClientRect().left, document.documentElement.clientWidth))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting
    })
    observer.observe(track)
    return () => observer.disconnect()
  }, [])

  const place = useCallback(() => {
    tileRefs.current.forEach((element, slot) => {
      const { x, y } = tilePosition(slot, offsetRef.current)
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`
    })
  }, [])

  // New tiles appear with the right position at once.
  useLayoutEffect(place, [place, range])

  useAnimationFrame((_, delta) => {
    if (reducedMotion || !isVisibleRef.current) return
    offsetRef.current = (offsetRef.current + (speed * Math.min(delta, MAX_FRAME_MS)) / 1000) % LOOP_LENGTH
    place()
  })

  const slots = range ? Array.from({ length: range.last - range.first + 1 }, (_, index) => range.first + index) : []

  return (
    <div ref={trackRef} data-el="logos__track" className="absolute inset-0">
      {slots.map((slot) => {
        const { brand: brandIndex } = tilePosition(slot, 0)
        const brand = brands[brandIndex]
        return (
          <div
            key={slot}
            ref={(element) => {
              if (element) tileRefs.current.set(slot, element)
              else tileRefs.current.delete(slot)
            }}
            role="img"
            aria-label={brand.name}
            data-el={`logos__item-${brand.slug}`}
            className="absolute top-0 left-0 isolate grid size-20 place-items-center rounded-pill bg-surface-subtle ring-1 ring-inset ring-border-subtle will-change-transform"
          >
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
          </div>
        )
      })}
    </div>
  )
}
