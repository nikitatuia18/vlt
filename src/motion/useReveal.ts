import { useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { REVEAL_ENABLED } from './tokens'

const TEST_FLAG = 'velant-reveal'

const flagOff = (() => {
  try {
    return window.localStorage.getItem(TEST_FLAG) === 'off'
  } catch {
    return false
  }
})()

/** For code outside React: may the page animate at all (not switched off, no request for less motion)? */
export const motionAllowed = () =>
  REVEAL_ENABLED && !flagOff && !(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

/** True while the appearance animations play: not switched off, and the visitor has not asked for less motion. */
export function useRevealOn() {
  const reduced = useReducedMotion()
  return REVEAL_ENABLED && !flagOff && !reduced
}

// Texts jump when the font arrives after they have appeared, so the first screen waits for the fonts (but not for long).
const fontsReady: Promise<void> =
  typeof document !== 'undefined' && document.fonts
    ? Promise.race([document.fonts.ready.then(() => undefined), new Promise<void>((resolve) => setTimeout(resolve, 1500))])
    : Promise.resolve()
let fontsAreReady = false
void fontsReady.then(() => {
  fontsAreReady = true
})

/** False until the fonts are loaded (at most 1.5 s). */
export function useFontsReady() {
  const [ready, setReady] = useState(fontsAreReady)
  useEffect(() => {
    if (ready) return
    let alive = true
    void fontsReady.then(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [ready])
  return ready
}
