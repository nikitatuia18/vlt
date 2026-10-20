export type GlowHue = 'violet' | 'pink' | 'orange' | 'blue' | 'green'

type GlowBackdropProps = {
  /** Color of the light: the token `surface-glow-{hue}`. */
  hue: GlowHue
  /** Shown or not; the change is a slow cross-fade, so that stacked glows of different hues replace each other softly. */
  visible: boolean
  /** Size and place (a positioned parent is needed). The shape is an ellipse that fills this box. */
  className?: string
  'data-el'?: string
}

/**
 * A soft blurred ellipse of colored light that lies behind something (the open card of the Industries block).
 * Figma: the layer `Ellipse 215` of the dark scene, a radial gradient from the color to the page color with a blur of 100 px.
 * Here the gradient fades to transparent, so the glow works on any page color and in both themes.
 * Put several with different hues on top of each other and show one: they cross-fade.
 */
export function GlowBackdrop({ hue, visible, className = '', ...rest }: GlowBackdropProps) {
  return (
    <div
      aria-hidden="true"
      data-hue={hue}
      data-visible={visible}
      className={`pointer-events-none rounded-full blur-[100px] transition-opacity duration-700 ease-out ${visible ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{ backgroundImage: `radial-gradient(closest-side, var(--color-surface-glow-${hue}), transparent)` }}
      {...rest}
    />
  )
}
