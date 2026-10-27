import type { ReactNode } from 'react'
import { Cta, type CtaProps } from '../components/blocks/Cta/Cta'
import { Faq, type FaqProps } from '../components/blocks/Faq/Faq'
import { Industries, type IndustriesProps } from '../components/blocks/Industries/Industries'
import { Logos } from '../components/blocks/Logos'
import { ProductHero, type ProductHeroProps } from '../components/blocks/ProductHero'
import { WorksWith, type WorksWithProps } from '../components/blocks/WorksWith/WorksWith'
import { usePageMeta } from '../lib/usePageMeta'
import { PageShell } from './PageShell'

/** Everything a product page says. The texts live in `src/pages/<product>/content.ts` (written with the copywriter, `docs/pages.md`). */
export type ProductContent = {
  meta: { title: string; description: string }
  hero: Omit<ProductHeroProps, 'media'>
  worksWith: WorksWithProps
  industries: IndustriesProps
  faq: FaqProps
  cta: CtaProps
}

/**
 * The page of one product: the hero, the logos, the blocks about the product itself (`sections`, two for now: the pictures
 * and micro interfaces that explain it), "Works great with" (the other products), then the blocks shared with the home page with the texts of the product.
 */
export function ProductPage({ content, heroMedia, heroMediaClassName, sections }: { content: ProductContent; heroMedia?: ReactNode; heroMediaClassName?: string; sections: ReactNode }) {
  usePageMeta(content.meta)
  return (
    <PageShell>
      <ProductHero {...content.hero} media={heroMedia} mediaClassName={heroMediaClassName} />
      <Logos />
      {sections}
      <WorksWith {...content.worksWith} />
      <Industries {...content.industries} />
      <Faq {...content.faq} />
      <Cta {...content.cta} />
    </PageShell>
  )
}
