import type { MotionValue } from 'motion/react'
import { useEffect, useRef, type RefObject } from 'react'
import { useTheme } from '../../../../lib/theme'
import { pins, type Pin } from '../pins'
import { sampleTrack } from '../sampleTrack'
import { DURATION, FRAMES, pinTimelines, routeSource, routeTarget, routeTimelines } from '../timeline'
import { angleBetween, arcPoint, createView, isSeen, latLonToVector, rotateInto, smoothstep, RAD } from './globeMath'
import { createLandDots } from './landDots'

/* Look of the globe and how it moves. Numbers from docs/blocks/global.motion.md; tune them here. */

/** Distance between neighbouring dots at the final size, px: sets how many dots the globe gets (and the cost of a frame). */
const DOT_SPACING = 4.7
/** Dot radius, px, on a globe 650 px wide; it grows slower than the globe, so the big globe has fine dots, not blobs. */
const DOT_RADIUS = 1
const DOT_RADIUS_GROWTH = 0.6
/** Brightness and size of the dots by depth: the rim of the globe is faint and fine, the middle is full. */
const LEVEL_FROM_DEPTH = [0, 0.18, 0.4, 0.7]
const LEVEL_ALPHA = [0.25, 0.5, 0.8, 1]
const LEVEL_SIZE = [0.6, 0.8, 0.9, 1]

/** The pointer pushes dots away: the values of the approved prototype (see InteractiveDots). */
const POINTER_RADIUS = 150
const POINTER_FORCE = 1
const POINTER_EASE = 0.1

/** Slow turn: seconds per full revolution, the longitude that faces the viewer at the start, the tilt of the axis towards the viewer. */
const TURN_SECONDS = 120
const START_LONGITUDE = -10
const TILT = 20

/** The hand may turn the globe only a little: the limits (degrees) of the soft stop, and the spring that brings it back. */
const DRAG_LIMIT_LONGITUDE = 45 * RAD
const DRAG_LIMIT_LATITUDE = 12 * RAD
const SPRING = 12
const SPRING_DAMPING = 2 * Math.sqrt(SPRING)

/** Scene (progress of the pinned section, 0 to 1): the globe flies from "big" to its place, then the cards start. */
const MOVE_FROM = 0.15
const MOVE_TO = 0.75
const CARDS_AT = 0.85
/** With reduced motion the timeline stands still at this frame: three cards (EU, Chile, Argentina) and three lines are on. */
const STILL_FRAME = 800
/** The big globe is 1.25 times the screen width (or nearly as high as the screen on tall ones). */
const BIG_WIDTH_RATIO = 0.625
const BIG_HEIGHT_RATIO = 0.475
const APPEAR_SCALE_FROM = 0.7

/** Cards: design size at a globe of this radius (the design shows the globe 650 px wide); never scaled below MIN_CARD_SCALE. */
const CARD_REFERENCE_RADIUS = 325
const MIN_CARD_SCALE = 0.6
/** A card fades out as its country turns to the rim of the globe (z of the surface point). */
const CARD_VISIBLE_FROM = 0.02
const CARD_VISIBLE_TO = 0.28

const ARC_STEPS = 56

type GlobeProps = {
  /** 0 to 1 while the section is pinned (the globe moves from big to its place). */
  progress: MotionValue<number>
  /** 0 to 1 while the section comes into view (the globe appears). */
  appear: MotionValue<number>
  /** Empty element in the layout where the globe stands at the end. */
  slotRef: RefObject<HTMLElement | null>
  /** `prefers-reduced-motion`: one still picture in the final state. */
  reduced: boolean
}

const lerp = (from: number, to: number, t: number) => from + (to - from) * t
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
/** Soft stop: follows the value, but never reaches `limit`. */
const softLimit = (value: number, limit: number) => limit * Math.tanh(value / limit)

const routeIds = Object.keys(routeTimelines).map(Number)
const pinIndex = (id: string) => pins.findIndex((pin) => pin.id === id)

/**
 * Card with a flag, a currency code and the payment rails. Figma `global__pin-{id}`.
 * Above 1280 px it is a pill with text; below, only the flag in a round frame (derived: the text would be too small).
 * The outer layer is moved onto the country every frame by the globe loop; the flag centre is its origin.
 * Font note: the design uses Urbanist for the code, which is not in the font set; the closest styles are used (ui-md, body-sm).
 */
function PinCard({ pin, outerRef }: { pin: Pin; outerRef: (element: HTMLDivElement | null) => void }) {
  const toLeft = pin.side === 'left'
  return (
    <div ref={outerRef} className="pointer-events-none absolute top-0 left-0 origin-top-left opacity-0 will-change-transform">
      <div
        data-el={`global__pin-${pin.id}`}
        className={`absolute top-[-30px] desktop:top-[-38px] flex items-center justify-center gap-3 rounded-pill bg-surface-subtle p-2 ring-1 ring-inset ring-border-subtle desktop:p-4 ${
          toLeft ? 'right-[-30px] desktop:right-[-38px] flex-row-reverse' : 'left-[-30px] desktop:left-[-38px]'
        }`}
      >
        <img src={pin.flag} alt="" width={44} height={44} className="size-11 shrink-0" />
        <div className={`hidden flex-col items-start justify-center text-center whitespace-nowrap desktop:flex ${toLeft ? 'pl-2' : 'pr-2'}`}>
          <span data-el={`global__pin-${pin.id}-label`} className="type-ui-md text-typography-primary">
            {pin.code}
          </span>
          <span data-el={`global__pin-${pin.id}-desc`} className="type-body-sm text-typography-secondary">
            {pin.rails}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * The globe of the "global" block: dots on land, 3D, slowly turning, pushed away by the pointer, turnable by hand a little;
 * on it the nine cards of the countries and the arcs that fly between them. Figma-free (no layer in the design): `global__globe`.
 *
 * One animation loop draws the dots and the arcs on a canvas and moves the cards (plain DOM) by `transform`, without React renders.
 * The loop runs only while the globe is on screen. With `prefers-reduced-motion` one still picture is drawn and nothing moves.
 */
export function Globe({ progress, appear, slotRef, reduced }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotProbeRef = useRef<HTMLSpanElement>(null)
  const lineProbeRef = useRef<HTMLSpanElement>(null)
  const pinElements = useRef<(HTMLDivElement | null)[]>([])
  // Survives a theme change: the globe must not jump back to its start angle.
  const motionState = useRef({ spin: 0, dragLongitude: 0, dragLatitude: 0, longitudeSpeed: 0, latitudeSpeed: 0, cardsOn: 0, cardsClock: 0 })
  // The effect restarts on a theme change: both colors are read again.
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const state = motionState.current
    const pinVectors = pins.map((pin) => latLonToVector(pin.lat, pin.lon))
    const pinTracks = pins.map((pin) => ({ opacity: sampleTrack(pinTimelines[pin.id].opacity), scale: sampleTrack(pinTimelines[pin.id].scale) }))
    const routes = routeIds.map((id) => {
      const from = pinVectors[pinIndex(routeSource[id])]
      const to = pinVectors[pinIndex(routeTarget[id])]
      return { from, to, angle: angleBetween(from, to), opacity: sampleTrack(routeTimelines[id].opacity), draw: sampleTrack(routeTimelines[id].draw) }
    })

    let width = 0
    let height = 0
    let slot = { x: 0, y: 0, radius: 100 }
    let dotColor = ''
    let lineColor = ''
    let latticeSize = 0
    let dots = new Float32Array(0)
    let offsetX = new Float32Array(0)
    let offsetY = new Float32Array(0)
    let screenX = new Float32Array(0)
    let screenY = new Float32Array(0)
    let level = new Uint8Array(0)
    let frameId = 0
    let running = false
    let lastTime = 0
    let isVisible = true
    // The pointer in the viewport; touch is ignored (a finger scrolls the page or turns the globe).
    let pointer = { x: -1000, y: -1000 }
    let drag: { id: number; x: number; y: number } | null = null
    // Where the globe stood in the last frame: the hand grabs only the globe, not the empty space around it.
    let geometry = { x: 0, y: 0, radius: 0 }
    let published = ''
    const point = [0, 0, 0]
    const arc = [0, 0, 0]

    const readColors = () => {
      dotColor = dotProbeRef.current ? getComputedStyle(dotProbeRef.current).color : ''
      lineColor = lineProbeRef.current ? getComputedStyle(lineProbeRef.current).color : ''
    }

    const buildDots = () => {
      // Dot count follows the final size of the globe: the same spacing on a phone and on a big screen.
      const wanted = Math.round((4 * Math.PI * (slot.radius / DOT_SPACING) ** 2) / 1000) * 1000
      const size = clamp(wanted, 4000, 60000)
      if (size === latticeSize) return
      latticeSize = size
      dots = createLandDots(size)
      const count = dots.length / 3
      offsetX = new Float32Array(count)
      offsetY = new Float32Array(count)
      screenX = new Float32Array(count)
      screenY = new Float32Array(count)
      level = new Uint8Array(count)
    }

    const measure = () => {
      const rect = canvas.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      const slotElement = slotRef.current
      if (slotElement) {
        const slotRect = slotElement.getBoundingClientRect()
        // The slot may be wider than high (on a phone it takes the space left by the text): the globe fits inside.
        slot = {
          x: slotRect.left - rect.left + slotRect.width / 2,
          y: slotRect.top - rect.top + slotRect.height / 2,
          radius: Math.min(slotRect.width, slotRect.height) / 2,
        }
      }
      buildDots()
    }

    /** Draws one frame. `delta` is the time since the last frame in seconds (0 for a still picture). */
    const render = (delta: number) => {
      const scroll = reduced ? 1 : progress.get()
      const appearance = reduced ? 1 : smoothstep(0, 1, appear.get())

      // Where the globe stands: from big in the middle of the screen to its place in the layout.
      const move = smoothstep(MOVE_FROM, MOVE_TO, scroll)
      const bigRadius = Math.max(width * BIG_WIDTH_RATIO, height * BIG_HEIGHT_RATIO)
      const radius = lerp(bigRadius * lerp(APPEAR_SCALE_FROM, 1, appearance), slot.radius, move)
      const centerX = lerp(width / 2, slot.x, move)
      const centerY = lerp(height / 2, slot.y, move)
      geometry = { x: centerX, y: centerY, radius }

      // Turn: slow spin plus the offset of the hand (a spring brings it back when the hand is gone).
      const seconds = Math.min(delta, 0.1)
      if (!reduced) {
        state.spin += seconds
        if (!drag) {
          state.longitudeSpeed += (-SPRING * state.dragLongitude - SPRING_DAMPING * state.longitudeSpeed) * seconds
          state.latitudeSpeed += (-SPRING * state.dragLatitude - SPRING_DAMPING * state.latitudeSpeed) * seconds
          state.dragLongitude += state.longitudeSpeed * seconds
          state.dragLatitude += state.latitudeSpeed * seconds
        }
      }
      const longitude = (START_LONGITUDE - (state.spin * 360) / TURN_SECONDS) * RAD + softLimit(state.dragLongitude, DRAG_LIMIT_LONGITUDE)
      const latitude = TILT * RAD + softLimit(state.dragLatitude, DRAG_LIMIT_LATITUDE)
      const view = createView(longitude, latitude)

      const rect = canvas.getBoundingClientRect()
      const mouseX = pointer.x - rect.left
      const mouseY = pointer.y - rect.top
      const frames = Math.min(seconds * 60, 3)
      const relax = (1 - POINTER_EASE) ** frames
      const pushScale = POINTER_FORCE * 50 * 0.2 * frames
      const radiusSquared = POINTER_RADIUS * POINTER_RADIUS

      // Project the dots; the far side is not drawn. The pointer pushes the visible ones away (same formulas as InteractiveDots).
      const count = dots.length / 3
      for (let i = 0; i < count; i++) {
        const x = dots[i * 3]
        const y = dots[i * 3 + 1]
        const z = dots[i * 3 + 2]
        const x1 = x * view.cosYaw - z * view.sinYaw
        const z1 = x * view.sinYaw + z * view.cosYaw
        const depth = y * view.sinPitch + z1 * view.cosPitch
        if (depth < 0) {
          level[i] = 255
          offsetX[i] = 0
          offsetY[i] = 0
          continue
        }
        const baseX = centerX + x1 * radius
        const baseY = centerY - (y * view.cosPitch - z1 * view.sinPitch) * radius

        let shiftX = offsetX[i]
        let shiftY = offsetY[i]
        const dx = mouseX - (baseX + shiftX)
        const dy = mouseY - (baseY + shiftY)
        const distanceSquared = dx * dx + dy * dy
        if (distanceSquared < radiusSquared && distanceSquared > 0) {
          const distance = Math.sqrt(distanceSquared)
          const push = (((POINTER_RADIUS - distance) / POINTER_RADIUS) * pushScale) / distance
          shiftX -= dx * push
          shiftY -= dy * push
        }
        shiftX *= relax
        shiftY *= relax
        offsetX[i] = shiftX
        offsetY[i] = shiftY
        screenX[i] = baseX + shiftX
        screenY[i] = baseY + shiftY
        level[i] = depth < LEVEL_FROM_DEPTH[1] ? 0 : depth < LEVEL_FROM_DEPTH[2] ? 1 : depth < LEVEL_FROM_DEPTH[3] ? 2 : 3
      }

      context.clearRect(0, 0, width, height)
      context.fillStyle = dotColor
      const dotRadius = DOT_RADIUS * (radius / CARD_REFERENCE_RADIUS) ** DOT_RADIUS_GROWTH
      for (let shade = 0; shade < LEVEL_ALPHA.length; shade++) {
        const size = dotRadius * LEVEL_SIZE[shade]
        context.globalAlpha = LEVEL_ALPHA[shade] * appearance
        context.beginPath()
        for (let i = 0; i < count; i++) {
          if (level[i] !== shade) continue
          context.moveTo(screenX[i] + size, screenY[i])
          context.arc(screenX[i], screenY[i], size, 0, Math.PI * 2)
        }
        context.fill()
      }

      // Cards and arcs start when the globe has stood up; scrolling back up hides them and rewinds the loop.
      const wantCards = reduced || scroll >= CARDS_AT
      state.cardsOn = reduced ? 1 : state.cardsOn + ((wantCards ? 1 : 0) - state.cardsOn) * (1 - Math.exp(-seconds / 0.25))
      if (!wantCards && state.cardsOn < 0.01) state.cardsClock = 0
      else state.cardsClock += seconds
      const loop = reduced ? STILL_FRAME / FRAMES : (state.cardsClock % DURATION) / DURATION

      // Arcs: dashed, lifted over the surface, drawn from the source country; the part behind the globe is hidden.
      if (state.cardsOn > 0.005) {
        context.strokeStyle = lineColor
        context.lineCap = 'round'
        context.lineWidth = Math.max(1, radius * 0.0046)
        context.setLineDash([radius * 0.018, radius * 0.018])
        for (const route of routes) {
          const drawn = route.draw(loop)
          const alpha = route.opacity(loop) * state.cardsOn * appearance
          if (drawn < 0.002 || alpha < 0.005) continue
          context.globalAlpha = alpha
          context.beginPath()
          let penDown = false
          for (let step = 0; step <= ARC_STEPS; step++) {
            arcPoint(route.from, route.to, route.angle, (drawn * step) / ARC_STEPS, arc)
            rotateInto(view, arc[0], arc[1], arc[2], point)
            if (!isSeen(point[0], point[1], point[2])) {
              penDown = false
              continue
            }
            const px = centerX + point[0] * radius
            const py = centerY - point[1] * radius
            if (penDown) context.lineTo(px, py)
            else context.moveTo(px, py)
            penDown = true
          }
          context.stroke()
        }
        context.setLineDash([])
      }
      context.globalAlpha = 1

      // Cards: each one stands on its country; it fades with the timeline and with the turn of its country to the rim.
      const cardScale = clamp(slot.radius / CARD_REFERENCE_RADIUS, MIN_CARD_SCALE, 1)
      pins.forEach((_, index) => {
        const element = pinElements.current[index]
        if (!element) return
        const vector = pinVectors[index]
        rotateInto(view, vector[0], vector[1], vector[2], point)
        const facing = smoothstep(CARD_VISIBLE_FROM, CARD_VISIBLE_TO, point[2])
        const track = pinTracks[index]
        const opacity = facing * state.cardsOn * appearance * track.opacity(loop)
        element.style.opacity = opacity < 0.004 ? '0' : opacity.toFixed(3)
        if (opacity < 0.004) return
        const grow = track.scale(loop)
        element.style.transform = `translate3d(${(centerX + point[0] * radius).toFixed(1)}px, ${(centerY - point[1] * radius).toFixed(1)}px, 0) scale(${(cardScale * grow).toFixed(3)})`
      })

      // For tests and debugging: where the globe is and whether the cards are on.
      const summary = `${Math.round(radius)}|${Math.round(centerX)}|${Math.round(centerY)}|${state.cardsOn > 0.5 ? 1 : 0}`
      if (summary !== published) {
        published = summary
        canvas.dataset.radius = String(Math.round(radius))
        canvas.dataset.centerX = String(Math.round(centerX))
        canvas.dataset.centerY = String(Math.round(centerY))
        canvas.dataset.cards = state.cardsOn > 0.5 ? 'on' : 'off'
      }
    }

    const tick = (time: number) => {
      render((time - lastTime) / 1000)
      lastTime = time
      frameId = requestAnimationFrame(tick)
    }

    const start = () => {
      if (running || !isVisible || reduced) return
      running = true
      lastTime = performance.now()
      frameId = requestAnimationFrame(tick)
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(frameId)
    }

    const isOnGlobe = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      return Math.hypot(clientX - rect.left - geometry.x, clientY - rect.top - geometry.y) <= geometry.radius * 1.02
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      if (!isOnGlobe(event.clientX, event.clientY)) return
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY }
      state.longitudeSpeed = 0
      state.latitudeSpeed = 0
      canvas.setPointerCapture(event.pointerId)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (drag && event.pointerId === drag.id) {
        // The surface follows the hand: one radius of travel is one radian. A finger turns it sideways only (up and down scrolls the page).
        const radius = Math.max(geometry.radius, 1)
        const moveX = (event.clientX - drag.x) / radius
        const moveY = event.pointerType === 'touch' ? 0 : (event.clientY - drag.y) / radius
        drag = { id: drag.id, x: event.clientX, y: event.clientY }
        state.dragLongitude = clamp(state.dragLongitude - moveX, -2.5 * DRAG_LIMIT_LONGITUDE, 2.5 * DRAG_LIMIT_LONGITUDE)
        state.dragLatitude = clamp(state.dragLatitude + moveY, -2.5 * DRAG_LIMIT_LATITUDE, 2.5 * DRAG_LIMIT_LATITUDE)
        state.longitudeSpeed = 0
        state.latitudeSpeed = 0
      }
      if (event.pointerType === 'touch') return
      pointer = { x: event.clientX, y: event.clientY }
      canvas.style.cursor = drag ? 'grabbing' : isOnGlobe(event.clientX, event.clientY) ? 'grab' : ''
    }

    const onPointerEnd = (event: PointerEvent) => {
      if (drag && event.pointerId === drag.id) drag = null
    }

    const onPointerLeave = () => {
      pointer = { x: -1000, y: -1000 }
    }

    readColors()
    measure()
    render(0)

    const resizeObserver = new ResizeObserver(() => {
      measure()
      if (reduced) render(0)
    })
    resizeObserver.observe(canvas)
    if (slotRef.current) resizeObserver.observe(slotRef.current)

    // Nothing is drawn for a globe nobody sees.
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
      if (isVisible) start()
      else stop()
    })
    visibilityObserver.observe(canvas)

    if (!reduced) {
      canvas.addEventListener('pointerdown', onPointerDown)
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('pointerup', onPointerEnd)
      window.addEventListener('pointercancel', onPointerEnd)
      document.documentElement.addEventListener('pointerleave', onPointerLeave)
    }
    start()

    return () => {
      stop()
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerEnd)
      window.removeEventListener('pointercancel', onPointerEnd)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [theme, progress, appear, slotRef, reduced])

  return (
    <div data-el="global__globe" aria-hidden="true" className="absolute inset-0">
      {/* touch-pan-y: a finger moving up and down scrolls the page, sideways it turns the globe. */}
      <canvas ref={canvasRef} className="absolute inset-0 block size-full touch-pan-y" />
      {/* Colors come from tokens: read from these hidden elements so that they follow the theme. */}
      <span ref={dotProbeRef} className="hidden text-surface-dots" />
      <span ref={lineProbeRef} className="hidden text-typography-tertiary" />
      {pins.map((pin, index) => (
        <PinCard
          key={pin.id}
          pin={pin}
          outerRef={(element) => {
            pinElements.current[index] = element
          }}
        />
      ))}    </div>
  )
}
