import { useFontsReady } from './useReveal'

/* When an element appears: by the flag of its block (`when`), after the fonts (`atLoad`), or on coming into view. */

const viewport = { once: true, amount: 0.2, margin: '0px 0px -8% 0px' } as const
/** For things at the very end of the page (the lower bar of the footer): the page cannot be scrolled further, so no margin. */
const viewportAtPageEnd = { once: true, amount: 0.2, margin: '0px' } as const

/** What plays the appearance: `when` (a flag set by the block), `atLoad` (once the fonts are ready), or, by default, coming into view. */
export type Trigger = { when?: boolean; atLoad?: boolean; /** The element is at the very end of the page: it must appear even though it cannot come above the bottom margin. */ atPageEnd?: boolean }

export function useTriggerProps({ when, atLoad, atPageEnd }: Trigger) {
  const fonts = useFontsReady(when === undefined && !!atLoad)
  if (when !== undefined) return { initial: 'hidden', animate: when ? 'shown' : 'hidden' } as const
  if (atLoad) return { initial: 'hidden', animate: fonts ? 'shown' : 'hidden' } as const
  return { initial: 'hidden', whileInView: 'shown', viewport: atPageEnd ? viewportAtPageEnd : viewport } as const
}
