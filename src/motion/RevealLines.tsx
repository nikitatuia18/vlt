import { motion, type Variants } from 'motion/react'
import { createElement, useEffect, useRef, useState, type RefObject, type Ref } from 'react'
import { InlineIcon, type InlineIconName } from '../components/ui/InlineIcon'
import { motionTags } from './revealVariants'
import { useTriggerProps, type Trigger } from './revealTrigger'
import { appear, easeOut } from './tokens'
import { useRevealOn } from './useReveal'

/**
 * A piece of a line with its own class (for example the first words of an answer in a stronger color).
 * With `icon` the piece is one "word" drawn as that icon (it rises from its mask like the words); `text` is then what readers and copy get.
 */
export type Segment = { text: string; className?: string; icon?: InlineIconName }
export type Line = string | readonly Segment[]
const segmentsOf = (line: Line): readonly Segment[] => (typeof line === 'string' ? [{ text: line }] : line)

/** The content of a word: its text, or for an icon the icon with the text kept for readers (screen readers, copy, search). */
const textOf = (text: string, icon?: InlineIconName) =>
  icon ? (
    <>
      <InlineIcon name={icon} />
      <span className="sr-only">{text}</span>
    </>
  ) : (
    text
  )

/** How the text of a part of the design system (a button label, a badge) appears: the same options as RevealLines. */
export type TextReveal = { delay?: number; atLoad?: boolean; when?: boolean; atPageEnd?: boolean; open?: boolean; step?: number }

type RevealLinesProps = Trigger & {
  /** The text. Every entry is a block (a forced line break); an entry may be a list of segments when parts need their own class. */
  lines: readonly Line[]
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  /** `word` (default): every word rises from its own mask, one after another (a phrase "unrolls"). `line`: a line rises as a whole. */
  by?: 'line' | 'word'
  /** Seconds between neighbours (lines or words); the default comes from `appear`. */
  step?: number
  /**
   * For a text inside a panel that opens and closes (an answer, the text of a card): the words play every time the panel
   * is open and the text is on the screen, and go back under their masks a moment after it has closed. Instead of the other triggers.
   */
  open?: boolean
  /** Below the tablet width the entries run on as one text (no forced line breaks); from there they are blocks again. Words only. */
  joinBelowTablet?: boolean
  className?: string
  id?: string
  delay?: number
  'data-el'?: string
}

// A word or a line is a little smaller while it is under the mask and grows to full size as it rises; it grows from its lower left.
const lineVariants: Variants = {
  hidden: { y: '110%', scale: appear.mask.scaleFrom },
  shown: (delay: number) => ({ y: '0%', scale: 1, transition: { duration: appear.line.duration, ease: easeOut, delay } }),
}
const growFrom = { transformOrigin: '0% 100%' } as const

const wordVariants: Variants = {
  hidden: { y: '110%', scale: appear.mask.scaleFrom },
  shown: (delay: number) => ({ y: '0%', scale: 1, transition: { duration: appear.word.duration, ease: easeOut, delay } }),
}

/** After a panel has closed (its fold takes 0.7 s) the words go back under their masks, ready to play again. */
const CLOSE_RESET_MS = 900

/** For `open`: true while the text should be shown (the panel is open and the text is on the screen), with the delayed reset on closing. */
function useOpenPlay(open: boolean | undefined, holder: RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false)
  const [shown, setShown] = useState(false)
  const enabled = open !== undefined

  // A folded panel is not on the screen, so the observer also tells when the text has really been uncovered.
  useEffect(() => {
    const element = holder.current
    if (!enabled || !element) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [enabled, holder])

  useEffect(() => {
    if (!enabled) return
    if (!open) {
      // Closed: put the words back under their masks once the fold is over.
      const timer = setTimeout(() => setShown(false), CLOSE_RESET_MS)
      return () => clearTimeout(timer)
    }
    if (open && visible) {
      const timer = setTimeout(() => setShown(true), 0)
      return () => clearTimeout(timer)
    }
  }, [enabled, open, visible])

  return shown
}

/**
 * A heading or a text whose words rise from under their masks, one after another (each word a little smaller under the mask and
 * full size when it is out): the phrase unrolls. The words wrap as the text wraps, so it suits headings and paragraphs alike;
 * the entries of `lines` are separate blocks (forced line breaks). The text reads and copies as one text.
 * With `by="line"` whole lines rise instead, one after another. With `open` it plays each time a panel opens.
 */
export function RevealLines({ lines, as = 'h2', by = 'word', step, open, joinBelowTablet, className, delay = 0, when, atLoad, atPageEnd, ...rest }: RevealLinesProps) {
  const on = useRevealOn()
  const holder = useRef<HTMLElement | null>(null)
  const opened = useOpenPlay(open, holder)
  const ownTrigger = useTriggerProps({ when, atLoad, atPageEnd })
  const trigger = open === undefined ? ownTrigger : ({ initial: 'hidden', animate: opened ? 'shown' : 'hidden' } as const)
  const Element = motionTags[as] as typeof motion.div
  // Inside a line of other text (a button label) the lines are inline, in a heading or a paragraph they are blocks.
  const lineBox = as === 'span' ? 'inline' : joinBelowTablet ? 'inline tablet:block' : 'block'

  // Headings go a word at a time at 0.07 s, a paragraph (many words) faster, at 0.03 s.
  const gap = step ?? (by === 'word' ? (as === 'p' ? appear.word.paragraphStep : appear.word.step) : appear.line.step)

  if (!on) {
    return createElement(
      as,
      { className, ...rest },
      lines.map((line, index) => (
        <span key={index} className={lineBox}>
          {segmentsOf(line).map((segment, segmentIndex, all) => (
            <span key={segmentIndex} className={segment.className}>
              {textOf(segment.text, segment.icon)}
              {segmentIndex < all.length - 1 ? ' ' : null}
            </span>
          ))}
          {index < lines.length - 1 ? ' ' : null}
        </span>
      )),
    )
  }

  if (by === 'word') {
    // The words are counted over all lines, so the whole phrase runs on in one beat.
    let counted = 0
    return (
      <Element ref={holder as Ref<HTMLDivElement>} className={className} {...rest} {...trigger}>
        {lines.map((line, lineIndex) => (
          <span key={lineIndex} className={lineBox}>
            {segmentsOf(line)
              .flatMap((segment) =>
                // An icon is one word, whatever its text is.
                (segment.icon ? [segment.text] : segment.text.split(' ').filter(Boolean)).map((word) => ({ word, wordClass: segment.className, icon: segment.icon })),
              )
              .map(({ word, wordClass, icon }, wordIndex) => (
                <span key={wordIndex} className={wordClass}>
                  {wordIndex > 0 ? ' ' : null}
                  {/* Every word has its own mask (a little taller below and wider at the sides, so the tails of g, y are not cut). */}
                  <span data-mask="" className="-mx-[0.06em] -mb-[0.16em] inline-block overflow-hidden px-[0.06em] pb-[0.16em] align-top">
                    <motion.span className="inline-block" style={growFrom} variants={wordVariants} custom={delay + counted++ * gap}>
                      {textOf(word, icon)}
                    </motion.span>
                  </span>
                </span>
              ))}
            {lineIndex < lines.length - 1 ? ' ' : null}
          </span>
        ))}
      </Element>
    )
  }

  return (
    <Element ref={holder as Ref<HTMLDivElement>} className={className} {...rest} {...trigger}>
      {lines.map((line, index) => (
        // The mask: a little taller below and wider at the sides, so that the tails of g, y and the side bearings are not cut;
        // the negative margins give it back, so the layout is the same as without the mask.
        <span key={index} data-mask="" className="-mx-[0.06em] -mb-[0.16em] block overflow-hidden px-[0.06em] pb-[0.16em]">
          <motion.span className="block" style={growFrom} variants={lineVariants} custom={delay + index * gap}>
            {segmentsOf(line)
              .map((segment) => segment.text)
              .join(' ')}
          </motion.span>
          {index < lines.length - 1 ? ' ' : null}
        </span>
      ))}
    </Element>
  )
}
