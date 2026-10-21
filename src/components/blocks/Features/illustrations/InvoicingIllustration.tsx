import { motion, useTransform, cubicBezier } from 'motion/react'
import tickCircle from '../../../../assets/features/tick-circle.svg'
import { CardFrame } from './CardFrame'
import { between, inOutCurve, sum, through } from './tracks'
import { useIllustrationClock } from './useIllustrationClock'

/*
 * Timeline of the design: Lottie `features__invoicing-illustration`, 492 frames (8.2 s), 60 frames per second. Spec: docs/blocks/features.motion.md.
 * The per-frame curves of Lottie are cut down to a few points and joined with straight lines.
 */
const FRAMES = 492
/** The frame where the picture looks like the design: the document stands, the button is there (reduced motion). */
const REST_FRAME = 135

// The document flies in (frames 0 to 120), stands, and flies out to the right (372 to 492). Centre of the document in the frame, scale.
const docX = through([
  [0, 22.05], [5, 99.87], [10, 153.96], [15, 186.29], [20, 204.72], [30, 221.73], [45, 229.61], [60, 231.67], [90, 232.21], [120, 232],
  [372, 232], [374, 235.83], [376, 246.06], [378, 260.97], [380, 279.13], [382, 299.34], [384, 320.63], [386, 342.21], [388, 363.46],
  [390, 383.91], [392, 403.22], [394, 421.16], [396, 437.57], [398, 452.38], [400, 465.58], [402, 477.18], [404, 487.26], [406, 495.89],
  [408, 503.2], [410, 509.27], [412, 514.25], [414, 518.25], [416, 521.38], [418, 523.77], [420, 525.52], [423, 527.16], [426, 527.88],
  [428, 527.98], [431, 527.71], [434, 527.1], [440, 525.39], [450, 522.56], [460, 520.71], [470, 519.85], [480, 519.59], [492, 519.81],
])
const docY = through([
  [0, 458.41], [3, 449.38], [5, 438.81], [8, 418.21], [10, 402.85], [13, 379.68], [15, 364.98], [18, 344.87], [20, 332.91], [23, 317.04],
  [25, 307.81], [28, 295.79], [30, 288.8], [33, 279.74], [35, 274.47], [38, 267.65], [40, 263.79], [43, 258.62], [45, 255.64], [48, 251.9],
  [50, 249.58], [53, 246.79], [55, 245.08], [58, 243.03], [60, 241.78], [63, 240.28], [65, 239.42], [68, 238.45], [70, 237.86],
  [75, 236.77], [80, 236.12], [85, 235.81], [88, 235.76], [92, 235.82], [96, 236], [100, 236.28], [105, 236.73], [110, 237.27],
  [115, 237.86], [120, 238.5], [372, 238.5], [430, 237.69], [492, 237.71],
])
const docScale = through([
  [0, 0.4], [2, 0.4345], [4, 0.4686], [6, 0.5021], [8, 0.535], [10, 0.5671], [12, 0.5984], [14, 0.6289], [16, 0.6582], [18, 0.6865],
  [20, 0.7135], [24, 0.7635], [28, 0.8078], [32, 0.8461], [36, 0.8785], [40, 0.9054], [44, 0.9275], [48, 0.9453], [52, 0.9594],
  [56, 0.9706], [60, 0.9794], [64, 0.9862], [70, 0.9934], [79, 0.9996], [85, 1.0017], [95, 1.0028], [121, 1], [372, 1], [374, 0.992],
  [376, 0.9707], [378, 0.9396], [380, 0.9018], [383, 0.8376], [386, 0.7702], [390, 0.6833], [394, 0.6057], [398, 0.5406], [402, 0.4889],
  [406, 0.4499], [410, 0.422], [414, 0.4033], [418, 0.3917], [423, 0.3847], [427, 0.383], [432, 0.3839], [452, 0.3952], [462, 0.3986],
  [492, 0.4],
])
const docOpacity = between(0, 1, 0, 29.64, inOutCurve)

/** After the tick has come, sum, due plate and lines move down by 57, 55 and 60 px with the same curve (frames 255 to 318). */
const pushed = through([
  [255, 0], [258, 0.095], [260, 0.222], [262, 0.365], [265, 0.573], [268, 0.744], [270, 0.833], [273, 0.928], [276, 0.985], [279, 1.015],
  [282, 1.027], [284, 1.028], [290, 1.02], [300, 1.003], [318, 1],
])

// Texts and blocks rise by 8 to 12 px and fade in one after another (frames 45 to 120).
const titleY = between(8, 0, 45.6, 70.8)
const titleOpacity = between(0, 1, 45.6, 70.8)
const valueY = sum(between(10, 0, 52.8, 79.2), (frame) => pushed(frame) * 57)
const valueOpacity = between(0, 1, 52.8, 79.2)
const dueY = sum(between(8, 0, 62.4, 88.8), (frame) => pushed(frame) * 55)
const dueOpacity = between(0, 1, 62.4, 88.8)
const dueScale = between(0.96, 1, 62.4, 88)
const linesY = sum(between(12, 0, 72, 103.4), (frame) => pushed(frame) * 60)
const linesOpacity = between(0, 1, 72, 104.4)

// The button: comes up, is pressed (frames 140 to 160), leaves down (164 to 185).
const actionY = sum(between(10, 0, 88.8, 120), between(0, 64, 163.2, 184.8))
const actionIn = between(0, 1, 88.8, 120)
const actionOut = between(1, 0, 166.8, 181.8)
const actionScale = through([
  [88, 0.96], [92, 0.972], [96, 0.9845], [100, 0.9935], [104, 0.9985], [108, 1.0021], [111, 1.0027], [115, 1.0018], [120, 1], [140, 1],
  [141, 1.0108], [142, 1.0197], [143, 1.023], [144, 1.0243], [147, 1.025], [148, 1.0247], [149, 1.0214], [150, 1.0138], [151, 1.0018],
  [152, 0.987], [153, 0.9729], [154, 0.9626], [155, 0.9568], [156, 0.955], [157, 0.9727], [158, 0.9921], [159, 1], [160, 1.0013],
  [162, 1.0002], [164, 1], [165, 0.9945], [166, 0.9863], [167, 0.9795], [168, 0.9741], [170, 0.967], [172, 0.9634], [174, 0.9616],
  [176, 0.9607],
])

// The loader takes the place of the button, spins three times and goes away (frames 168 to 265).
const loaderIn = between(0, 1, 168, 181.2)
const loaderOut = between(1, 0, 255, 265.2)
const loaderScale = through([
  [168, 0.84], [169, 0.868], [170, 0.917], [171, 0.9585], [172, 0.985], [173, 0.9988], [175, 1.0044], [177, 1.002], [180, 1], [255, 1],
  [256, 0.953], [257, 0.92], [258, 0.901], [259, 0.8905], [260, 0.885], [263, 0.88],
])
const loaderTurn = through([
  [174, 0],
  [264, 1080],
])

// The tick pops up (frames 265 to 307): comes down by 32 px, grows past its size and settles.
const tickY = through([
  [265, -32], [267, -30.3], [269, -24.8], [271, -18.4], [273, -12.6], [275, -8], [277, -4.6], [279, -2.4], [281, -1], [283, -0.2],
  [285, 0.2], [288, 0.355], [292, 0.27], [297, 0.1], [305, 0],
])
const tickOpacity = between(0, 1, 265.5, 283.2, cubicBezier(0.16, 1, 0.3, 1))
const tickScale = through([
  [265, 0.55], [267, 0.595], [268, 0.656], [270, 0.796], [271, 0.86], [272, 0.917], [273, 0.964], [274, 1.003], [275, 1.034],
  [276, 1.057], [277, 1.074], [278, 1.087], [280, 1.1], [283, 1.106], [290, 1.102], [296, 1.1], [297, 1.095], [298, 1.073], [299, 1.05],
  [300, 1.032], [301, 1.019], [302, 1.011], [303, 1.006], [305, 1.001], [307, 1],
])

const LOADER_RADIUS = 9.75
const LOADER_LENGTH = 2 * Math.PI * LOADER_RADIUS

const lineRows = [
  { id: 1, left: 80, right: 28 },
  { id: 2, left: 104, right: 45 },
  { id: 3, left: 66, right: 40 },
] as const

/**
 * An invoice that flies in, fills itself, is sent and paid, and flies out: Figma `features__invoicing-illustration` (464 × 478 px at (52, 123) of
 * the card, clipped by the card). One clock (`useIllustrationClock`) drives every layer; the layers are named like the layers of the design.
 * Texts inside the picture are artwork: their sizes (28 px sum) are the sizes of the illustration, not text styles of the page.
 * The colors are the tokens of the design (page, hover, brand-light, brand); the tick is green #16A34A in the design (no token).
 * Rest (reduced motion): the document with the button, as in the design.
 */
export function InvoicingIllustration() {
  const { ref, frame } = useIllustrationClock({ frames: FRAMES, mode: 'loop', restFrame: REST_FRAME })

  const docStyle = {
    x: useTransform(frame, (value) => docX(value) - 123),
    y: useTransform(frame, (value) => docY(value) - 150.5),
    scale: useTransform(frame, docScale),
    opacity: useTransform(frame, docOpacity),
  }
  const titleStyle = { y: useTransform(frame, titleY), opacity: useTransform(frame, titleOpacity) }
  const valueStyle = { y: useTransform(frame, valueY), opacity: useTransform(frame, valueOpacity) }
  const dueStyle = { y: useTransform(frame, dueY), opacity: useTransform(frame, dueOpacity), scale: useTransform(frame, dueScale) }
  const linesStyle = { y: useTransform(frame, linesY), opacity: useTransform(frame, linesOpacity) }
  const actionStyle = {
    y: useTransform(frame, actionY),
    opacity: useTransform(frame, (value) => Math.min(actionIn(value), actionOut(value))),
    scale: useTransform(frame, actionScale),
  }
  const loaderStyle = {
    opacity: useTransform(frame, (value) => Math.min(loaderIn(value), loaderOut(value))),
    scale: useTransform(frame, loaderScale),
    rotate: useTransform(frame, loaderTurn),
  }
  const tickStyle = { y: useTransform(frame, tickY), opacity: useTransform(frame, tickOpacity), scale: useTransform(frame, tickScale) }

  return (
    <CardFrame>
      <div ref={ref} className="absolute top-[123px] left-[52px] h-[478px] w-[464px]">
        {/* The document: a card of 246 × 301 px (radius 24: a value of the design, not a token). */}
        <motion.div
          data-el="features__invoicing-doc"
          className="absolute top-0 left-0 h-[301px] w-[246px] overflow-clip rounded-[1.5rem] border border-border-subtle bg-surface-page"
          style={docStyle}
        >
          <motion.p
            data-el="features__invoicing-doc-title"
            className="type-body-lead-medium absolute top-4 left-4 w-[214px] text-center tracking-[-0.02em] text-typography-primary"
            style={titleStyle}
          >
            Invoice #2144
          </motion.p>
          <div data-el="features__invoicing-doc-divider" className="absolute top-15 left-4 h-px w-[214px] bg-border-subtle" />
          <motion.p
            data-el="features__invoicing-doc-value"
            className="absolute top-19 left-4 w-[214px] text-center text-[1.75rem] leading-9 font-medium tracking-[-0.02em] text-typography-primary"
            style={valueStyle}
          >
            $12,263.00
          </motion.p>
          <motion.div
            data-el="features__invoicing-doc-due"
            className="type-ui-sm absolute top-32 left-[67.5px] grid h-9 w-[111px] place-items-center rounded-pill bg-surface-hover tracking-[-0.02em] whitespace-nowrap text-typography-tertiary"
            style={dueStyle}
          >
            Due in 7 days
          </motion.div>
          <motion.div data-el="features__invoicing-doc-lines" className="absolute top-45 left-4 flex w-[214px] flex-col gap-2" style={linesStyle}>
            {lineRows.map((row) => (
              <div key={row.id} data-el={`features__invoicing-line-${row.id}`} className="flex h-[9px] items-center justify-between">
                <span style={{ width: row.left }} className="h-full rounded-pill bg-surface-hover" />
                <span style={{ width: row.right }} className="h-full rounded-pill bg-surface-hover" />
              </div>
            ))}
          </motion.div>
          <motion.div
            data-el="features__invoicing-doc-action"
            className="type-ui-sm absolute top-[239px] left-4 grid h-[46px] w-[214px] place-items-center rounded-pill bg-surface-brand-light tracking-[-0.02em] text-typography-brand ring-1 ring-border-subtle ring-inset"
            style={actionStyle}
          >
            Send invoice
          </motion.div>
          <motion.svg
            data-el="features__invoicing-loader"
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            className="absolute top-[247px] left-[108px] text-icon-brand"
            style={loaderStyle}
          >
            <circle cx="15" cy="15" r={LOADER_RADIUS} stroke="currentColor" strokeOpacity={0.14} strokeWidth="2.5" />
            <circle
              cx="15"
              cy="15"
              r={LOADER_RADIUS}
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${LOADER_LENGTH / 4} ${LOADER_LENGTH}`}
              transform="rotate(-90 15 15)"
            />
          </motion.svg>
          <motion.img
            data-el="features__invoicing-icon-tick-circle"
            src={tickCircle}
            alt=""
            width={48}
            height={48}
            className="absolute top-[73px] left-[99px] size-12"
            style={tickStyle}
          />
        </motion.div>
      </div>
    </CardFrame>
  )
}
