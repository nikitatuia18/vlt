import type { ReactNode } from 'react'
import { Reveal, RevealLines } from '../../../motion/reveal'
import { Badge } from '../../ui/Badge'
import type { FeatureCardData } from './cards'

type CardTextProps = Pick<FeatureCardData, 'id' | 'title' | 'description'> & {
  className?: string
  /** Seconds the words wait after the text has come into view (the card rises first). */
  delay?: number
}

/** Title and description of a card. Layers `features__card-{id}-text`, `-title`, `-desc`. */
function CardText({ id, title, description, className = '', delay = 0 }: CardTextProps) {
  return (
    <div data-el={`features__card-${id}-text`} className={`relative flex flex-col gap-2 ${className}`}>
      <RevealLines
        as="h3"
        delay={delay}
        data-el={`features__card-${id}-title`}
        className="type-heading-lg text-typography-primary tablet:type-heading-xl"
        lines={[title]}
      />
      <RevealLines
        as="p"
        delay={delay + 0.25}
        data-el={`features__card-${id}-desc`}
        className="type-body-md max-w-75 text-typography-secondary"
        lines={[description]}
      />
    </div>
  )
}

type FeatureCardProps = FeatureCardData & {
  /** Illustration of the card (animation). It lies over the whole card behind the text; empty until the animations come. */
  illustration?: ReactNode
  className?: string
  textClassName?: string
  /** Seconds the card waits after it has come into view (a step of the cascade). */
  revealDelay?: number
}

/**
 * White card, the whole card is the link (no arrow button: the designer's decision, 2026-10-27). Figma `features__card-{id}`.
 * Radius 40 and height 550 px are from the design; padding 24 below tablet and the same height on small screens are derived.
 */
export function FeatureCard({ id, title, description, href, illustration, className = '', textClassName, revealDelay = 0 }: FeatureCardProps) {
  return (
    <Reveal
      as="a"
      variant="card"
      href={href}
      delay={revealDelay}
      data-el={`features__card-${id}`}
      className={`relative isolate flex h-137.5 flex-col justify-between overflow-clip rounded-40 bg-surface-subtle p-6 ring-1 ring-inset ring-border-subtle interactive-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-typography-brand tablet:p-10 ${className}`}
    >
      {illustration && (
        <div data-el={`features__${id}-illustration`} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {illustration}
        </div>
      )}
      <CardText id={id} title={title} description={description} className={textClassName} delay={revealDelay + 0.2} />
    </Reveal>
  )
}

type SoonCardProps = Omit<FeatureCardData, 'href'> & { revealDelay?: number }

/** Grey "coming soon" card: text and a badge, no link. Figma `features__card-{id}` in the column `features__col-soon`. */
export function SoonCard({ id, title, description, revealDelay = 0 }: SoonCardProps) {
  return (
    <Reveal
      as="article"
      variant="card"
      delay={revealDelay}
      data-el={`features__card-${id}`}
      className="flex flex-1 flex-col gap-8 overflow-clip rounded-40 bg-surface-hover p-6 tablet:p-10"
    >
      <CardText id={id} title={title} description={description} delay={revealDelay + 0.2} />
      <Badge icon="clock" data-el={`features__card-${id}-badge`} className="self-start">
        Coming soon
      </Badge>
    </Reveal>
  )
}
