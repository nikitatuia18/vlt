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
 * Here the gradient fades to transparent in several soft steps instead of a blur filter: the look is the same, but a blurred layer
 * 2400 px wide is expensive to repaint on a weak computer. It also works on any page color and in both themes.
 * Put several with different hues on top of each other and show one: they cross-fade.
 */
/** Color in the middle, then it thins out smoothly to nothing at the edge of the ellipse (a hand-made blur: no filter needed). */
const softGradient = (hue: GlowHue) => {
  const color = `var(--color-surface-glow-${hue})`
  const at = (share: number) => `color-mix(in srgb, ${color} ${share}%, transparent)`
  // Steps of a bell curve: strong in the middle, a long soft tail (it takes the place of the blur of the design).
  return `radial-gradient(closest-side, ${at(88)} 0%, ${at(76)} 14%, ${at(56)} 30%, ${at(34)} 48%, ${at(16)} 66%, ${at(6)} 82%, transparent 100%)`
}

export function GlowBackdrop({ hue, visible, className = '', ...rest }: GlowBackdropProps) {
  return (
    <div
      aria-hidden="true"
      data-hue={hue}
      data-visible={visible}
      className={`pointer-events-none transition-opacity duration-700 ease-out ${visible ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{ backgroundImage: softGradient(hue) }}
      {...rest}
    />
  )
}
