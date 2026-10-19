import { motion, useReducedMotion } from 'motion/react'
import mapOutline from '../../../assets/global/map-outline.svg'
import { pins, type Pin } from './pins'
import { routeGeometry, type RouteGeometry } from './routes.data'
import { DURATION, pinTimelines, routeTimelines, type RouteTimeline } from './timeline'

/** Sets pathLength="1" on the mask path so that dash lengths 0 to 1 mean "none of the route" to "all of it". */
const normalizePath = (element: SVGPathElement | null) => element?.setAttribute('pathLength', '1')

type RouteProps = { geometry: RouteGeometry; timeline: RouteTimeline; reduced: boolean }

/**
 * One dashed route. The picture from Figma is a flat outline, so the draw-on of the original stroke is done with a mask:
 * the centerline of the route, drawn with a growing dash, reveals the picture.
 */
function Route({ geometry, timeline, reduced }: RouteProps) {
  const { id, src, left, top, width, height, centerline } = geometry
  const { opacity, dash } = timeline
  const maskId = `global-route-mask-${id}`

  return (
    <motion.svg
      data-el={`global__route-${id}`}
      aria-hidden="true"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="absolute overflow-visible dark:invert"
      style={{ left, top }}
      initial={false}
      animate={{ opacity: reduced ? 1 : opacity.values }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: DURATION, times: opacity.times, ease: opacity.ease, repeat: Infinity }
      }
    >
      {dash ? (
        <>
          <mask id={maskId} maskUnits="userSpaceOnUse" x={-30} y={-30} width={width + 60} height={height + 60}>
            <motion.path
              ref={normalizePath}
              d={centerline}
              fill="none"
              stroke="white"
              strokeWidth={30}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={
                reduced
                  ? { strokeDasharray: '1 1', strokeDashoffset: 0 }
                  : { strokeDasharray: dash.dasharray, strokeDashoffset: dash.offset ?? 0 }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: DURATION, times: dash.times, ease: dash.ease, repeat: Infinity }
              }
              style={{ strokeDashoffset: dash.initialOffset }}
            />
          </mask>
          <image href={src} width={width} height={height} mask={`url(#${maskId})`} />
        </>
      ) : (
        <image href={src} width={width} height={height} />
      )}
    </motion.svg>
  )
}

/**
 * Card with a flag, a currency code and the payment rails. Figma `global__pin-{id}`.
 * Above 1280 px it is a pill with text; below, only the flag in a round frame (derived: the text would be too small).
 * Font note: the design uses Urbanist for the code, which is not in the font set; the closest styles are used (ui-md, body-sm).
 */
function PinCard({ pin, reduced }: { pin: Pin; reduced: boolean }) {
  const track = pinTimelines[pin.id]
  return (
    <motion.div
      data-el={`global__pin-${pin.id}`}
      className="absolute flex origin-top-left scale-[calc(var(--p)/var(--s))] items-center justify-center gap-3 rounded-pill bg-surface-subtle p-2 ring-1 ring-inset ring-border-subtle desktop:p-4"
      style={{ left: pin.left, top: pin.top }}
      initial={false}
      animate={{ opacity: reduced ? 1 : track.values }}
      transition={reduced ? { duration: 0 } : { duration: DURATION, times: track.times, ease: track.ease, repeat: Infinity }}
    >
      <img src={pin.flag} alt="" width={44} height={44} className="size-11 shrink-0" />
      <div className="hidden flex-col items-start justify-center pr-2 text-center whitespace-nowrap desktop:flex">
        <span data-el={`global__pin-${pin.id}-label`} className="type-ui-md text-typography-primary">
          {pin.code}
        </span>
        <span data-el={`global__pin-${pin.id}-desc`} className="type-body-sm text-typography-secondary">
          {pin.rails}
        </span>
      </div>
    </motion.div>
  )
}

/**
 * The map artboard (1935 x 1202 px of the design): continents, nine dashed routes drawn one after another,
 * and nine cards that appear and fade out in turns. Figma `global__map`. Scaled by the CSS variable `--s`.
 * With `prefers-reduced-motion` everything stands still in its final state: all routes drawn, all cards visible.
 */
export function GlobalMap() {
  const reduced = useReducedMotion() ?? false

  return (
    <div
      data-el="global__map"
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-1/2 h-[1202px] w-[1935px] origin-top -translate-x-1/2 scale-[var(--s)] overflow-clip min-[100rem]:top-[calc(50%-107px*var(--s))] min-[100rem]:origin-center min-[100rem]:-translate-y-1/2"
    >
      {/* Continents (the picture is dark on a light fill; in the dark theme it is inverted). */}
      <div data-el="global__map-mask" className="absolute inset-[11.4%_6.17%_11.38%_6.25%]">
        <img src={mapOutline} alt="" className="absolute block size-full max-w-none dark:invert" />
      </div>
      {routeGeometry.map((geometry) => (
        <Route key={geometry.id} geometry={geometry} timeline={routeTimelines[geometry.id]} reduced={reduced} />
      ))}
      {pins.map((pin) => (
        <PinCard key={pin.id} pin={pin} reduced={reduced} />
      ))}
    </div>
  )
}
