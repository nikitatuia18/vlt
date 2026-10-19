import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { useEffect } from 'react'

/**
 * How fast the page catches up with the wheel: the share of the remaining distance covered each frame.
 * 0.1 is the library default (rather floaty); 0.14 is a gentle smoothing that still feels direct. Tuned with the designer.
 */
const SMOOTHNESS = 0.14

/**
 * Smooth (eased) wheel scrolling over the whole site. The scroll position stays the native one (`window.scrollY`),
 * so everything that reads it (the pinned section, the header, scroll-linked motion) works as before.
 * Touch screens keep their native inertia. With `prefers-reduced-motion` the page scrolls as usual.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let lenis: Lenis | null = null

    const sync = () => {
      if (reduced.matches) {
        lenis?.destroy()
        lenis = null
      } else if (!lenis) {
        lenis = new Lenis({ lerp: SMOOTHNESS, smoothWheel: true, autoRaf: true })
      }
    }
    sync()
    reduced.addEventListener('change', sync)
    return () => {
      reduced.removeEventListener('change', sync)
      lenis?.destroy()
    }
  }, [])
}
