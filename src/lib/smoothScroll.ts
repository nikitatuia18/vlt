import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { useEffect } from 'react'

/**
 * How fast the page catches up with the wheel: the share of the remaining distance covered each frame.
 * 0.1 is the library default; 0.14 was the first try (too direct), 0.08 was too long a glide. 0.11 is a little quicker than the default,
 * still smooth. Tuned with the designer.
 */
const SMOOTHNESS = 0.11

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
 * Scrolls to the block with this `id` (glides with the smooth scroll; at once with reduced motion or when `immediate`).
 * The block stops under the header (the `scroll-padding-top` of the page, which the smooth scroll and the native fallback both follow).
 * The page changes its height on the way (the globe block gets shorter once its big animation has played), so the block is not where it
 * was when the glide began: when the page stands still the place is checked and the last stretch is made again (up to 3 times).
 * Returns false when there is no such block.
 */
export function scrollToSection(id: string, immediate = false, attempt = 0): boolean {
  const target = document.getElementById(id)
  if (!target) return false
  if (!activeLenis) {
    target.scrollIntoView({ block: 'start' })
    return true
  }
  activeLenis.scrollTo(target, immediate ? { immediate: true, force: true } : { duration: attempt ? 0.8 : 1.4, force: true })
  if (attempt < 3) {
    // Not the "complete" callback of the glide: a block that changes the height of the page on the way (shiftScroll) replaces the glide,
    // and then the callback never comes. So: wait until the page stands still and look where the block is.
    const check = (waited: number) => {
      if (activeLenis?.isScrolling && waited < 4000) {
        window.setTimeout(() => check(waited + 100), 100)
        return
      }
      const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
      if (Math.abs(target.getBoundingClientRect().top - padding) > 4) scrollToSection(id, immediate, attempt + 1)
    }
    window.setTimeout(() => check(0), 200)
  }
  return true
}

/**
 * Links to a block of the page you are on (`/#faq`, `#products`) glide to it instead of jumping; the address gets the hash.
 * Arriving on a page with a hash (a menu item clicked on another page) scrolls to the block once the fonts are in, so that the
 * layout does not move afterwards. Links to other pages and the skip link are left to the browser.
 */
export function useAnchorLinks() {
  useEffect(() => {
    const samePage = (url: URL) => url.origin === window.location.origin && url.pathname.replace(/\/$/, '') === window.location.pathname.replace(/\/$/, '')

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null
      if (!link || link.target === '_blank') return
      const url = new URL(link.href, window.location.href)
      if (!samePage(url) || url.hash.length < 2 || url.hash === '#main') return
      if (!scrollToSection(decodeURIComponent(url.hash.slice(1)))) return
      event.preventDefault()
      window.history.replaceState(null, '', url.hash)
    }
    document.addEventListener('click', onClick)

    const arrivedAt = window.location.hash.slice(1)
    if (arrivedAt) void document.fonts.ready.then(() => scrollToSection(decodeURIComponent(arrivedAt), true))

    return () => document.removeEventListener('click', onClick)
  }, [])
}

const SCROLL_KEYS =new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])

/**
 * Holds the page where it is (for the time of the theme change, which shows the old page as a picture): the glide of the smooth scroll
 * stops at once and the wheel, the finger and the keys do not scroll. Returns the function that lets the page go again.
 * (No `overflow: hidden`: the scrollbar would disappear and the page would shift by its width.)
 * A box marked `data-lenis-prevent` (the open menu) keeps its own scroll: the smooth scroll ignores it too.
 */
export function holdScroll() {
  if (activeLenis) activeLenis.scrollTo(activeLenis.animatedScroll, { immediate: true, force: true })
  const block = (event: Event) => {
    if (event.target instanceof Element && event.target.closest('[data-lenis-prevent]')) return
    event.preventDefault()
    event.stopImmediatePropagation()
  }
  const blockKey = (event: KeyboardEvent) => {
    if (SCROLL_KEYS.has(event.key) && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) block(event)
  }
  // On the capture phase of the window: before the smooth scroll (and anyone else) sees the event.
  window.addEventListener('wheel', block, { passive: false, capture: true })
  window.addEventListener('touchmove', block, { passive: false, capture: true })
  window.addEventListener('keydown', blockKey, { capture: true })
  return () => {
    window.removeEventListener('wheel', block, { capture: true })
    window.removeEventListener('touchmove', block, { capture: true })
    window.removeEventListener('keydown', blockKey, { capture: true })
  }
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
