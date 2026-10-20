import { motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { ButtonLink } from '../components/ui/ButtonLink'
import { GlassSurface } from '../components/ui/GlassSurface'
import { GlowBackdrop, type GlowHue } from '../components/ui/GlowBackdrop'
import { InteractiveDots } from '../components/ui/InteractiveDots'
import { useGlowParallax } from '../components/ui/useGlowParallax'
import { useForcedTheme, useTheme } from '../lib/theme'
import { CountUp, Reveal, RevealLines } from '../motion/reveal'
import { useRevealOn } from '../motion/useReveal'
import { Section } from './Section'

/*
 * The living part of the UI Kit about movement and surfaces: how things appear, the dot ripple, glass, glow, depth, theme scenes.
 * Every tile has a short "when to use" text; the full rules are in docs/ui-kit.md. Replay plays a tile again (it is mounted anew).
 */

const glowHues: readonly GlowHue[] = ['violet', 'pink', 'orange', 'blue', 'green']

function Dl({ items }: { items: readonly (readonly [string, ReactNode])[] }) {
  return (
    <dl className="type-body-sm grid grid-cols-1 gap-x-8 gap-y-2 text-typography-secondary tablet:grid-cols-2">
      {items.map(([term, description]) => (
        <div key={term}>
          <dt className="type-ui-sm text-typography-primary">{term}</dt>
          <dd>{description}</dd>
        </div>
      ))}
    </dl>
  )
}

/** One demo with a Replay button; the content is mounted again on every press, so its appearance plays again. */
function Tile({ name, usage, tall = false, children }: { name: string; usage: string; tall?: boolean; children: ReactNode }) {
  const [run, setRun] = useState(0)
  return (
    <li
      data-el={`ui-kit__reveal-${name}`}
      className="flex flex-col gap-3 rounded-32 bg-surface-subtle p-4 ring-1 ring-inset ring-border-subtle"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="type-ui-md text-typography-primary">{name}</p>
        <button
          type="button"
          data-el={`ui-kit__reveal-${name}-replay`}
          onClick={() => setRun((count) => count + 1)}
          className="type-ui-sm rounded-pill px-3 py-1.5 text-typography-primary ring-1 ring-border-medium ring-inset transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-brand"
        >
          Replay
        </button>
      </div>
      <div
        key={run}
        className={`relative flex items-center justify-center overflow-hidden rounded-32 bg-surface-page p-4 ring-1 ring-border-subtle ring-inset ${tall ? 'h-48' : 'min-h-32'}`}
      >
        {children}
      </div>
      <p className="type-body-sm text-typography-secondary">{usage}</p>
    </li>
  )
}

export function AppearanceSections() {
  const revealOn = useRevealOn()
  return (
    <>
      <Section
        id="appearance"
        title="Appearance (reveal)"
        note="How things come into view. One language for the whole site: take a ready-made way from here, do not invent a new one. Everything plays once, when the element is on the screen, and only moves transform and opacity (plus a light blur for “up”), so the layout never shifts."
      >
        {!revealOn && (
          <p data-el="ui-kit__reveal-off" className="type-body-sm text-typography-secondary">
            The appearance is switched off here (reduced motion, the emergency switch or the test flag): the tiles show the final state.
          </p>
        )}
        <ul className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
          <Tile name="lines" usage="RevealLines: headings. Every line rises from under a mask, one after another. Give the lines as an array.">
            <RevealLines as="h3" lines={['Everything you need', 'to move money.']} className="type-heading-md text-center text-typography-primary" />
          </Tile>
          <Tile name="up" usage='Reveal variant="up" (default): texts, buttons. Rises and clears up from a light blur. Neighbours: delay 0.1 each.'>
            <div className="flex flex-col items-center gap-3">
              <Reveal as="p" className="type-body-md text-center text-typography-secondary">
                One API for payments, crypto and payouts.
              </Reveal>
              <Reveal delay={0.12}>
                <ButtonLink href="#appearance" icon="export" onClick={(event) => event.preventDefault()}>
                  Book a demo
                </ButtonLink>
              </Reveal>
            </div>
          </Tile>
          <Tile name="drop" usage='variant="drop": small things that come down into place (the parts of the header).'>
            <div className="flex gap-4">
              {['Products', 'Solutions', 'Pricing'].map((label, index) => (
                <Reveal key={label} as="span" variant="drop" delay={index * 0.08} className="type-ui-sm text-typography-primary">
                  {label}
                </Reveal>
              ))}
            </div>
          </Tile>
          <Tile name="card" usage='variant="card": cards. Rise and grow a little. In a row: delay index × 0.12.' tall>
            <div className="grid w-full grid-cols-3 gap-3">
              {[0, 1, 2].map((index) => (
                <Reveal key={index} variant="card" delay={index * 0.12} className="h-24 rounded-32 bg-surface-subtle ring-1 ring-border-subtle ring-inset" />
              ))}
            </div>
          </Tile>
          <Tile name="fade" usage='variant="fade": opacity only. For things that must not move (the items of a list that slides on its own).'>
            <Reveal as="p" variant="fade" className="type-heading-md text-typography-primary">
              Only opacity
            </Reveal>
          </Tile>
          <Tile name="rise" usage='variant="rise": a large figure comes in from below (the person of the banner).'>
            <Reveal variant="rise" className="size-20 rounded-pill bg-surface-brand-default" />
          </Tile>
          <Tile name="pop" usage='variant="pop": a dot or a small mark pops (overshoots and settles). The corner dots of the blocks.'>
            <div className="flex gap-6">
              {[0, 1, 2].map((index) => (
                <Reveal key={index} as="span" variant="pop" delay={index * 0.1} className="size-3 rounded-pill bg-icon-primary" />
              ))}
            </div>
          </Tile>
          <Tile name="spring" usage='variant="spring": a glass badge jumps out with a small overshoot. Scale only, no opacity (a blurred backdrop blinks under a half-transparent box).'>
            <Reveal variant="spring" className="origin-center rounded-pill bg-surface-black-16 px-4 py-2 ring-1 ring-border-subtle ring-inset backdrop-blur-sm">
              <span className="type-ui-lg text-typography-primary">Instant KYB</span>
            </Reveal>
          </Tile>
          <Tile name="shutter" usage='variant="shutter": a banner opens from a narrow strip in the middle to its full width.'>
            <Reveal variant="shutter" className="h-24 w-full rounded-40 bg-surface-brand-default" />
          </Tile>
          <Tile name="line-x" usage='variant="line-x" / "line-y": a divider draws itself. Give it origin-left (or origin-top) and a 1 px size.'>
            <div className="flex w-full flex-col gap-6">
              <Reveal variant="line-x" className="h-px w-full origin-left bg-border-strong" />
              <Reveal variant="line-x" delay={0.15} className="h-px w-full origin-left bg-border-strong" />
            </div>
          </Tile>
          <Tile name="count" usage="CountUp: a figure counts from zero to the number in the text (the rest of the text stays). It keeps its width.">
            <div className="flex gap-6">
              {['99.9%', '15+', '<1 sec'].map((value, index) => (
                <CountUp key={value} value={value} delay={index * 0.15} className="type-heading-lg text-typography-primary" />
              ))}
            </div>
          </Tile>
          <Tile name="ripple" usage="InteractiveDots ripple={{ delay, duration, origin }}: the dots of a background grow from a point to the edges." tall>
            <InteractiveDots ripple={{ delay: 0.1, duration: 1.4, origin: [0.5, 0.5] }} />
          </Tile>
        </ul>
        <Dl
          items={[
            ['Trigger', 'By default: when 20 % of the element is on the screen (8 % margin from the bottom). when={flag}: when the block says so (the Global text waits for the globe). atLoad: at once after the fonts are loaded (the first screen). atPageEnd: for what is at the very end of the page.'],
            ['Steps', 'Delay of neighbours: 0.06 to 0.15 s each, a whole group in no more than 0.8 s. The numbers are in appear (src/motion/tokens.ts).'],
            ['Reduced motion', 'Without movement: elements are plain, nothing is hidden. The same when the appearance is switched off.'],
            ['Emergency switch', 'REVEAL_ENABLED = false in src/motion/tokens.ts shows the whole site at once.'],
            ['Tests', 'localStorage "velant-reveal" = "off" switches the appearance off (playwright.config.ts sets it for all tests; tests/reveal.spec.ts turns it back on).'],
            ['Careful', 'Blocks that measure or move their content (Industries, Global, Cta): animate the headings and the items, not the boxes they measure.'],
          ]}
        />
      </Section>
    </>
  )
}

/** A dark panel: the tokens flip inside it, so it looks the same in a light site. */
function DarkPanel({ className = '', children, ...rest }: { className?: string; children: ReactNode; 'data-el'?: string }) {
  return (
    <div
      data-theme="dark"
      className={`relative flex items-center justify-center overflow-hidden rounded-32 bg-surface-page ring-1 ring-border-medium ring-inset ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

function ParallaxPanel() {
  const parallax = useGlowParallax(true)
  const [hue, setHue] = useState<GlowHue>('pink')
  return (
    <div className="flex flex-col gap-3">
      <DarkPanel className="h-72">
        <div
          data-el="ui-kit__glow-parallax"
          className="absolute inset-0 flex items-center justify-center"
          onPointerMove={(event) => parallax.follow(event, event.currentTarget.querySelector('[data-glass-card]')?.getBoundingClientRect())}
          onPointerLeave={parallax.reset}
        >
          <motion.div data-el="ui-kit__glow-parallax-layers" className="absolute inset-0" style={{ x: parallax.x, y: parallax.y }}>
            {glowHues.map((value) => (
              <GlowBackdrop
                key={value}
                hue={value}
                visible={value === hue}
                className="absolute top-1/2 left-1/2 h-40 w-[90%] -translate-x-1/2 -translate-y-1/2"
              />
            ))}
          </motion.div>
          <GlassSurface data-glass-card="" className="flex flex-col items-center gap-3 px-10 py-8 text-center">
            <p className="type-heading-md text-typography-primary">Move the pointer over me</p>
            <p className="type-body-md text-typography-secondary">The glow behind follows a little.</p>
          </GlassSurface>
        </div>
      </DarkPanel>
      <div className="flex flex-wrap gap-2">
        {glowHues.map((value) => (
          <button
            key={value}
            type="button"
            data-el={`ui-kit__glow-parallax-${value}`}
            aria-pressed={value === hue}
            onClick={() => setHue(value)}
            className="type-ui-sm rounded-pill px-3 py-1.5 text-typography-primary ring-1 ring-border-medium ring-inset transition-colors hover:bg-surface-hover aria-pressed:bg-surface-hover"
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  )
}

export function GlassAndGlowSections() {
  return (
    <>
      <Section
        id="glass"
        title="Glass"
        note="GlassSurface: a pane of glass for a card that lies over a colored background. It is the Figma Glass effect of the Industries card (frost 6, refraction 1, depth 100, dispersion 0.4, light -45 at 0.8), built from layers. The box (size, padding, flex) is yours: put the classes on it like on a div."
      >
        <ul className="grid grid-cols-1 gap-4 desktop:grid-cols-2">
          <li>
            <DarkPanel data-el="ui-kit__glass-on-glow" className="h-64">
              <GlowBackdrop hue="violet" visible className="absolute top-1/2 left-1/2 h-36 w-[110%] -translate-x-1/2 -translate-y-1/2" />
              <GlassSurface className="flex flex-col items-center gap-3 px-10 py-6 text-center">
                <p className="type-heading-md text-typography-primary">On a glow</p>
                <ButtonLink href="#glass" variant="inverse" icon="export" onClick={(event) => event.preventDefault()}>
                  Book a demo
                </ButtonLink>
              </GlassSurface>
            </DarkPanel>
          </li>
          <li>
            <DarkPanel data-el="ui-kit__glass-on-dots" className="h-64">
              <InteractiveDots />
              <GlassSurface className="flex flex-col items-center gap-3 px-10 py-6 text-center">
                <p className="type-heading-md text-typography-primary">On the dots</p>
                <p className="type-body-md text-typography-secondary">The dots bend at the edge.</p>
              </GlassSurface>
            </DarkPanel>
          </li>
        </ul>
        <Dl
          items={[
            ['Layers', 'Backdrop (blur 6, saturation, tint surface-white-16, bent edge in Chrome and Edge, color fringe) · diagonal sheen · 1 px rim, bright at the upper left · inner light · a bright spot that follows the pointer · a trace of grain.'],
            ['Other browsers', 'Safari and Firefox cannot bend a backdrop with an SVG filter: they get the frost, the rim, the light and the spot, without the bent edge.'],
            ['Props', 'radius (default 32), active (false fades the glass away and drops the costly filter; the box stays). Constants for the look: top of GlassSurface.tsx.'],
            ['Where', 'Over a colored or moving background only. On a flat light card use the usual surface-subtle.'],
          ]}
        />
      </Section>

      <Section
        id="glow"
        title="Glow and depth"
        note="GlowBackdrop: a soft blurred ellipse of colored light behind a card (Figma layer Ellipse 215: a radial gradient from the color to nothing, blur 100). Hues are the tokens surface-glow-*. Several glows on top of each other cross-fade when you show one. useGlowParallax makes the glow follow the pointer a little over the card."
      >
        <ul className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
          {glowHues.map((hue) => (
            <li key={hue} data-el={`ui-kit__glow-demo-${hue}`}>
              <DarkPanel className="h-56">
                <GlowBackdrop hue={hue} visible className="absolute top-1/2 left-1/2 h-40 w-[130%] -translate-x-1/2 -translate-y-1/2" />
                <GlassSurface className="flex flex-col items-center gap-3 px-8 py-6 text-center">
                  <p className="type-heading-md text-typography-primary">{hue}</p>
                  <ButtonLink href="#glow" variant="inverse" icon="export" onClick={(event) => event.preventDefault()}>
                    Book a demo
                  </ButtonLink>
                </GlassSurface>
              </DarkPanel>
            </li>
          ))}
        </ul>
        <ParallaxPanel />
        <Dl
          items={[
            ['GlowBackdrop', 'hue, visible, className (size and place: a positioned parent is needed). The cross-fade takes 0.7 s.'],
            ['Depth', 'useGlowParallax(enabled): returns x and y (spring motion values) for a motion element holding the glows, and follow(event, cardRect) / reset(). ±28 px by x and ±14 px by y at the edge of the card (GLOW_PARALLAX). Mouse and pen only, never with reduced motion.'],
            ['Colors', 'No Figma variables yet (an exception, see docs/tokens-map.md): pink is the color of the design, violet and blue were chosen, orange and green are brand/400 and green/500.'],
          ]}
        />
      </Section>
    </>
  )
}

function ForcedThemeDemo() {
  const [held, setHeld] = useState(false)
  const { theme, locked } = useTheme()
  useForcedTheme(held ? 'dark' : null)
  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        type="button"
        data-el="ui-kit__theme-scene-hold"
        aria-pressed={held}
        onClick={() => setHeld((value) => !value)}
        className="type-ui-sm rounded-pill px-4 py-2 text-typography-primary ring-1 ring-border-medium ring-inset transition-colors hover:bg-surface-hover aria-pressed:bg-surface-hover"
      >
        {held ? 'Release the theme' : 'Hold the dark theme (a scene)'}
      </button>
      <p className="type-body-sm text-typography-secondary" data-el="ui-kit__theme-scene-state">
        Theme now: {theme}; toggle {locked ? 'locked' : 'free'}
      </p>
    </div>
  )
}

export function ThemeSceneSection() {
  return (
    <Section
      id="theme-scenes"
      title="Theme and scenes"
      note="A block can darken the whole site for the time of its scene (the Industries items with a glow). The visitor's toggle is locked meanwhile, and the site goes back to the visitor's choice afterwards."
    >
      <ForcedThemeDemo />
      <Dl
        items={[
          ['useForcedTheme(theme | null)', 'Call it in a block with the theme the scene needs (null: nothing). Several scenes do not fight: the latest wins. Needs no other code: the tokens flip.'],
          ['useTheme()', 'theme (the one on the page), locked, setTheme (the visitor\'s choice; it applies when no scene holds the theme).'],
          ['Smooth change', 'On every change the page gets the class theme-fading for 0.8 s (index.css): colors, borders and fills fade over 0.7 s. Elements with their own transition keep it. Not with reduced motion.'],
          ['A dark part of a page', 'data-theme="dark" on any element flips the tokens inside it (the dark panels of this page). For a whole-site scene use useForcedTheme instead.'],
        ]}
      />
    </Section>
  )
}
