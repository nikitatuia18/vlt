import cornerDot from '../../assets/decor/corner-dot.svg'
import { Icon } from './Icon'

type CornerDotsProps = {
  /** Which two corners of the parent get a dot: the top ones or the bottom ones. */
  edge: 'top' | 'bottom'
  /** Block name for the `data-el` of the dots: `{block}__deco-corner-{tl|tr|bl|br}` (Figma layer names). */
  block: string
}

// A dot is 5 px. The vertical lines of the column run on the inner 1 px of the left and right edges, so the dots
// are centered on that pixel (2 px outside the edge). The horizontal line is the 1 px border just outside the box
// (below it for the bottom corners), so the dots are centered on it (3 px outside the edge).
const positions = {
  top: { left: '-top-[3px] -left-[2px]', right: '-top-[3px] -right-[2px]' },
  bottom: { left: '-bottom-[3px] -left-[2px]', right: '-right-[2px] -bottom-[3px]' },
} as const

const names = { top: { left: 'tl', right: 'tr' }, bottom: { left: 'bl', right: 'br' } } as const

/**
 * Two small dots on the corners of the nearest positioned parent, exactly where the column lines meet a horizontal line.
 * The dots stick out of the block by 2-3 px, so they lie above (z-10) the next block, which would otherwise cover their outer half.
 * The wrapper is a flex box on purpose: as a plain inline box the dot would sit on a text baseline (about 6 px too high).
 */
export function CornerDots({ edge, block }: CornerDotsProps) {
  return (
    <>
      {(['left', 'right'] as const).map((side) => (
        <span
          key={side}
          data-el={`${block}__deco-corner-${names[edge][side]}`}
          aria-hidden="true"
          className={`pointer-events-none absolute z-10 flex size-[5px] text-icon-primary ${positions[edge][side]}`}
        >
          <Icon src={cornerDot} width={5} height={5} />
        </span>
      ))}
    </>
  )
}
