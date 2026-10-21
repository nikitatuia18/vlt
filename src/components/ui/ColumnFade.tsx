type ColumnFadeProps = {
  /** Where the lines leave the block: `bottom` runs them down past the lower edge, `top` up past the upper edge. */
  edge: 'top' | 'bottom'
  /** Block name for the `data-el` of the lines: `{block}__deco-column-fade-{top|bottom}-{left|right}`. */
  block: string
  /** Length of the lines in px; they fade out completely at the end. */
  length?: number
}

/**
 * The two vertical lines of the column, continued beyond the block and fading out (full strength at the horizontal
 * line, transparent at the end). Place it in the positioned column box; the lines start just outside the 1 px
 * horizontal border of the block, the same place where `CornerDots` sit, and run over the neighbour block.
 */
export function ColumnFade({ edge, block, length = 160 }: ColumnFadeProps) {
  const vertical = edge === 'bottom' ? 'top-[calc(100%+1px)] bg-gradient-to-b' : 'bottom-[calc(100%+1px)] bg-gradient-to-t'
  return (
    <>
      {(['left', 'right'] as const).map((side) => (
        <span
          key={side}
          data-el={`${block}__deco-column-fade-${edge}-${side}`}
          aria-hidden="true"
          style={{ height: length }}
          // The column lines run on the inner 1 px of the left and right edges (see CornerDots).
          className={`pointer-events-none absolute z-10 w-px from-border-subtle to-border-alpha-0 max-tablet:hidden ${vertical} ${
            side === 'left' ? 'left-0' : 'right-0'
          }`}
        />
      ))}
    </>
  )
}
