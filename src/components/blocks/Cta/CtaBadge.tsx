import { Icon } from '../../ui/Icon'

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
}

/**
 * A glass pill with an icon and a short label that hangs next to the person. Figma `cta__badge-{id}`.
 * It is drawn once at the base size and scaled with the picture (`--s` of the banner) times its own `size`,
 * so the three badges keep the proportions of the design at every screen width.
 * Font note: the design uses Urbanist; it is not in the font set, so the closest style (`ui-lg`) is used.
 */
export function CtaBadge({ id, icon, label, left, top, size }: CtaBadgeProps) {
  return (
    <div
      data-el={`cta__badge-${id}`}
      className="absolute flex origin-top-left items-center justify-center gap-2 rounded-pill bg-surface-black-16 p-2 text-typography-static-w ring-1 ring-border-subtle backdrop-blur-[8px] ring-inset"
      style={{ left: `${left}%`, top: `${top}%`, transform: `scale(calc(var(--s) * ${size}))` }}
    >
      <Icon src={icon} width={ICON_SIZE} height={ICON_SIZE} />
      <span data-el={`cta__badge-${id}-label`} className="type-ui-lg pr-2 whitespace-nowrap">
        {label}
      </span>
    </div>
  )
}
