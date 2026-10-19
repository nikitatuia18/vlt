import { useRef } from 'react'
import { Container } from '../../ui/Container'
import { LogoWave } from './LogoWave'

/**
 * Seconds the wave needs to run one wavelength (861 px) from right to left. Gentle on purpose; to be tuned with the designer.
 * The reference site (antigravity.google) uses 7 seconds; ours is slower (11), at the designer's request, for a smoother wave.
 */
const WAVE_PERIOD_SECONDS = 11

/**
 * How far (px) the strip drifts to the left while the section scrolls through the screen.
 * The reference site uses 250 px.
 */
const SCROLL_DRIFT = 250

/**
 * Strip of payment and partner logos with a wave running through it. Figma block `logos`.
 * The tiles stand still, the wave runs through them from right to left; scrolling slides the strip to the left.
 * The wave starts at the left edge of the content column and runs over the whole screen width.
 *
 * Section padding: 140 px on desktop (design); 80 and 48 px below it are derived, like in the hero.
 */
export function Logos() {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section
      ref={sectionRef}
      data-el="logos"
      aria-label="Supported payment methods and partners"
      className="overflow-x-clip py-12 tablet:py-20 desktop:py-35"
    >
      <Container data-el="logos__container">
        <div data-el="logos__track-wrap" className="relative h-37.5 w-full">
          <LogoWave wavePeriod={WAVE_PERIOD_SECONDS} drift={SCROLL_DRIFT} scrollTarget={sectionRef} />
        </div>
      </Container>
    </section>
  )
}
