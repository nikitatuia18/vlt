import { lazy, Suspense } from 'react'
import { pagePath } from './lib/route'
import { useAnchorLinks, useSmoothScroll } from './lib/smoothScroll'
import HomePage from './pages/HomePage'

// The living UI Kit and the product pages are loaded only when they are opened, so they do not weigh on the home page.
const UiKitPage = lazy(() => import('./ui-kit/UiKitPage'))
const CryptoProcessingPage = lazy(() => import('./pages/crypto-processing/CryptoProcessingPage'))
const InvoicingPage = lazy(() => import('./pages/invoicing/InvoicingPage'))
const RampPage = lazy(() => import('./pages/ramp/RampPage'))

// One page per address: no router library is needed while the pages are few. Pages of products follow `docs/pages.md`.
const pages: Record<string, ReturnType<typeof lazy>> = {
  '/ui-kit': UiKitPage,
  '/crypto-processing': CryptoProcessingPage,
  '/invoicing': InvoicingPage,
  '/ramp': RampPage,
}

export default function App() {
  useSmoothScroll()
  useAnchorLinks()

  const Page = pages[pagePath()]
  if (!Page) return <HomePage />
  return (
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  )
}
