import { orbitStyle } from '../../../motion/orbit'
import { Reveal } from '../../../motion/reveal'
import { Icon } from '../../ui/Icon'

// The stage of the design (px) and the middle of the person in it: the badges swirl around this point when they appear.
const STAGE_W = 666
const STAGE_H = 592
const PERSON_CENTER = { x: 326, y: 300 }

// Icon size of the base badge (px). The design draws the same icon in three sizes (35.3 / 42.9 / 41.3) because the badges
// themselves are three sizes; here the whole badge is scaled, so the icon is always drawn at the base size.
const ICON_SIZE = 35.3103

type CtaBadgeProps = {
  /** Same slug as the Figma layer `cta__badge-{id}`. */
  id: string
  icon: string
  label: string
  /** Position of the top left corner inside the stage, in percent of its width and height. */
  left: number
  top: number
  /** Size of this badge against the first one (the design draws them in three sizes: 1, 1.21, 1.17). */
  size: number
  /** Seconds the badge waits after the banner has come into view: the badges jump out one after another. */
  revealDelay?: number
}

/**
 * A glass pill with an icon and a short label that hangs next to the person. Figma `cta__badge-{id}`.
 * It is drawn once at the base size and scaled with the picture (`--s` of the banner) times its own `size`,
 * so the three badges keep the proportions of the design at every screen width.
 * Font note: the design uses Urbanist; it is not in the font set, so the closest style (`ui-lg`) is used.
 */
export function CtaBadge({ id, icon, label, left, top, size, revealDelay = 0 }: CtaBadgeProps) {
  return (
    // The outer box (a point) only places the badge and plays the swirl (`--p`); the point inside it flies, and the badge keeps its own scale.
    <Reveal variant="orbit" delay={revealDelay} className="absolute h-0 w-0" style={{ left: `${left}%`, top: `${top}%` }}>
      <div className="h-0 w-0" style={orbitStyle((left * STAGE_W) / 100 - PERSON_CENTER.x, (top * STAGE_H) / 100 - PERSON_CENTER.y)}>
        <div
          data-el={`cta__badge-${id}`}
          className="flex w-max origin-top-left items-center justify-center gap-2 rounded-pill bg-surface-black-16 p-2 text-typography-static-w ring-1 ring-border-subtle backdrop-blur-[8px] ring-inset"
          style={{ transform: `scale(calc(var(--s) * ${size}))` }}
        >
          <Icon src={icon} width={ICON_SIZE} height={ICON_SIZE} />
          <span data-el={`cta__badge-${id}-label`} className="type-ui-lg pr-2 whitespace-nowrap">
            {label}
          </span>
        </div>
      </div>
    </Reveal>
  )
}
