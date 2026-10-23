import { useState, type CSSProperties, type ReactNode } from 'react'
import { Badge } from '../components/ui/Badge'
import { ButtonLink } from '../components/ui/ButtonLink'
import { GlowBackdrop, type GlowHue } from '../components/ui/GlowBackdrop'
import { InteractiveDots } from '../components/ui/InteractiveDots'
import { useForcedTheme, useTheme } from '../lib/theme'
import { emergeStyle } from '../motion/emerge'
import { CountUp, Reveal, RevealLines } from '../motion/reveal'
import { useRevealOn } from '../motion/useReveal'
import { Section } from './Section'

/*
 * The living part of the UI Kit about movement and surfaces: how things appear, the dot ripple, glow, theme scenes.
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
        note="How things come into view. One language for the whole site: take a ready-made way from here, do not invent a new one. THE RULE: all text rises word by word (RevealLines; button and badge labels do it by themselves), except counting figures, the cards on the globe, the glass badges and the narrow menu. Everything plays once, when the element is on the screen, and only moves transform and opacity (plus a light blur for “up”), so the layout never shifts."
      >
        {!revealOn && (
          <p data-el="ui-kit__reveal-off" className="type-body-sm text-typography-secondary">
            The appearance is switched off here (reduced motion, the emergency switch or the test flag): the tiles show the final state.
          </p>
        )}
        <ul className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
          <Tile name="lines" usage="RevealLines by=&quot;line&quot;: a whole line rises (the earlier way; every text uses by word now). Give the lines as an array.">
            <RevealLines as="h3" by="line" lines={['Everything you need', 'to move money.']} className="type-heading-md text-center text-typography-primary" />
          </Tile>
          <Tile name="words" usage='RevealLines (the way for all headings and texts): every word rises from its own mask, one after another (0.07 s for a heading, 0.03 s for a paragraph); under the mask a word is a little smaller and grows to full size. Wraps like text.'>
            <RevealLines
              as="h3"
              lines={['What are our next steps?']}
              className="type-heading-md max-w-64 text-center text-typography-primary"
            />
          </Tile>
          <Tile name="labels" usage="ButtonLink and Badge: the label rises word by word by itself; labelReveal={{ delay, atLoad, when, open }} says when. The pill itself comes with Reveal variant=&quot;fade&quot;.">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Reveal variant="fade">
                <ButtonLink href="#appearance" icon="export" onClick={(event) => event.preventDefault()} labelReveal={{ delay: 0.15 }}>
                  Book a demo
                </ButtonLink>
              </Reveal>
              <Reveal variant="fade" delay={0.1}>
                <Badge icon="clock" labelReveal={{ delay: 0.3 }}>
                  Coming soon
                </Badge>
              </Reveal>
            </div>
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
          <Tile name="emerge" usage='variant="emerge" + emergeStyle(dx, dy) (motion/emerge.ts): a glass badge flies out from behind a figure (a layer above it) to its place and grows. (dx, dy): where it starts, from its place. The badges of the Cta banner, one after another (0.2 s).' tall>
            <div className="relative h-32 w-full" style={{ '--s': 1 } as CSSProperties}>
              <Reveal variant="emerge" className="absolute top-1/2 left-1/2 h-0 w-0" style={{ marginLeft: 40, marginTop: -16 }}>
                <div className="h-0 w-0" style={emergeStyle(-100, 0)}>
                  <span className="type-ui-lg block w-max rounded-pill bg-surface-black-16 px-4 py-2 text-typography-primary ring-1 ring-border-subtle ring-inset backdrop-blur-sm">
                    Instant KYB
                  </span>
                </div>
              </Reveal>
              <span className="absolute top-1/2 left-1/2 size-20 -translate-x-[calc(50%+40px)] -translate-y-1/2 rounded-pill bg-icon-primary" />
            </div>
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

export function GlowSection() {
  return (
    <>
      <Section
        id="glow"
        title="Glow"
        note="GlowBackdrop: a soft ellipse of colored light behind a card (Figma layer Ellipse 215: a radial gradient from the color to nothing). Hues are the tokens surface-glow-*. Several glows on top of each other cross-fade when you show one. The card over it is a faint see-through fill (surface-white-16) with a thin ring, no blur: it is cheap on a weak computer."
      >
        <ul className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
          {glowHues.map((hue) => (
            <li key={hue} data-el={`ui-kit__glow-demo-${hue}`}>
              <DarkPanel className="h-56">
                <GlowBackdrop hue={hue} visible className="absolute top-1/2 left-1/2 h-52 w-[130%] -translate-x-1/2 -translate-y-1/2" />
                <div className="relative flex flex-col items-center gap-3 rounded-32 bg-surface-white-16 px-8 py-6 text-center ring-1 ring-border-subtle ring-inset">
                  <p className="type-heading-md text-typography-primary">{hue}</p>
                  <ButtonLink href="#glow" variant="inverse" icon="export" onClick={(event) => event.preventDefault()}>
                    Book a demo
                  </ButtonLink>
                </div>
              </DarkPanel>
            </li>
          ))}
        </ul>
        <Dl
          items={[
            ['GlowBackdrop', 'hue, visible, className (size and place: a positioned parent is needed). The cross-fade takes 0.7 s. It has no blur filter on purpose: the soft edge is in the gradient (a blurred layer 2400 px wide is heavy to repaint).'],
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
          ['The circle', 'A change of the theme is one circle that grows from a point (the toggle in the header, or the middle of the screen on an Industries scene). Inside the circle the page is already in the new theme, outside it is still the old one; it fills the page in about 1 s. The scroll is held meanwhile. Press the toggle in the header to see it. Instant with reduced motion.'],
          ['A dark part of a page', 'data-theme="dark" on any element flips the tokens inside it (the dark panels of this page). For a whole-site scene use useForcedTheme instead.'],
        ]}
      />
    </Section>
  )
}
