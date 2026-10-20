import { useEffect, useRef, useSyncExternalStore } from 'react'
import { motionAllowed } from '../motion/useReveal'
import { canRipple, playRipple, type RippleOrigin } from './themeRipple'

export type Theme = 'light' | 'dark'

/*
 * The current theme lives in the `data-theme` attribute of <html>, so CSS can react to it
 * and several toggles on the page stay in sync.
 *
 * Two layers decide the theme:
 *   - the PREFERENCE: what the visitor chose with the toggle;
 *   - FORCED themes: a block can ask for a theme while its scene is on (`useForcedTheme`), for example the dark scenes
 *     of the Industries block. While any is on, the toggle is locked; when the last one ends, the site goes back to the preference.
 * The theme on <html> is the latest forced one, or else the preference.
 *
 * A change of the theme is shown as a ripple that spreads from a point (themeRipple.ts); without motion (reduced motion, the switch-off flag)
 * it is instant.
 */
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

const readRoot = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

let preference: Theme | null = null
const forced = new Map<symbol, Theme>()

/** What the visitor chose; before anybody chose, what <html> shows now. It must be read BEFORE a scene forces its theme. */
const getPreference = (): Theme => (preference ??= readRoot())

const effectiveTheme = (): Theme => [...forced.values()].at(-1) ?? getPreference()

/** The color of the ripple's glowing edge when nothing special is asked: the brand color. */
const BRAND_EDGE = 'var(--color-surface-brand-default)'

/** Where a ripple starts when nobody says: the toggle of the header, or the middle of the screen. */
function defaultOrigin(): RippleOrigin {
  const toggle = document.querySelector('[data-el="header__theme-toggle"]')?.getBoundingClientRect()
  return toggle && toggle.width > 0 ? { x: toggle.left + toggle.width / 2, y: toggle.top + toggle.height / 2 } : { x: window.innerWidth / 2, y: window.innerHeight / 2 }
}

/**
 * Puts the theme on the page. For this one moment (until the styles have settled) all transitions are off, so that the colors that
 * some blocks fade by themselves do not start to play on top of the change.
 */
function putTheme(next: Theme) {
  const root = document.documentElement
  if (next !== readRoot()) {
    root.classList.add('theme-flip')
    root.dataset.theme = next
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-flip')))
  }
  notify()
}

/** Brings the page to the wanted theme: with the ripple, or at once when motion is not allowed. */
function apply(edge: string = BRAND_EDGE, origin: RippleOrigin = defaultOrigin()) {
  if (effectiveTheme() === readRoot()) {
    notify()
    return
  }
  if (!motionAllowed() || !canRipple()) {
    putTheme(effectiveTheme())
    return
  }
  notify() // the toggle locks at once, the page follows under the circle
  void playRipple({ origin, edge, wanted: effectiveTheme, current: readRoot, flip: putTheme })
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readRoot, () => 'light' as Theme)
  const locked = useSyncExternalStore(subscribe, () => forced.size > 0, () => false)

  /** `origin`: where the ripple starts (px); by default at the toggle of the header. */
  const setTheme = (next: Theme, origin?: RippleOrigin) => {
    preference = next
    apply(BRAND_EDGE, origin)
  }

  return { theme, locked, setTheme }
}

type ForcedThemeOptions = {
  /** Color of the ripple's glowing edge when the scene starts (a CSS color, for example the glow token of the scene). */
  edge?: string
  /** Where the ripple starts, as shares of the viewport (0.5, 0.5 is the middle: where the open card of Industries stands). Default: the toggle. */
  origin?: { x: number; y: number }
}

/**
 * Asks for a theme for the time a scene lasts (`null`: nothing asked). The toggle is locked meanwhile, and the site
 * returns to the visitor's choice afterwards. The Industries block uses it: its dark scenes darken the whole page.
 */
export function useForcedTheme(theme: Theme | null, { edge, origin }: ForcedThemeOptions = {}) {
  // The edge color is read when the scene starts; a change of it alone (one dark scene to another) must not end the scene.
  const edgeRef = useRef(edge)
  const originRef = useRef(origin)
  useEffect(() => {
    edgeRef.current = edge
    originRef.current = origin
  }, [edge, origin])
  const sceneOrigin = (): RippleOrigin | undefined =>
    originRef.current ? { x: originRef.current.x * window.innerWidth, y: originRef.current.y * window.innerHeight } : undefined

  useEffect(() => {
    if (!theme) return
    const owner = Symbol('forced-theme')
    getPreference()
    forced.set(owner, theme)
    apply(edgeRef.current, sceneOrigin())
    return () => {
      forced.delete(owner)
      apply(undefined, sceneOrigin())
    }
  }, [theme])
}
