import { Container } from '../../ui/Container'
import { LogoWave } from './LogoWave'

/**
 * Speed of the logo run, px per second. Slow on purpose; to be tuned with the designer.
 * One tile is 123 px apart from the next, so 24 px/s moves a tile by its own spacing in about 5 seconds.
 */
const SPEED = 24

/**
 * Strip of payment and partner logos running along a wave from right to left. Figma block `logos`.
 * The wave starts at the left edge of the content column and runs over the whole screen width.
 *
 * Section padding: 140 px on desktop (design); 80 and 48 px below it are derived, like in the hero.
 */
export function Logos() {
  return (
    <section
      data-el="logos"
      aria-label="Supported payment methods and partners"
      className="overflow-x-clip py-12 tablet:py-20 desktop:py-35"
    >
      <Container data-el="logos__container">
        <div data-el="logos__track-wrap" className="relative h-37.5 w-full">
          <LogoWave speed={SPEED} />
        </div>
      </Container>
    </section>
  )
}
