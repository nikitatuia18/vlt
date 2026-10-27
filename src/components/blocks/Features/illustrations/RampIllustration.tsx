import { cubicBezier, motion, useTransform } from 'motion/react'
import { CardFrame } from './CardFrame'
import { FPS } from './tracks'
import { useIllustrationClock } from './useIllustrationClock'

/** Timeline of the design (Lottie `features__ramp-counter`): the column of digits scrolls for 1.2 s and holds. */
const FRAMES = 1.2 * FPS
/** The curve of the scroll: cubic-bezier(0.25 1 0.5 1). */
const scrollCurve = cubicBezier(0.25, 1, 0.5, 1)

const DIGITS = [0, 1, 2, 3, 4, 5] as const
const ROW = 128
const DISTANCE = (DIGITS.length - 1) * ROW

/**
 * "0.0%" that counts up to "0.5%": the digit after the point is a column of digits that scrolls up (Figma `features__ramp-counter`,
 * 234 × 128 px at (162, 381) of the card). Layers: `-prefix` "0.", `-scroll` (digits 0 to 5), `-suffix` "%".
 * The size of the text (108 px: Manrope is about 11 % wider than the 120 px Urbanist of the design, so it is smaller to fit the same 234 px) is the size of the illustration, not a text style of the page. The design uses Urbanist Light,
 * which is not in the font set: Manrope Light is the closest. Rest (reduced motion): "0.0%" as in the design.
 */
export function RampIllustration() {
  const { ref, frame } = useIllustrationClock({ frames: FRAMES, mode: 'once', restFrame: 0 })
  const y = useTransform(frame, (value) => -DISTANCE * scrollCurve(Math.min(1, value / FRAMES)))

  return (
    <CardFrame anchor="bottom-right" shiftX={-72}>
      <div ref={ref} data-el="features__ramp-counter" className="absolute top-[381px] left-[162px] h-32 w-58.5">
        <p className="flex h-32 font-display text-[6.75rem] leading-32 font-light tracking-[-0.02em] text-typography-primary">
          <span data-el="features__ramp-counter-prefix" className="w-22.25">
            0.
          </span>
          <span className="relative block h-32 w-18 overflow-hidden">
            <motion.span data-el="features__ramp-counter-scroll" className="block" style={{ y }}>
              {DIGITS.map((digit) => (
                <span key={digit} data-el={`features__ramp-counter-number-${digit}`} className="block h-32 text-center">
                  {digit}
                </span>
              ))}
            </motion.span>
          </span>
          <span data-el="features__ramp-counter-suffix" className="w-18.25">
            %
          </span>
        </p>
      </div>
    </CardFrame>
  )
}
