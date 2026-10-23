/** The base of the site: `/vlt/` on GitHub Pages, `/` locally. (The tests import the link lists in Node, where Vite's `env` is absent.) */
const base = () => import.meta.env?.BASE_URL ?? '/'

/** The path of the page without the base of the site and without a trailing slash. */
export const pagePath = () => window.location.pathname.slice(base().length - 1).replace(/\/$/, '')

/** An address inside the site, for links: `href('crypto-processing')`, `href('', 'products')` (a block of the home page). */
export const href = (path: string, hash = '') => `${base()}${path}${hash ? `#${hash}` : ''}`
