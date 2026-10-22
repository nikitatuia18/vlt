import { motion, useInView, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { duration, easeOut } from '../../../../motion/tokens'
import { useRevealOn } from '../../../../motion/useReveal'
import { codeScripts, type Tone } from './codeScripts'
import { buildCycle, frameAt, type Frame } from './typingCycle'

const toneClass: Record<Tone, string> = {
  method: 'text-typography-brand',
  key: 'text-typography-primary',
  value: 'text-typography-secondary',
  punct: 'text-typography-secondary',
  status: 'text-typography-brand',
}

/** The longest turn between frames the clock accepts: after a hidden tab or a stalled frame the typing goes on, it does not jump. */
const MAX_STEP = 100

/** The window shifts away from the mouse: at the edge of the screen by this many px, with a soft spring (the same feel as the dots under the mouse). */
const PARALLAX = { distance: 14, stiffness: 120, damping: 20 } as const

const sameFrame = (a: Frame, b: Frame) => a.index === b.index && a.chars === b.chars && a.caret === b.caret

/** The clock of the typing: time passes only while `running`; the state changes only when what is drawn changes. */
function useTypingFrame(running: boolean): Frame {
  const cycle = useMemo(() => buildCycle(codeScripts), [])
  const [frame, setFrame] = useState<Frame>(() => frameAt(cycle, 0))
  const clock = useRef(0)

  useEffect(() => {
    if (!running) return
    let handle = 0
    let last = performance.now()
    const tick = (now: number) => {
      clock.current += Math.min(now - last, MAX_STEP)
      last = now
      const next = frameAt(cycle, clock.current)
      setFrame((current) => (sameFrame(current, next) ? current : next))
      handle = requestAnimationFrame(tick)
    }
    handle = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(handle)
  }, [running, cycle])

  return frame
}

/** Offset of the window against the mouse position on the screen. Only a mouse: a finger does not hover. */
function useMouseParallax(active: boolean) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const spring = { stiffness: PARALLAX.stiffness, damping: PARALLAX.damping }
  const smoothX = useSpring(x, spring)
  const smoothY = useSpring(y, spring)

  useEffect(() => {
    if (!active) return
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      x.set(-(event.clientX / window.innerWidth - 0.5) * 2 * PARALLAX.distance)
      y.set(-(event.clientY / window.innerHeight - 0.5) * 2 * PARALLAX.distance)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      x.set(0)
      y.set(0)
    }
  }, [active, x, y])

  return { x: smoothX, y: smoothY }
}

/** The first `chars` characters of the tokens, each piece in the colour of its tone. */
function TypedText({ index, chars }: { index: number; chars: number }) {
  let left = chars
  return codeScripts[index].tokens.map((token, position) => {
    if (left <= 0) return null
    const text = token.text.slice(0, left)
    left -= text.length
    return (
      <span key={position} className={toneClass[token.tone]}>
        {text}
      </span>
    )
  })
}

const lineCount = (index: number) => codeScripts[index].tokens.map((token) => token.text).join('').split('\n').length
const tallest = Math.max(...codeScripts.map((_, index) => lineCount(index)))

/**
 * A window with code that types itself, erases itself and types the next request (block `global`, docs/blocks/global.md).
 * Only a picture: it is hidden from screen readers and does not take the pointer (but it moves a little away from the mouse). It types while it is on the screen and `play` is true.
 * Without motion (reduced motion, the emergency switch, the test flag) it shows the first request, finished.
 */
export function CodeWindow({ play = true, className = '', ...rest }: { play?: boolean; className?: string; 'data-el'?: string }) {
  const animated = useRevealOn()
  const holder = useRef<HTMLDivElement>(null)
  const visible = useInView(holder, { amount: 0.2 })
  const live = animated && play && visible
  const frame = useTypingFrame(live)
  const parallax = useMouseParallax(live)

  // Without motion the whole first request is drawn once.
  const shown = animated ? frame : { index: 0, chars: Infinity, caret: false }

  return (
    <motion.div
      ref={holder}
      aria-hidden="true"
      style={parallax}
      className={`pointer-events-none w-[26rem] max-w-full overflow-hidden rounded-32 border border-border-subtle bg-surface-subtle select-none ${className}`}
      {...rest}
    >
      <div data-el="global__code-tabs" className="type-code-sm flex h-12 items-stretch border-b border-border-subtle px-4 whitespace-nowrap tablet:px-6">
        {codeScripts.map((script, index) => (
          <span
            key={script.id}
            className={`relative flex items-center pr-6 transition-colors duration-300 ${
              index === shown.index ? 'text-typography-primary' : 'text-typography-tertiary'
            }`}
          >
            {script.label}
            {index === shown.index && (
              <motion.span
                layoutId={animated ? 'global-code-tab' : undefined}
                transition={{ duration: duration.morph, ease: easeOut }}
                className="absolute right-6 bottom-0 left-0 h-0.5 bg-surface-brand-default"
              />
            )}
          </span>
        ))}
        <span className="ml-auto flex items-center text-typography-tertiary max-tablet:hidden">example</span>
      </div>

      <div
        data-el="global__code-body"
        className="type-code-sm px-4 py-5 whitespace-pre tablet:px-6"
        style={{ minHeight: `calc(var(--type-line-height-200) * ${tallest} + var(--spacing) * 10)` }}
      >
        <TypedText index={shown.index} chars={shown.chars} />
        {shown.caret && <span className="ml-px inline-block h-[1.15em] w-[0.6em] translate-y-[0.2em] bg-surface-brand-default" />}
      </div>
    </motion.div>
  )
}
