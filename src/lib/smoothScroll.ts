import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { useEffect } from 'react'

/**
 * How fast the page catches up with the wheel: the share of the remaining distance covered each frame.
 * 0.1 is the library default; 0.14 was the first try (too direct), 0.08 is a softer, longer glide. Tuned with the designer.
 */
const SMOOTHNESS = 0.08

// The running instance, so that code which changes the height of the page above the viewer can keep the viewer in place.
let activeLenis: Lenis | null = null

/**
 * Moves the scroll position by `delta` px at once, without any glide, and keeps the smooth scroll in step (its internal target moves
 * too, otherwise it would glide back). For a layout change above the viewer: the page gets shorter by N px, the viewer must not jump.
 */
export function shiftScroll(delta: number) {
  if (!activeLenis) {
    window.scrollBy(0, delta)
    return
  }
  // Jump to the shifted place at once (this also stops the running glide), then go on gliding to the shifted target:
  // a flick of the wheel in progress keeps its remaining way.
  const target = activeLenis.targetScroll + delta
  const here = activeLenis.animatedScroll + delta
  activeLenis.scrollTo(here, { immediate: true, force: true })
  if (Math.abs(target - here) > 0.5) activeLenis.scrollTo(target, { lerp: SMOOTHNESS, force: true })
}

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
      activeLenis = lenis
    }
    sync()
    reduced.addEventListener('change', sync)
    return () => {
      reduced.removeEventListener('change', sync)
      lenis?.destroy()
      activeLenis = null
    }
  }, [])
}
