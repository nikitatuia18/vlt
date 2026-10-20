/** The `desktop` breakpoint of tokens.css (80rem), for code that needs it in JS (CSS uses the `desktop:` variant). */
export const DESKTOP_QUERY = '(min-width: 80rem)'

/** One-time read of "the visitor asked for less motion" (code outside React; components can use `useReducedMotion` of motion). */
export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
