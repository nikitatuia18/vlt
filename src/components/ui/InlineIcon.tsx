import swap from '../../assets/icons/swap.svg'

/** The icons that can stand inside a line of a heading (`RevealLines`, a segment with `icon`). */
const sources = { swap } as const

export type InlineIconName = keyof typeof sources

/**
 * A one-color icon the size of a letter of the heading it stands in: 1 em, drawn with the text color, so it follows the type step and the theme.
 * Decorative (`aria-hidden`): the segment keeps its own text for readers, see `RevealLines`.
 */
export function InlineIcon({ name }: { name: InlineIconName }) {
  const mask = `url("${sources[name]}")`
  return (
    <span
      aria-hidden="true"
      className="inline-block size-[1em] bg-current align-middle"
      style={{ maskImage: mask, WebkitMaskImage: mask, maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskSize: '100% 100%', WebkitMaskSize: '100% 100%' }}
    />
  )
}
