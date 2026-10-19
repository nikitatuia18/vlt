import { useLayoutEffect, useState, type RefObject } from 'react'

/** Width of the banner in the design (the column of 1440 px minus 2 x 41 px). The picture and the badges are drawn for it. */
const BANNER_WIDTH = 1358
/** Width of the picture with the badges in the design: the stage of the person and the three badges. */
const STAGE_WIDTH = 666
/** In the stacked layout the picture is never wider than this (px). */
const MAX_STACKED_STAGE = 520

/** Same breakpoint as `desktop` in styles/tokens.css. */
const DESKTOP_QUERY = '(min-width: 80rem)'

/**
 * Scale of the picture with the badges (`--s`). Wide screens: the composition of the design scaled with the banner
 * (banner width / 1358). Below 1280 px the picture stands under the text and is scaled to its own width instead.
 */
export function useCtaScale(ref: RefObject<HTMLElement | null>) {
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const desktop = window.matchMedia(DESKTOP_QUERY)
    const update = () => {
      const width = element.clientWidth
      const next = desktop.matches ? Math.min(1, width / BANNER_WIDTH) : Math.min(width, MAX_STACKED_STAGE) / STAGE_WIDTH
      setScale((previous) => (previous === next ? previous : next))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    desktop.addEventListener('change', update)
    return () => {
      observer.disconnect()
      desktop.removeEventListener('change', update)
    }
  }, [ref])

  return scale
}
