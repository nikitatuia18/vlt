import { useEffect, useSyncExternalStore } from 'react'
import { motionAllowed } from '../motion/useReveal'

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
 */
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

const readRoot = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

let preference: Theme | null = null
const forced = new Map<symbol, Theme>()

/** A short color fade of the whole page while the theme changes (the rule `theme-fading` is in index.css). */
const FADE_CLASS = 'theme-fading'
const FADE_MS = 800
let fadeTimer: ReturnType<typeof setTimeout> | undefined

/** What the visitor chose; before anybody chose, what <html> shows now. It must be read BEFORE a scene forces its theme. */
const getPreference = (): Theme => (preference ??= readRoot())

const effectiveTheme = (): Theme => [...forced.values()].at(-1) ?? getPreference()

function apply() {
  const root = document.documentElement
  const next = effectiveTheme()
  if (next !== readRoot()) {
    if (motionAllowed()) {
      root.classList.add(FADE_CLASS)
      clearTimeout(fadeTimer)
      fadeTimer = setTimeout(() => root.classList.remove(FADE_CLASS), FADE_MS)
    }
    root.dataset.theme = next
  }
  notify()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readRoot, () => 'light' as Theme)
  const locked = useSyncExternalStore(subscribe, () => forced.size > 0, () => false)

  const setTheme = (next: Theme) => {
    preference = next
    apply()
  }

  return { theme, locked, setTheme }
}

/**
 * Asks for a theme for the time a scene lasts (`null`: nothing asked). The toggle is locked meanwhile, and the site
 * returns to the visitor's choice afterwards. The Industries block uses it: its dark scenes darken the whole page.
 */
export function useForcedTheme(theme: Theme | null) {
  useEffect(() => {
    if (!theme) return
    const owner = Symbol('forced-theme')
    getPreference()
    forced.set(owner, theme)
    apply()
    return () => {
      forced.delete(owner)
      apply()
    }
  }, [theme])
}
