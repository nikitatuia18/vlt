import { themeSwitch } from '../motion/tokens'
import { holdScroll } from './smoothScroll'

/*
 * The change of the theme (docs/ui-kit.md, section 9): ONE circle spreads from a point (the toggle in the header, or the middle of the
 * screen on an Industries scene). Inside the circle the page is already in the NEW theme (alive), outside it is still the old one;
 * the circle grows until it fills the whole page.
 *
 * It is done with the View Transitions API: the browser keeps a picture of the old page and shows the new, live page through a circle
 * (`::view-transition-new(root)` with an animated `clip-path`). Because the old part is a picture, the scroll is held while it runs.
 * Where the API is missing (or motion is off), the theme changes at once.
 */

type Theme = 'light' | 'dark'

export type RippleOrigin = { x: number; y: number }

type RippleRequest = {
  /** Where the circle starts (px of the viewport). */
  origin: RippleOrigin
  /** The theme that is wanted right now (it may change while the circle runs). */
  wanted: () => Theme
  /** The theme that is on the page right now. */
  current: () => Theme
  /** Puts the theme on the page (and tells everybody who listens). */
  flip: (theme: Theme) => void
}

/** Whether the circle can be shown here at all; if not, the theme changes at once. */
export const canRipple = () => typeof document !== 'undefined' && typeof document.startViewTransition === 'function'

let running = false

/**
 * Runs the circle for a change of theme. One at a time: a request made while it runs is picked up after the run
 * (if the page still differs from what is wanted, one more circle follows).
 */
export async function playRipple({ origin, wanted, current, flip }: RippleRequest) {
  if (running) return
  running = true
  const root = document.documentElement
  const release = holdScroll()
  root.classList.add('theme-ripple')
  try {
    while (wanted() !== current()) {
      const { innerWidth: width, innerHeight: height } = window
      // The farthest corner of the screen from the origin: the circle must reach it.
      const reach = Math.hypot(Math.max(origin.x, width - origin.x), Math.max(origin.y, height - origin.y))

      // The old page is photographed, the callback puts the new theme on the (live) page, and the new page appears through the circle.
      // (Inside the callback the page is not drawn: no requestAnimationFrame there, it would never come and the transition would time out.)
      const transition = document.startViewTransition(async () => {
        flip(wanted())
        await Promise.resolve() // let the listeners (React) finish their update before the new page is photographed
      })
      await transition.ready
      root.animate(
        { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${reach}px at ${origin.x}px ${origin.y}px)`] },
        { duration: themeSwitch.duration * 1000, easing: themeSwitch.ease, fill: 'forwards', pseudoElement: '::view-transition-new(root)' },
      )
      await transition.finished
    }
  } catch {
    // The browser skipped the transition (a hidden tab, another transition): the callback has run anyway, only the circle is missing.
  } finally {
    if (wanted() !== current()) flip(wanted())
    root.classList.remove('theme-ripple')
    release()
    running = false
  }
}
