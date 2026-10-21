import { useMotionValueEvent, type MotionValue } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTheme } from '../../../../lib/theme'
import type { StepId } from '../steps'
import { drawScene } from './scenes'

type StepIllustrationProps = {
  step: StepId
  /** Progress of the step, 0 to 1: the orange line of the card. The picture is built while it fills. */
  progress: MotionValue<number>
  /** Only an open card draws. */
  active: boolean
  /** With reduced motion nothing runs: this frame is shown (the line of the design). `null`: follow the progress. */
  staticProgress?: number | null
  className?: string
}

/**
 * The picture of a step: a canvas that fills its box and shows the frame of the step at the current progress. It draws on every change of
 * the progress (the block moves it every frame while the cards are on the screen), so it has no clock of its own: when the time is held
 * the picture stands still. Lines are drawn in the text color of the theme, the accent in the brand color. Docs: docs/blocks/next-steps.motion.md.
 */
export function StepIllustration({ step, progress, active, staticProgress = null, className = '' }: StepIllustrationProps) {
  const box = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const inkProbe = useRef<HTMLSpanElement>(null)
  const accentProbe = useRef<HTMLSpanElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const { theme } = useTheme()

  useEffect(() => {
    const element = box.current
    if (!element) return
    const measure = () => setSize({ width: element.clientWidth, height: element.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const draw = useCallback(() => {
    const element = canvas.current
    const context = element?.getContext('2d')
    if (!element || !context || size.width === 0 || size.height === 0) return
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    const width = Math.round(size.width * ratio)
    const height = Math.round(size.height * ratio)
    if (element.width !== width || element.height !== height) {
      element.width = width
      element.height = height
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    const ink = inkProbe.current ? getComputedStyle(inkProbe.current).color : '#181818'
    const accent = accentProbe.current ? getComputedStyle(accentProbe.current).color : '#b63b12'
    drawScene(step, { context, width: size.width, height: size.height, p: staticProgress ?? progress.get(), ink, accent })
  }, [progress, size, staticProgress, step])

  useMotionValueEvent(progress, 'change', () => {
    if (active && staticProgress === null) draw()
  })
  // On opening, on a change of the size or the theme, and for the still picture.
  useEffect(() => {
    if (active) draw()
  }, [active, draw, theme])

  return (
    <div ref={box} aria-hidden="true" className={`pointer-events-none relative ${className}`}>
      <span ref={inkProbe} className="hidden text-typography-primary" />
      <span ref={accentProbe} className="hidden text-typography-brand" />
      <canvas ref={canvas} data-el={`next-steps__illustration-${step}`} style={{ width: size.width, height: size.height }} className="absolute inset-0" />
    </div>
  )
}
