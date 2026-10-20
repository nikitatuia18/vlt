import { themeSwitch } from '../motion/tokens'

/*
 * The "curtain" of the theme change (docs/ui-kit.md, section 9): one fixed layer moves from the top of the screen to the bottom
 * and covers the page with the color of the NEW theme, the theme changes under it, and the curtain goes on down and opens the page.
 *
 * It moves only with `transform` (the compositor, not the main thread), so the animation stays smooth even while the page below
 * recalculates all its styles; the page below is alive (scrolling goes on), unlike a screenshot of it.
 *
 * Parts of the layer, from the top: the upper edge (the color fades in), the solid part (a screen high), the lower edge (the color
 * fades out). A thin glowing line sits at the outer end of both edges; its color is given by the caller (the scene's glow color).
 */

type Theme = 'light' | 'dark'

type CurtainRequest = {
  /** Color of the glowing line at the edges (any CSS color, usually a token as `var(--...)`). */
  edge: string
  /** The theme that is wanted right now (it may change while the curtain runs). */
  wanted: () => Theme
  /** The theme that is on the page right now. */
  current: () => Theme
  /** Puts the theme on the page (and tells everybody who listens). */
  flip: (theme: Theme) => void
}

/** Page color of each theme: the neutral primitives that the semantic `surface-page` token points to. */
const pageColor: Record<Theme, string> = { light: 'var(--primitive-neutral-50)', dark: 'var(--primitive-neutral-950)' }

let curtain: HTMLDivElement | null = null
let running = false

const frames = (count: number) =>
  new Promise<void>((resolve) => {
    const step = (left: number) => (left === 0 ? resolve() : requestAnimationFrame(() => step(left - 1)))
    step(count)
  })

const part = (height: string, background: string) => {
  const element = document.createElement('div')
  element.style.cssText = `height:${height};background:${background};flex:none;position:relative`
  return element
}

/** A thin glowing line (the leading edge of the curtain). */
const glowLine = (position: 'top' | 'bottom') => {
  const line = document.createElement('div')
  line.dataset.part = `line-${position}`
  line.style.cssText =
    `position:absolute;left:0;right:0;${position}:0;height:2px;` +
    'background:linear-gradient(90deg,transparent,var(--curtain-edge) 12%,var(--curtain-edge) 88%,transparent);' +
    'box-shadow:0 0 36px 10px color-mix(in srgb,var(--curtain-edge) 55%,transparent)'
  return line
}

function ensureCurtain() {
  if (curtain) return curtain
  const root = document.createElement('div')
  root.dataset.el = 'theme-curtain'
  root.setAttribute('aria-hidden', 'true')
  root.style.cssText =
    'position:fixed;left:0;top:0;width:100%;z-index:100;pointer-events:none;display:none;flex-direction:column;will-change:transform'
  const upper = part('var(--curtain-edge-height)', 'linear-gradient(to bottom,transparent,var(--curtain-bg))')
  upper.append(glowLine('top'))
  const solid = part('var(--curtain-screen)', 'var(--curtain-bg)')
  const lower = part('var(--curtain-edge-height)', 'linear-gradient(to bottom,var(--curtain-bg),transparent)')
  lower.append(glowLine('bottom'))
  root.append(upper, solid, lower)
  document.body.append(root)
  curtain = root
  return root
}

/**
 * Runs the curtain for a change of theme. One curtain at a time: a request made while it runs is picked up at the moment of the
 * change (the theme that is wanted by then is the one that is put on) and after the run (if the page still differs from what is wanted).
 */
export async function playCurtain({ edge, wanted, current, flip }: CurtainRequest) {
  if (running) return
  running = true
  const element = ensureCurtain()
  try {
    while (wanted() !== current()) {
      const screen = window.innerHeight
      const edgeHeight = Math.min(themeSwitch.edge, Math.round(screen * 0.35))
      const total = screen + 2 * edgeHeight
      element.style.setProperty('--curtain-screen', `${screen}px`)
      element.style.setProperty('--curtain-edge-height', `${edgeHeight}px`)
      element.style.setProperty('--curtain-edge', edge)
      element.style.setProperty('--curtain-bg', pageColor[wanted()])
      element.style.transform = `translate3d(0,${-total}px,0)`
      element.style.display = 'flex'

      // 1. The curtain comes down and covers the screen.
      await element.animate(
        [{ transform: `translate3d(0,${-total}px,0)` }, { transform: `translate3d(0,${-edgeHeight}px,0)` }],
        { duration: themeSwitch.cover * 1000, easing: themeSwitch.easeCover, fill: 'forwards' },
      ).finished

      // 2. Under the curtain the theme changes (and the page recalculates its styles; the curtain stands meanwhile).
      flip(wanted())
      await frames(themeSwitch.settleFrames)

      // 3. The curtain goes on down and opens the new theme.
      await element.animate(
        [{ transform: `translate3d(0,${-edgeHeight}px,0)` }, { transform: `translate3d(0,${screen}px,0)` }],
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
