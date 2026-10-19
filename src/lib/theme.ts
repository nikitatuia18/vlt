import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

/*
 * The current theme lives in the `data-theme` attribute of <html>, so CSS can react to it
 * and several toggles on the page stay in sync. The dark palette is not designed yet:
 * until it exists in Figma, switching only sets the attribute.
 */
const listeners = new Set<() => void>()

const readTheme = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => 'light' as Theme)

  const setTheme = (next: Theme) => {
    document.documentElement.dataset.theme = next
    listeners.forEach((listener) => listener())
  }

  return { theme, setTheme }
}
