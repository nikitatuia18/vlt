import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useRevealOn } from '../../../../motion/useReveal'
import avatarBank from '../../../../assets/features/avatar-bank.png'
import avatarCard from '../../../../assets/features/avatar-card.png'
import avatarCrypto from '../../../../assets/features/avatar-crypto.png'
import iconBank from '../../../../assets/features/icon-bank.svg'
import iconCard from '../../../../assets/features/icon-card.svg'
import iconCrypto from '../../../../assets/features/icon-crypto.svg'
import { Icon } from '../../../ui/Icon'
import { CardFrame } from './CardFrame'
import { FPS, between, through } from './tracks'

/*
 * Timeline of the design: Lottie `features__payouts-illustration`, 96 frames (1.6 s). Spec: docs/blocks/features.motion.md.
 * Unlike the design, the three ways to pay do not run together: each one has its own clock and starts again after a random pause.
 */
const FRAMES = 96
/** The pause between two runs of one way to pay, in seconds: random every time. */
const PAUSE = [0.7, 2.6] as const
/** The first run of each way starts in this order (bank, then card, then crypto) with a little chance on top, in seconds. */
const FIRST_START = { bank: [0, 0.3], card: [0.5, 0.9], crypto: [1, 1.5] } as const

/** A dash runs along a line: its head goes from 0 to 100 % of the length, its tail follows (starts later). All linear. */
const dollarHead = through([[0, 0], [48, 1]])
const dollarTail = through([[0, 0], [12, 0], [48, 1]])
const personHead = through([[54, 0], [96, 1]])
const personTail = through([[54, 0], [64.8, 0], [96, 1]])

/** The money arrives (frame 48): the border and the tint come at once and fade slowly, a thin ring goes outward and fades. */
const ARRIVE = 48
const arriveGlow = through([[ARRIVE - 1, 0], [ARRIVE + 3, 1], [ARRIVE + 40, 0]])
const rippleFade = through([[ARRIVE - 1, 0], [ARRIVE, 0.8], [ARRIVE + 34, 0]])
const rippleGrow = between(0, 1, ARRIVE, ARRIVE + 34)
/** How far the ripple goes beyond the pill, in px. */
const RIPPLE = 12

const random = ([min, max]: readonly [number, number]) => min + Math.random() * (max - min)

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

type MethodId = (typeof methods)[number]['id']

/**
 * The clock of one way to pay: counts frames 0 → FRAMES, waits a random pause and starts again, while the card is on the screen.
 * Without motion it stands on frame 0, the picture of the design (lines only).
 */
function useWayClock(id: MethodId, active: boolean) {
  const frame = useMotionValue(0)
  useEffect(() => {
    frame.set(0)
    if (!active) return
    let timer: ReturnType<typeof setTimeout>
    let run: ReturnType<typeof animate> | undefined
    const play = () => {
      frame.set(0)
      run = animate(frame, FRAMES, {
        duration: FRAMES / FPS,
        ease: 'linear',
        onComplete: () => {
          timer = setTimeout(play, random(PAUSE) * 1000)
        },
      })
    }
    timer = setTimeout(play, random(FIRST_START[id]) * 1000)
    return () => {
      clearTimeout(timer)
      run?.stop()
    }
  }, [active, frame, id])
  return frame
}

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
      className="text-typography-success"
      stroke="currentColor"
      strokeOpacity={0.7}
      strokeWidth={2}
      style={{ strokeDasharray: dash, strokeDashoffset: offset }}
    />
  )
}

/** The coin of `features__payouts-source`, drawn here (not an image) so that it takes the success green of the theme. Shape and sizes of coin.svg. */
function Coin() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true" className="size-12 text-typography-success">
      <circle cx="24" cy="24" r="23.5" fill="currentColor" fillOpacity={0.16} stroke="currentColor" strokeOpacity={0.24} />
      <path
        fill="currentColor"
        d="M32 27.4771C32 23.5561 29.4925 22.2117 24.4776 21.6516C20.8955 21.2034 20.179 20.3072 20.179 18.7386C20.179 17.1699 21.3732 16.1619 23.7611 16.1619C25.9104 16.1619 27.1045 16.8341 27.7015 18.5146C27.821 18.8507 28.1792 19.0747 28.5374 19.0747H30.4477C30.9254 19.0747 31.2836 18.7386 31.2836 18.2906V18.1785C30.8059 15.7137 28.6566 13.8092 25.9104 13.5852V10.8964C25.9104 10.4482 25.5522 10.1121 24.9553 10H23.1642C22.6865 10 22.3283 10.3361 22.2088 10.8964V13.4731C18.6267 13.9213 16.3582 16.1619 16.3582 18.9628C16.3582 22.6599 18.7462 24.1161 23.7611 24.6765C27.1045 25.2366 28.1792 25.9088 28.1792 27.7014C28.1792 29.494 26.5073 30.7263 24.2389 30.7263C21.1342 30.7263 20.0595 29.4937 19.7013 27.8132C19.5821 27.3653 19.2239 27.141 18.8657 27.141H16.8356C16.3582 27.141 16 27.4771 16 27.9253V28.0375C16.4774 30.8381 18.388 32.8547 22.3283 33.415V36.1038C22.3283 36.5518 22.6865 36.8879 23.2834 37H25.0745C25.5522 37 25.9104 36.6639 26.0299 36.1038V33.415C29.612 32.8547 32 30.502 32 27.4771V27.4771Z"
      />
    </svg>
  )
}

type ArrivalProps = { frame: MotionValue<number>; id: string; width: number }

/** The money has arrived: the border and a light green tint (one pill-sized layer), and a thin ring that goes outward and fades. */
function Arrival({ frame, id, width }: ArrivalProps) {
  const glow = useTransform(frame, arriveGlow)
  const rippleOpacity = useTransform(frame, rippleFade)
  const rippleX = useTransform(frame, (value) => 1 + (2 * RIPPLE * rippleGrow(value)) / width)
  const rippleY = useTransform(frame, (value) => 1 + (2 * RIPPLE * rippleGrow(value)) / 42)
  return (
    <>
      <motion.span aria-hidden="true" data-el={`features__payouts-method-${id}-flash`} className="absolute -inset-px rounded-pill bg-surface-success-secondary ring-2 ring-typography-success ring-inset" style={{ opacity: glow }} />
      <motion.span aria-hidden="true" data-el={`features__payouts-method-${id}-ripple`} className="pointer-events-none absolute inset-0 rounded-pill ring-1 ring-typography-success" style={{ opacity: rippleOpacity, scaleX: rippleX, scaleY: rippleY }} />
    </>
  )
}

/**
 * Money goes from a coin through three ways to pay to three people: Figma `features__payouts-illustration` (388 × 271 px at (40, 216) of the card).
 * The lines are always there (1 px, 12 %); a green dash runs along one of them, the way to pay lights up green when it arrives, the dash runs on to the person.
 * Every way runs on its own clock (random pauses). Rest (reduced motion): the lines and nothing else moves, as in the design.
 */
export function PayoutsIllustration() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion() ?? false
  const revealOn = useRevealOn()
  const inView = useInView(ref, { amount: 0.4 })
  const active = !reduced && revealOn && inView
  const frames: Record<MethodId, MotionValue<number>> = {
    bank: useWayClock('bank', active),
    card: useWayClock('card', active),
    crypto: useWayClock('crypto', active),
  }

  return (
    <CardFrame lift={24}>
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
          <Flow id="dollar-bank" path={lines.dollarBank} frame={frames.bank} head={dollarHead} tail={dollarTail} from={0} to={48} />
          <Flow id="dollar-crypto" path={lines.dollarCrypto} frame={frames.crypto} head={dollarHead} tail={dollarTail} from={0} to={48} />
          <Flow id="dollar-card" path={lines.dollarCard} frame={frames.card} head={dollarHead} tail={dollarTail} from={0} to={48} />
          <Flow id="bank-person" path={lines.bankPerson} frame={frames.bank} head={personHead} tail={personTail} from={54} to={FRAMES} />
          <Flow id="crypto-person" path={lines.cryptoPerson} frame={frames.crypto} head={personHead} tail={personTail} from={54} to={FRAMES} />
          <Flow id="card-person" path={lines.cardPerson} frame={frames.card} head={personHead} tail={personTail} from={54} to={FRAMES} />
        </svg>

        <div data-el="features__payouts-source" className="absolute top-28 left-0 size-12">
          <Coin />
        </div>

        {methods.map((method) => (
          <div
            key={method.id}
            data-el={`features__payouts-method-${method.id}`}
            style={{ top: method.top, width: method.width }}
            className="absolute left-[165px] h-[42px] rounded-pill bg-surface-page ring-1 ring-border-subtle ring-inset"
          >
            <Arrival frame={frames[method.id]} id={method.id} width={method.width} />
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

