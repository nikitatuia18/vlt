import { motion, useTransform, type MotionValue } from 'motion/react'
import avatarBank from '../../../../assets/features/avatar-bank.png'
import avatarCard from '../../../../assets/features/avatar-card.png'
import avatarCrypto from '../../../../assets/features/avatar-crypto.png'
import coin from '../../../../assets/features/coin.svg'
import iconBank from '../../../../assets/features/icon-bank.svg'
import iconCard from '../../../../assets/features/icon-card.svg'
import iconCrypto from '../../../../assets/features/icon-crypto.svg'
import { Icon } from '../../../ui/Icon'
import { CardFrame } from './CardFrame'
import { through } from './tracks'
import { useIllustrationClock } from './useIllustrationClock'

/*
 * Timeline of the design: Lottie `features__payouts-illustration`, 96 frames (1.6 s). Spec: docs/blocks/features.motion.md.
 * Then a pause (GAP seconds) and it plays again while the card is on the screen.
 */
const FRAMES = 96
const GAP = 2.4

/** A dash runs along a line: its head goes from 0 to 100 % of the length, its tail follows (starts later). All linear. */
const dollarHead = through([[0, 0], [48, 1]])
const dollarTail = through([[0, 0], [12, 0], [48, 1]])
const personHead = through([[54, 0], [96, 1]])
const personTail = through([[54, 0], [64.8, 0], [96, 1]])

/** The three ways to pay light up for a moment (frames 48 to 54) after the dashes have reached them. */
const FLASH_FROM = 48
const FLASH_TO = 54

/** Lines of the design, in the coordinates of the 388 × 271 picture. The bank and card ones are mirror images; the crypto one is straight. */
const lines = {
  dollarBank: 'M48 136 C58.67 136 66.8 136 82 136 C129 136 115 63 165 63',
  dollarCrypto: 'M48 136 H164.5',
  dollarCard: 'M48 136 C58.67 136 66.8 136 82 136 C129 136 115 209 165 209',
  bankPerson: 'M310 63 H346',
  cryptoPerson: 'M268 136 H304',
  cardPerson: 'M255 209 H291',
} as const

const methods = [
  { id: 'bank', label: 'Bank transfer', top: 41, width: 145 },
  { id: 'crypto', label: 'Crypto', top: 115, width: 103 },
  { id: 'card', label: 'Card', top: 189, width: 90 },
] as const

const recipients = [
  { id: 'bank', avatar: avatarBank, left: 346, top: 41 },
  { id: 'crypto', avatar: avatarCrypto, left: 304, top: 115 },
  { id: 'card', avatar: avatarCard, left: 291, top: 188 },
] as const

type FlowProps = {
  id: string
  path: string
  frame: MotionValue<number>
  head: (frame: number) => number
  tail: (frame: number) => number
  /** The dash is drawn only between these frames. */
  from: number
  to: number
}

/** One running dash (`features__payouts-flow-{id}`): a stretch of the line, from the tail to the head. Flat ends, no round caps. */
function Flow({ id, path, frame, head, tail, from, to }: FlowProps) {
  const dash = useTransform(frame, (value) => (value >= from && value < to ? `${Math.max(0, head(value) - tail(value))} 2` : '0 2'))
  const offset = useTransform(frame, (value) => -tail(value))
  return (
    <motion.path
      data-el={`features__payouts-flow-${id}`}
      d={path}
      pathLength={1}
      stroke="currentColor"
      strokeOpacity={0.12}
      strokeWidth={2}
      style={{ strokeDasharray: dash, strokeDashoffset: offset }}
    />
  )
}

/**
 * Money goes from a coin through three ways to pay to three people: Figma `features__payouts-illustration` (388 × 271 px at (40, 216) of the card).
 * The lines are always there (1 px, 12 %); a dash runs along them, the ways to pay flash with the brand border, the dashes run on to the people.
 * Rest (reduced motion): the lines and nothing else moves, as in the design.
 */
export function PayoutsIllustration() {
  const { ref, frame } = useIllustrationClock({ frames: FRAMES, mode: 'loop', gap: GAP, restFrame: 0 })
  const flash = useTransform(frame, (value) => (value >= FLASH_FROM && value < FLASH_TO ? 1 : 0))

  return (
    <CardFrame>
      <div ref={ref} className="absolute top-[216px] left-10 h-[271px] w-[388px]">
        <svg width="388" height="271" viewBox="0 0 388 271" fill="none" className="absolute inset-0 text-typography-primary">
          <g stroke="currentColor" strokeOpacity={0.12} strokeWidth={1}>
            <path data-el="features__payouts-line-dollar-bank" d={lines.dollarBank} />
            <path data-el="features__payouts-line-dollar-crypto" d={lines.dollarCrypto} />
            <path data-el="features__payouts-line-dollar-card" d={lines.dollarCard} />
            <path data-el="features__payouts-line-bank-person" d={lines.bankPerson} />
            <path data-el="features__payouts-line-crypto-person" d={lines.cryptoPerson} />
            <path data-el="features__payouts-line-card-person" d={lines.cardPerson} />
          </g>
          <Flow id="dollar-bank" path={lines.dollarBank} frame={frame} head={dollarHead} tail={dollarTail} from={0} to={48} />
          <Flow id="dollar-crypto" path={lines.dollarCrypto} frame={frame} head={dollarHead} tail={dollarTail} from={0} to={48} />
          <Flow id="dollar-card" path={lines.dollarCard} frame={frame} head={dollarHead} tail={dollarTail} from={0} to={48} />
          <Flow id="bank-person" path={lines.bankPerson} frame={frame} head={personHead} tail={personTail} from={54} to={FRAMES} />
          <Flow id="crypto-person" path={lines.cryptoPerson} frame={frame} head={personHead} tail={personTail} from={54} to={FRAMES} />
          <Flow id="card-person" path={lines.cardPerson} frame={frame} head={personHead} tail={personTail} from={54} to={FRAMES} />
        </svg>

        <div data-el="features__payouts-source" className="absolute top-28 left-0 size-12">
          <img src={coin} alt="" width={48} height={48} className="size-12" />
        </div>

        {methods.map((method) => (
          <div
            key={method.id}
            data-el={`features__payouts-method-${method.id}`}
            style={{ top: method.top, width: method.width }}
            className="absolute left-[165px] h-[42px] rounded-pill bg-surface-page ring-1 ring-border-subtle ring-inset"
          >
            {/* The brand border that flashes: one pixel wider on every side, like the stroke of the design going from 1 to 2 px. */}
            <motion.span aria-hidden="true" data-el={`features__payouts-method-${method.id}-flash`} className="absolute -inset-px rounded-pill ring-2 ring-typography-brand ring-inset" style={{ opacity: flash }} />
            <span className="absolute top-[9px] left-[13px] size-6">
              {method.id === 'crypto' ? (
                <img src={iconCrypto} alt="" width={24} height={24} className="size-6" />
              ) : (
                <Icon src={method.id === 'bank' ? iconBank : iconCard} width={24} height={24} className="text-icon-brand" />
              )}
            </span>
            <span data-el={`features__payouts-method-${method.id}-label`} className="type-ui-sm absolute top-[11px] left-[45px] tracking-[-0.02em] whitespace-nowrap text-typography-primary">
              {method.label}
            </span>
          </div>
        ))}

        {recipients.map((person) => (
          <div
            key={person.id}
            data-el={`features__payouts-recipient-${person.id}`}
            style={{ left: person.left, top: person.top }}
            className="absolute size-[42px] overflow-clip rounded-full bg-surface-brand-default"
          >
            <img src={person.avatar} alt="" width={42} height={42} className="size-[42px]" />
          </div>
        ))}
      </div>
    </CardFrame>
  )
}

