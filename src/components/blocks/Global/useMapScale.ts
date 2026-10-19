import { useLayoutEffect, useState, type RefObject } from 'react'

/** From this width (px) the map lies behind the text like in the design; below it the map is a block above the text. */
export const WIDE_LAYOUT = 1600

/** The map artboard of the design is 1935 px wide inside a 2560 px frame. */
const FRAME = 2560
const ARTBOARD = 1935

/** Cards are never scaled below this, so their text stays readable on small screens. */
const MIN_CARD_SCALE = 0.6

/**
 * Scale of the map artboard (`s`) and of its cards (`p`), written to the section as CSS variables `--s` and `--p`.
 * Wide layout: the map keeps the proportion of the design frame (width / 2560). Below it the map fits the width of the screen.
 * Cards follow the map but not below MIN_CARD_SCALE.
 */
export function useMapScale(ref: RefObject<HTMLElement | null>) {
  const [scale, setScale] = useState({ s: 1, p: 1 })

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const update = () => {
      const width = element.clientWidth
      const s = Math.min(1, width >= WIDE_LAYOUT ? width / FRAME : width / ARTBOARD)
      const p = Math.min(1, Math.max(s, MIN_CARD_SCALE))
      setScale((previous) => (previous.s === s && previous.p === p ? previous : { s, p }))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return scale
}
