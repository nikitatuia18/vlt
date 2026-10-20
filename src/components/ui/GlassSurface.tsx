import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useId, useMemo, useRef, useState, type ComponentProps, type PointerEvent } from 'react'

/*
 * Glass like in the design: the Figma "Glass" effect of the card `industries__item-startups-inner` is
 * frost 6, refraction 1, depth 100, dispersion 0.4, light angle -45, light intensity 0.8, fill neutral/900 at 16 %, stroke white at 6 %.
 * Here it is built from layers (see GlassSurface below). Tune the look with these constants.
 */
/** Figma frost (radius 6): blur of what is behind the glass, px. */
const FROST_PX = 6
/** More color for what is seen through the glass, like real glass over a bright background. */
const SATURATE = 1.4
const BRIGHTNESS = 1.05
/** Figma refraction (0 to 1): how far the picture at the very edge is pulled, px at 1. */
const REFRACTION = 1
const MAX_SHIFT_PX = 22
/** Figma depth (100 of 100): how far from the edge the refraction reaches, px. */
const BEZEL_PX = 44
/** Figma dispersion (0.4): the three color channels are pulled by a slightly different amount, so the edge has a thin color fringe. */
const DISPERSION = 0.4
/** Figma light: the light comes from the upper left (angle -45) with this strength; the lower right edge gets a weaker reflection. */
const RIM_ANGLE_DEG = 135
const LIGHT_INTENSITY = 0.8
/** The size of the bright spot that follows the pointer, px. */
const SPECULAR_RADIUS = 260
const SPECULAR_STRENGTH = 0.16

type GlassSurfaceProps = ComponentProps<'div'> & {
  /** Corner radius, px (it is also used for the shape of the refraction). Figma: 32. */
  radius?: number
  /** Off: the glass layers fade away (and the costly backdrop filter is dropped); the box and its content stay. */
  active?: boolean
}

/** Only Chromium (Chrome, Edge) draws `backdrop-filter: url(#svg-filter)`; elsewhere the glass stays frost + light, without the bent edge. */
const canRefract =
  typeof navigator !== 'undefined' &&
  typeof CSS !== 'undefined' &&
  /Chrome\//.test(navigator.userAgent) &&
  CSS.supports('backdrop-filter', 'url(#a) blur(1px)')

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

/**
 * Displacement map of a rounded rectangle for feDisplacementMap: neutral (50 %) in the middle, near the edge the red and green
 * channels lean along the inward normal. Drawn at half size (it is stretched over the box, so it stays smooth).
 */
function drawRefractionMap(width: number, height: number, radius: number) {
  const scale = 0.5
  const w = Math.max(2, Math.round(width * scale))
  const h = Math.max(2, Math.round(height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const context = canvas.getContext('2d')
  if (!context) return ''
  const image = context.createImageData(w, h)
  const halfW = width / 2
  const halfH = height / 2
  const corner = Math.min(radius, halfW, halfH)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Point in box pixels, relative to the centre.
      const px = (x + 0.5) / scale - halfW
      const py = (y + 0.5) / scale - halfH
      const qx = Math.abs(px) - (halfW - corner)
      const qy = Math.abs(py) - (halfH - corner)
      const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0))
      const distanceToEdge = -(outside + Math.min(Math.max(qx, qy), 0) - corner) // > 0 inside
      // Outward normal of the edge.
      let nx: number
      let ny: number
      if (qx > 0 && qy > 0) {
        nx = (qx / outside) * Math.sign(px)
        ny = (qy / outside) * Math.sign(py)
      } else if (qx > qy) {
        nx = Math.sign(px)
        ny = 0
      } else {
        nx = 0
        ny = Math.sign(py)
      }
      const strength = Math.pow(1 - clamp01(distanceToEdge / BEZEL_PX), 2.2) // 1 at the edge, 0 in the middle
      const offset = (y * w + x) * 4
      // The picture at the edge is pulled from the inside (against the normal): displacement = -normal * strength.
      image.data[offset] = Math.round(255 * (0.5 - nx * strength * 0.5))
      image.data[offset + 1] = Math.round(255 * (0.5 - ny * strength * 0.5))
      image.data[offset + 2] = 128
      image.data[offset + 3] = 255
    }
  }
  context.putImageData(image, 0, 0)
  return canvas.toDataURL('image/png')
}

// Very faint film grain, so that the glass is not a flat plastic. An SVG noise, inline (no file).
const grain =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>\")"

/** White of the light at a share of its strength (the same in both themes: glass reflects light, not the page color). */
const light = (share: number) => `color-mix(in srgb, var(--color-surface-static-w) ${Math.round(share * 100)}%, transparent)`

/**
 * A pane of glass for a card that lies over a colored background (the open card of the Industries block).
 * Layers, bottom to top: the frosted and tinted backdrop (in Chromium also bent at the edge, with a color fringe), the fill
 * from the design, a light rim (a gradient line: the light comes from the upper left), inner light, a bright spot that follows
 * the pointer, a trace of grain. The content lies above everything and is not touched.
 * The box itself (size, padding, flex) is the caller's: put the classes on it as on a plain div.
 */
export function GlassSurface({ radius = 32, active = true, className = '', children, ...divProps }: GlassSurfaceProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const filterId = `glass-${useId().replace(/:/g, '')}`
  const [mapUrl, setMapUrl] = useState('')
  const refract = canRefract && active && mapUrl !== ''

  // The refraction map is drawn for the current size; the size changes while the card opens, so wait until it settles.
  useEffect(() => {
    const root = rootRef.current
    if (!root || !canRefract || !active) return
    let timer: ReturnType<typeof setTimeout> | undefined
    let drawn = { width: 0, height: 0 }
    const redraw = () => {
      const { width, height } = root.getBoundingClientRect()
      if (Math.abs(width - drawn.width) < 6 && Math.abs(height - drawn.height) < 6) return
      drawn = { width, height }
      setMapUrl(drawRefractionMap(width, height, radius))
    }
    const observer = new ResizeObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(redraw, 120)
    })
    observer.observe(root)
    redraw()
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [active, radius])

  // The bright spot: follows the pointer with a spring and fades in while the pointer is over the glass.
  const spotX = useSpring(useMotionValue(0), { stiffness: 220, damping: 28 })
  const spotY = useSpring(useMotionValue(0), { stiffness: 220, damping: 28 })
  const spotOpacity = useSpring(useMotionValue(0), { stiffness: 120, damping: 24 })
  const spot = useMotionTemplate`radial-gradient(circle ${SPECULAR_RADIUS}px at ${spotX}px ${spotY}px, ${light(SPECULAR_STRENGTH)}, transparent 70%)`
  const moveSpot = (event: PointerEvent<HTMLDivElement>) => {
    if (!active || event.pointerType === 'touch') return
    const box = event.currentTarget.getBoundingClientRect()
    spotX.set(event.clientX - box.left)
    spotY.set(event.clientY - box.top)
    spotOpacity.set(1)
  }

  const backdrop = useMemo(() => {
    const base = `blur(${FROST_PX}px) saturate(${SATURATE}) brightness(${BRIGHTNESS})`
    return refract ? `url(#${filterId}) ${base}` : base
  }, [refract, filterId])

  const shape = { borderRadius: radius }
  // The layers have a negative z-index inside the isolated box: they lie under the content (which is not positioned), above the page.
  const layer = `pointer-events-none absolute inset-0 -z-10 transition-opacity duration-700 ease-out ${active ? 'opacity-100' : 'opacity-0'}`

  return (
    <div
      ref={rootRef}
      className={`relative isolate ${className}`}
      style={shape}
      onPointerMove={moveSpot}
      onPointerLeave={() => spotOpacity.set(0)}
      {...divProps}
    >
      {refract ? (
        <svg width="0" height="0" aria-hidden="true" className="pointer-events-none absolute">
          <defs>
            <filter id={filterId} x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
              <feImage href={mapUrl} x="0%" y="0%" width="100%" height="100%" preserveAspectRatio="none" result="map" />
              {/* Each channel is pulled a bit differently (dispersion), then the three are put back together. */}
              {[
                { channel: 'R', matrix: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', factor: 1 + DISPERSION * 0.12 },
                { channel: 'G', matrix: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', factor: 1 },
                { channel: 'B', matrix: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0', factor: 1 - DISPERSION * 0.12 },
              ].map(({ channel, matrix, factor }) => (
                <g key={channel}>
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="map"
                    scale={2 * MAX_SHIFT_PX * REFRACTION * factor}
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result={`shift${channel}`}
                  />
                  <feColorMatrix in={`shift${channel}`} type="matrix" values={matrix} result={`only${channel}`} />
                </g>
              ))}
              <feBlend in="onlyR" in2="onlyG" mode="screen" result="rg" />
              <feBlend in="rg" in2="onlyB" mode="screen" />
            </filter>
          </defs>
        </svg>
      ) : null}

      {/* 1. Backdrop: frost, color, bent edge. The tint is the fill of the design (surface/16-white). */}
      <div
        aria-hidden="true"
        data-glass="backdrop"
        className={`${layer} bg-surface-white-16`}
        style={{ ...shape, backdropFilter: active ? backdrop : 'none', WebkitBackdropFilter: active ? backdrop : 'none' }}
      />
      {/* 2. A gentle diagonal sheen: the glass is a little brighter on the side the light comes from. */}
      <div
        aria-hidden="true"
        className={layer}
        style={{ ...shape, backgroundImage: `linear-gradient(${RIM_ANGLE_DEG}deg, ${light(0.1 * LIGHT_INTENSITY)}, transparent 45%, ${light(0.04)})` }}
      />
      {/* 3. The rim: a 1 px line, bright where the light hits (upper left), weaker at the lower right, faint between. */}
      <div
        aria-hidden="true"
        data-glass="rim"
        className={layer}
        style={{
          ...shape,
          padding: 1,
          backgroundImage: `linear-gradient(${RIM_ANGLE_DEG}deg, ${light(0.7 * LIGHT_INTENSITY)} 0%, ${light(0.08)} 32%, ${light(0.06)} 66%, ${light(0.4 * LIGHT_INTENSITY)} 100%)`,
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)',
        }}
      />
      {/* 4. Inner light along the inside of the edge. */}
      <div
        aria-hidden="true"
        className={layer}
        style={{
          ...shape,
          boxShadow: `inset 0 1px 0 ${light(0.35 * LIGHT_INTENSITY)}, inset 0 -1px 0 ${light(0.1)}, inset 0 0 32px ${light(0.07)}`,
        }}
      />
      {/* 5. The bright spot under the pointer. */}
      <motion.div aria-hidden="true" data-glass="spot" className="pointer-events-none absolute inset-0 -z-10" style={{ ...shape, backgroundImage: spot, opacity: spotOpacity }} />
      {/* 6. Grain. */}
      <div aria-hidden="true" className={layer} style={{ ...shape, backgroundImage: grain, opacity: active ? 0.06 : 0 }} />

      {children}
    </div>
  )
}
