import { Cta } from '../components/blocks/Cta'
import { Faq } from '../components/blocks/Faq'
import { Features } from '../components/blocks/Features'
import { Global } from '../components/blocks/Global'
import { Hero } from '../components/blocks/Hero'
import { Industries } from '../components/blocks/Industries'
import { Logos } from '../components/blocks/Logos'
import { NextSteps } from '../components/blocks/NextSteps'
import { PageShell } from './PageShell'

// The home page is assembled from blocks (src/components/blocks/*) in the order of the Figma frame.
export default function HomePage() {
  return (
    <PageShell>
      <Hero />
      <Logos />
      <Features />
      <Industries />
      <Global />
      <NextSteps />
      <Faq />
      <Cta />
    </PageShell>
  )
}
