import { lazy, Suspense } from 'react'
import { useSmoothScroll } from './lib/smoothScroll'
import HomePage from './pages/HomePage'

// The living UI Kit and the product pages are loaded only when they are opened, so they do not weigh on the home page.
const UiKitPage = lazy(() => import('./ui-kit/UiKitPage'))
const CryptoProcessingPage = lazy(() => import('./pages/crypto-processing/CryptoProcessingPage'))

/** The path of the page without the base of the site (`/vlt/` on GitHub Pages) and without a trailing slash. */
const pagePath = () => window.location.pathname.slice(import.meta.env.BASE_URL.length - 1).replace(/\/$/, '')

// One page per address: no router library is needed while the pages are few. Pages of products follow `docs/pages.md`.
const pages: Record<string, ReturnType<typeof lazy>> = {
  '/ui-kit': UiKitPage,
  '/crypto-processing': CryptoProcessingPage,
}

export default function App() {
  useSmoothScroll()

  const Page = pages[pagePath()]
  if (!Page) return <HomePage />
  return (
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  )
}
