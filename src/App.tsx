import { lazy, Suspense } from 'react'
import { Cta } from './components/blocks/Cta'
import { Faq } from './components/blocks/Faq'
import { Features } from './components/blocks/Features'
import { Global } from './components/blocks/Global'
import { Hero } from './components/blocks/Hero'
import { Industries } from './components/blocks/Industries'
import { Logos } from './components/blocks/Logos'
import { NextSteps } from './components/blocks/NextSteps'
import { Footer } from './components/ui/Footer'
import { Header } from './components/ui/Header'
import { useSmoothScroll } from './lib/smoothScroll'

// The living UI Kit is loaded only when /ui-kit is opened, so it does not weigh on the site itself.
const UiKitPage = lazy(() => import('./ui-kit/UiKitPage'))

// The page is assembled from blocks (src/components/blocks/*) in the order of the Figma frame.
export default function App() {
  useSmoothScroll()

  if (window.location.pathname.replace(/\/$/, '') === `${import.meta.env.BASE_URL}ui-kit`) {
    return (
      <Suspense fallback={null}>
        <UiKitPage />
      </Suspense>
    )
  }

  return (
    <>
      {/* The first stop of the Tab key: shown only while it has focus; jumps over the header to the content. */}
      <a
        href="#main"
        data-el="skip-link"
        className="type-ui-sm sr-only rounded-pill bg-surface-inverse text-typography-inverse focus:not-sr-only focus:px-4 focus:py-3 focus:fixed focus:top-4 focus:left-4 focus:z-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand"
      >
        Skip to content
      </a>
      <Header currentId="products" />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Hero />
        <Logos />
        <Features />
        <Industries />
        <Global />
        <NextSteps />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  )
}
