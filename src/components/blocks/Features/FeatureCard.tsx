import type { ReactNode } from 'react'
import exportIconSrc from '../../../assets/icons/export.svg'
import { Badge } from '../../ui/Badge'
import { Icon } from '../../ui/Icon'
import { IconLink } from '../../ui/IconLink'
import type { FeatureCardData } from './cards'

type CardTextProps = Pick<FeatureCardData, 'id' | 'title' | 'description'> & { className?: string }

/** Title and description of a card. Layers `features__card-{id}-text`, `-title`, `-desc`. */
function CardText({ id, title, description, className = '' }: CardTextProps) {
  return (
    <div data-el={`features__card-${id}-text`} className={`relative flex flex-col gap-2 ${className}`}>
      <h3
        data-el={`features__card-${id}-title`}
        className="type-heading-lg text-typography-primary tablet:type-heading-xl"
      >
        {title}
      </h3>
      <p data-el={`features__card-${id}-desc`} className="type-body-md max-w-75 text-typography-secondary">
        {description}
      </p>
    </div>
  )
}

type FeatureCardProps = FeatureCardData & {
  /** Illustration of the card (animation). It lies over the whole card behind the text; empty until the animations come. */
  illustration?: ReactNode
  className?: string
  textClassName?: string
}

/**
 * White card with a round "Learn more" link. Figma `features__card-{id}`.
 * Radius 40 and height 550 px are from the design; padding 24 below tablet and the same height on small screens are derived.
 */
export function FeatureCard({ id, title, description, href, illustration, className = '', textClassName }: FeatureCardProps) {
  return (
    <article
      data-el={`features__card-${id}`}
      className={`relative flex h-137.5 flex-col justify-between overflow-clip rounded-40 bg-surface-subtle p-6 ring-1 ring-inset ring-border-subtle tablet:p-10 ${className}`}
    >
      {illustration && (
        <div data-el={`features__${id}-illustration`} aria-hidden="true" className="pointer-events-none absolute inset-0">
          {illustration}
        </div>
      )}
      <CardText id={id} title={title} description={description} className={textClassName} />
      {/* The "Learn more" text of the design is hidden (a 2 px wide clipped box): it is the accessible name. */}
      <IconLink
        href={href}
        size="lg"
        aria-label={`Learn more: ${title}`}
        data-el={`features__card-${id}-cta`}
        className="relative"
      >
        <span className="grid size-6 place-items-center">
          <Icon src={exportIconSrc} width={21.5} height={21.5} />
        </span>
      </IconLink>
    </article>
  )
}

type SoonCardProps = Omit<FeatureCardData, 'href'>

/** Grey "coming soon" card: text and a badge, no link. Figma `features__card-{id}` in the column `features__col-soon`. */
export function SoonCard({ id, title, description }: SoonCardProps) {
  return (
    <article
      data-el={`features__card-${id}`}
      className="flex flex-1 flex-col gap-8 overflow-clip rounded-40 bg-surface-hover p-6 tablet:p-10"
    >
      <CardText id={id} title={title} description={description} />
      <Badge icon="clock" data-el={`features__card-${id}-badge`} className="self-start">
        Coming soon
      </Badge>
    </article>
  )
}
