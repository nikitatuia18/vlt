import { lazy, Suspense } from 'react'
import { Features } from './components/blocks/Features'
import { Global } from './components/blocks/Global'
import { Header } from './components/blocks/Header'
import { Hero } from './components/blocks/Hero'
import { Industries } from './components/blocks/Industries'
import { Logos } from './components/blocks/Logos'
import { NextSteps } from './components/blocks/NextSteps'

// The living UI Kit is loaded only when /ui-kit is opened, so it does not weigh on the site itself.
const UiKitPage = lazy(() => import('./ui-kit/UiKitPage'))

// The page is assembled from blocks (src/components/blocks/*) in the order of the Figma frame.
export default function App() {
  if (window.location.pathname === '/ui-kit') {
    return (
      <Suspense fallback={null}>
        <UiKitPage />
      </Suspense>
    )
  }

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Logos />
        <Features />
        <Industries />
        <Global />
        <NextSteps />
      </main>
    </>
  )
}
