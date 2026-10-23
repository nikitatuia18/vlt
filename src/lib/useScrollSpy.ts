import { useEffect, useState } from 'react'

/** Where the "reading line" stands, as a share of the screen height from the top: the block on it is the current one. */
const READING_LINE = 0.4

/**
 * The `id` of the block (from `ids`) that is on the reading line while the page scrolls; `undefined` while none is (the first screen,
 * the strip of logos). Used by the header to mark the current menu item.
 */
export function useScrollSpy(ids: readonly string[]) {
  const [current, setCurrent] = useState<string>()

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const line = window.innerHeight * READING_LINE
      let found: string | undefined
      for (const id of ids) {
        const rect = document.getElementById(id)?.getBoundingClientRect()
        if (rect && rect.top <= line && rect.bottom > line) found = id
      }
      setCurrent(found)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [ids])

  return current
}
