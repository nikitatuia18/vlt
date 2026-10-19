import { useRef, type CSSProperties } from 'react'
import { Container } from '../../ui/Container'
import { InteractiveDots } from '../../ui/InteractiveDots'
import { GlobalMap } from './GlobalMap'
import { useMapScale } from './useMapScale'

const metrics = [
  { id: 'uptime', value: '99.9%', label: 'Target SLA uptime' },
  { id: 'rails', value: '15+', label: 'Direct local rails' },
  { id: 'latency', value: '<1 sec', label: 'API processing time' },
] as const

// The gradient of the design: the page color at the top and bottom, clear in the middle (30 % to 70 %).
const fade = 'linear-gradient(to bottom, var(--color-surface-page) 0%, transparent 30%, transparent 70%, var(--color-surface-page) 100%)'

/**
 * "Go global without rebuilding your payments stack." Figma block `global`.
 *
 * Layers from the bottom: the dot grid (interactive, UI Kit), a gradient in the page color (fades the dots at the top
 * and bottom), the map with routes and cards (animated), then the text and the numbers.
 *
 * Wide layout (from 1600 px, like the design): the map lies behind the text, metrics on the left, message on the right,
 * both at the bottom of a 1000 px high area (scaled with the map below 2560 px). Below 1600 px (derived): the map is a block
 * above the text, the message above the metrics.
 * Fixed typo of the design: "throught" is "through".
 */
export function Global() {
  const sectionRef = useRef<HTMLElement>(null)
  const { s, p } = useMapScale(sectionRef)

  return (
    <section
      ref={sectionRef}
      data-el="global"
      aria-labelledby="global-title"
      className="relative overflow-hidden"
      style={{ '--s': s, '--p': p } as CSSProperties}
    >
      <div data-el="global__bg" aria-hidden="true" className="pointer-events-none absolute inset-0">
        <InteractiveDots />
        <div data-el="global__bg-surface" className="absolute inset-0" style={{ backgroundImage: fade }} />
      </div>

      <Container className="relative py-12 tablet:py-20 min-[100rem]:py-35">
        <div data-el="global__content" className="relative flex flex-col gap-10 tablet:gap-12 min-[100rem]:block min-[100rem]:h-[calc(1000px*var(--s))]">
          {/* Stacked layout: a block as high as the scaled map. Wide layout: no box, the map is placed in the content area. */}
          <div data-el="global__map-wrap" className="relative w-full min-[100rem]:contents" style={{ height: 'calc(1202px * var(--s))' }}>
            <GlobalMap />
          </div>

          <div
            data-el="global__text-wrap"
            className="relative flex flex-col-reverse gap-10 min-[100rem]:absolute min-[100rem]:inset-x-0 min-[100rem]:bottom-0 min-[100rem]:flex-row min-[100rem]:items-end min-[100rem]:justify-between min-[100rem]:gap-0 min-[100rem]:px-10"
          >
            <ul data-el="global__metrics" className="flex flex-wrap gap-x-10 gap-y-6 whitespace-nowrap">
              {metrics.map((metric) => (
                <li key={metric.id} data-el={`global__metric-${metric.id}`} className="flex flex-col gap-2">
                  <p
                    data-el={`global__metric-${metric.id}-value`}
                    className="type-heading-lg text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm"
                  >
                    {metric.value}
                  </p>
                  <p
                    data-el={`global__metric-${metric.id}-label`}
                    className="type-body-md text-typography-secondary tablet:type-body-lead"
                  >
                    {metric.label}
                  </p>
                </li>
              ))}
            </ul>

            <div data-el="global__message" className="flex w-fit max-w-full flex-col gap-8">
              <h2
                id="global-title"
                data-el="global__title"
                className="type-heading-lg text-typography-primary tablet:type-heading-xl min-[64rem]:type-display-sm min-[100rem]:type-display-xl"
              >
                Go global without
                <br />
                rebuilding your
                <br />
                payments stack.
              </h2>
              {/* As wide as the title above it, not wider (w-0 + min-w-full). */}
              <p data-el="global__desc" className="type-body-md w-0 min-w-full text-typography-secondary tablet:type-body-lead">
                Connect local payment methods, international rails and crypto through one integration.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
