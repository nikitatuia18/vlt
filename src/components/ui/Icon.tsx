type IconProps = {
  /** URL of a single-color SVG exported from Figma (imported with Vite). */
  src: string
  /** Size of the SVG as exported from Figma, in px. */
  width: number
  height: number
  className?: string
}

/**
 * Single-color Figma vector drawn with the current text color.
 * The SVG is used as a mask over `currentColor`, so the shape is exactly the one from the design
 * while the color follows the theme tokens (e.g. text-icon-primary, light and dark).
 * Decorative: it has no accessible name, so label the parent control.
 */
export function Icon({ src, width, height, className = '' }: IconProps) {
  const mask = `url("${src}")`
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        width,
        height,
        maskImage: mask,
        WebkitMaskImage: mask,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskSize: '100% 100%',
        WebkitMaskSize: '100% 100%',
      }}
    />
  )
}
