import { themeSwitch } from '../motion/tokens'

/*
 * The "ripple" of the theme change (docs/ui-kit.md, section 9): from one point (the toggle in the header, or the middle of the open card
 * of an Industries scene) a circle of the color of the NEW theme spreads over the page like a wave of light, with a glowing edge.
 * When it covers the whole screen, the theme changes under it; then a hole opens from the same point (again with a glowing edge)
 * and shows the new theme: the circle dissolves.
 *
 * It is one fixed layer with a radial gradient; the radius is animated (a registered CSS property). The layer is trivial to draw,
 * and the page below is alive (scrolling goes on) and recalculates its styles while it is covered.
 */

type Theme = 'light' | 'dark'

export type RippleOrigin = { x: number; y: number }

type RippleRequest = {
  /** Where the wave starts (px of the viewport). */
  origin: RippleOrigin
  /** Color of the glowing edge of the wave (any CSS color, usually a token as `var(--...)`). */
  edge: string
  /** The theme that is wanted right now (it may change while the ripple runs). */
  wanted: () => Theme
  /** The theme that is on the page right now. */
  current: () => Theme
  /** Puts the theme on the page (and tells everybody who listens). */
  flip: (theme: Theme) => void
}

/** Page color of each theme: the neutral primitives that the semantic `surface-page` token points to. */
const pageColor: Record<Theme, string> = { light: 'var(--primitive-neutral-50)', dark: 'var(--primitive-neutral-950)' }

const RADIUS = '--ripple-radius'

let layer: HTMLDivElement | null = null
let registered = false
let running = false

/** The radius is an animated custom property: it has to be registered as a length (otherwise it would jump instead of grow). */
function canAnimateRadius() {
  if (registered) return true
  try {
    CSS.registerProperty({ name: RADIUS, syntax: '<length>', inherits: false, initialValue: '0px' })
    registered = true
  } catch (error) {
    // "Already registered" (the module was loaded again) is fine; anything else means the browser cannot do it.
    registered = error instanceof DOMException && error.name === 'InvalidModificationError'
  }
  return registered
}

/** Whether the ripple can run here at all; if not, the theme changes at once. */
export const canRipple = () => typeof CSS !== 'undefined' && 'registerProperty' in CSS && canAnimateRadius()

const frames = (count: number) =>
  new Promise<void>((resolve) => {
    const step = (left: number) => (left === 0 ? resolve() : requestAnimationFrame(() => step(left - 1)))
    step(count)
  })

function ensureLayer() {
  if (layer) return layer
  const element = document.createElement('div')
  element.dataset.el = 'theme-ripple'
  element.setAttribute('aria-hidden', 'true')
  element.style.cssText = 'position:fixed;inset:0;z-index:100;pointer-events:none;display:none'
  document.body.append(element)
  layer = element
  return element
}

/**
 * The wave on its way out: the solid color inside, a glowing edge, then nothing. `glow` is the width of the soft edge.
 * (Gradient stops: the color up to the edge, the edge color at the radius, transparent `glow` px further.)
 */
const coverGradient = (origin: RippleOrigin, bg: string, edge: string, glow: number) =>
  `radial-gradient(circle at ${origin.x}px ${origin.y}px, ${bg} 0, ${bg} calc(var(${RADIUS}) - ${glow * 0.6}px), ${edge} var(${RADIUS}), transparent calc(var(${RADIUS}) + ${glow}px))`

/** The hole that opens: nothing inside, a glowing edge, then the solid color again. */
const openGradient = (origin: RippleOrigin, bg: string, edge: string, glow: number) =>
  `radial-gradient(circle at ${origin.x}px ${origin.y}px, transparent 0, transparent calc(var(${RADIUS}) - ${glow}px), ${edge} var(${RADIUS}), ${bg} calc(var(${RADIUS}) + ${glow * 0.6}px))`

/**
 * Runs the ripple for a change of theme. One at a time: a request made while it runs is picked up at the moment of the
 * change (the theme that is wanted by then is the one that is put on) and after the run (if the page still differs from what is wanted).
 */
export async function playRipple({ origin, edge, wanted, current, flip }: RippleRequest) {
  if (running) return
  running = true
  const element = ensureLayer()
  try {
    while (wanted() !== current()) {
      const { innerWidth: width, innerHeight: height } = window
      const glow = themeSwitch.glow
      // The farthest corner of the screen from the origin: the wave must reach it.
      const reach = Math.hypot(Math.max(origin.x, width - origin.x), Math.max(origin.y, height - origin.y))
      const bg = pageColor[wanted()]

      // 1. The circle spreads and covers the screen.
      element.style.setProperty(RADIUS, '0px')
      element.style.backgroundImage = coverGradient(origin, bg, edge, glow)
      element.style.display = 'block'
      await element.animate(
        [{ [RADIUS]: '0px' }, { [RADIUS]: `${reach + glow}px` }],
        { duration: themeSwitch.cover * 1000, easing: themeSwitch.easeCover, fill: 'forwards' },
      ).finished

      // 2. Under the circle the theme changes (and the page recalculates its styles; nobody sees it).
      flip(wanted())
      element.style.backgroundImage = openGradient(origin, pageColor[current()], edge, glow)
      element.getAnimations().forEach((animation) => animation.cancel())
      element.style.setProperty(RADIUS, '0px')
      await frames(themeSwitch.settleFrames)

      // 3. A hole opens from the same point: the circle dissolves and shows the new theme.
      await element.animate(
        [{ [RADIUS]: '0px' }, { [RADIUS]: `${reach + glow * 2}px` }],
        { duration: themeSwitch.reveal * 1000, easing: themeSwitch.easeReveal, fill: 'forwards' },
      ).finished
      element.style.display = 'none'
      element.getAnimations().forEach((animation) => animation.cancel())
    }
  } finally {
    element.style.display = 'none'
    running = false
  }
}
