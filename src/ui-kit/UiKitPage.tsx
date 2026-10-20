import { useEffect, useRef, useState, type ReactNode } from 'react'
import exportIcon from '../assets/icons/export.svg'
import moonIcon from '../assets/icons/moon.svg'
import sunIcon from '../assets/icons/sun.svg'
import { Badge } from '../components/ui/Badge'
import { ButtonLink } from '../components/ui/ButtonLink'
import { Container } from '../components/ui/Container'
import { ColumnFade } from '../components/ui/ColumnFade'
import { Footer } from '../components/ui/Footer'
import { GlowBackdrop, type GlowHue } from '../components/ui/GlowBackdrop'
import { Header } from '../components/ui/Header'
import { CornerDots } from '../components/ui/CornerDots'
import { Icon } from '../components/ui/Icon'
import { IconButton } from '../components/ui/IconButton'
import { IconLink } from '../components/ui/IconLink'
import { InteractiveDots } from '../components/ui/InteractiveDots'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { useTheme } from '../lib/theme'
import tokensCss from '../styles/tokens.css?raw'

/*
 * Living UI Kit, available at /ui-kit. It shows everything the design system contains,
 * in the current theme (use the toggle at the top for Light/Dark).
 * Colors are read from tokens.css, so a new color token appears here without editing this file.
 * Text styles are listed below by hand because Tailwind only generates classes it sees written out in the source;
 * tests/ui-kit.spec.ts fails if this list and typography.css drift apart.
 */

// Semantic colors: the Light block of tokens.css (`@theme static`).
const themeBlock = tokensCss.split('@theme static {')[1]?.split('\n}')[0] ?? ''
const colorTokens = [...themeBlock.matchAll(/--(color-[a-z0-9-]+):/g)].map((match) => match[1])
const colorGroups = ['typography', 'icon', 'surface', 'border'].map((group) => ({
  group,
  tokens: colorTokens.filter((token) => token.startsWith(`color-${group}-`)),
}))

const glowHues: readonly GlowHue[] = ['violet', 'pink', 'orange', 'blue', 'green']

const textStyles = [
  'type-display-2xl',
  'type-display-xl',
  'type-display-lg',
  'type-display-sm',
  'type-heading-xl',
  'type-heading-lg',
  'type-heading-md',
  'type-heading-sm',
  'type-body-lead',
  'type-body-lead-medium',
  'type-body-lg',
  'type-body-md',
  'type-body-sm',
  'type-ui-lg',
  'type-ui-md',
  'type-ui-sm',
  'type-ui-xs',
  'type-ui-caps',
] as const

const spacingSteps = [1, 2, 3, 4, 6, 8, 10, 12, 15, 20, 35]

function Section({ id, title, note, children }: { id: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section id={id} data-el={`ui-kit__${id}`} className="flex flex-col gap-6 border-t border-border-subtle py-10">
      <div className="flex flex-col gap-1">
        <h2 className="type-heading-md text-typography-primary">{title}</h2>
        {note && <p className="type-body-md max-w-3xl text-typography-secondary">{note}</p>}
      </div>
      {children}
    </section>
  )
}

function ColorSwatch({ token }: { token: string }) {
  const { theme } = useTheme()
  const swatchRef = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState('')

  // The resolved value changes with the theme, so read it again on every switch.
  useEffect(() => {
    if (swatchRef.current) setValue(getComputedStyle(swatchRef.current).backgroundColor)
  }, [theme])

  return (
    <li className="flex items-center gap-3">
      <div className="size-12 shrink-0 rounded-pill bg-surface-page ring-1 ring-inset ring-border-medium">
        <div ref={swatchRef} className="size-full rounded-pill" style={{ backgroundColor: `var(--${token})` }} />
      </div>
      <div className="min-w-0">
        <p className="type-ui-sm truncate text-typography-primary">{token}</p>
        <p className="type-body-sm truncate text-typography-secondary">{value}</p>
      </div>
    </li>
  )
}

function TextStyleRow({ name }: { name: string }) {
  const { theme } = useTheme()
  const sampleRef = useRef<HTMLParagraphElement>(null)
  const [metrics, setMetrics] = useState('')

  useEffect(() => {
    if (!sampleRef.current) return
    const style = getComputedStyle(sampleRef.current)
    setMetrics(`${style.fontSize} / ${style.lineHeight}, ${style.letterSpacing === 'normal' ? '0' : style.letterSpacing}`)
  }, [theme])

  return (
    <li className="flex flex-col gap-1 border-b border-border-subtle pb-4 tablet:flex-row tablet:items-baseline tablet:gap-6">
      <div className="shrink-0 tablet:w-56">
        <p className="type-ui-sm text-typography-primary">{name}</p>
        <p className="type-body-sm text-typography-secondary">{metrics}</p>
      </div>
      <p ref={sampleRef} className={`${name} min-w-0 text-typography-primary`}>
        Banking for today
      </p>
    </li>
  )
}

const preventNavigation = (event: { preventDefault: () => void }) => event.preventDefault()

export default function UiKitPage() {
  return (
    <main className="py-10">
      <Container>
        <header className="flex items-start justify-between gap-4 pb-10">
          <div className="flex flex-col gap-2">
            <h1 className="type-heading-lg text-typography-primary">UI Kit</h1>
            <p className="type-body-md max-w-3xl text-typography-secondary">
              Everything the design system contains: tokens from Figma and the shared components. Switch the theme to check
              both modes. Rules and the component list: docs/ui-kit.md.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <Section
          id="colors"
          title="Colors"
          note="Semantic colors from Figma (Semantic -- Theme). Use these in components; the raw palette is not available as classes."
        >
          <div className="flex flex-col gap-8">
            {colorGroups.map(({ group, tokens }) => (
              <div key={group} className="flex flex-col gap-3">
                <h3 className="type-ui-md text-typography-primary">{group}</h3>
                <ul className="grid grid-cols-1 gap-x-6 gap-y-3 tablet:grid-cols-2 desktop:grid-cols-3">
                  {tokens.map((token) => (
                    <ColorSwatch key={token} token={token} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="typography"
          title="Typography"
          note="Text styles from Figma. Apply with one class, for example type-ui-sm. Display and heading use Manrope, body and ui use Inter."
        >
          <ul className="flex flex-col gap-4">
            {textStyles.map((name) => (
              <TextStyleRow key={name} name={name} />
            ))}
          </ul>
        </Section>

        <Section
          id="buttons"
          title="Buttons"
          note="ButtonLink: three variants (primary, secondary, inverse for a brand-colored banner) and two sizes (md 44 px in the header, lg 56 px in sections). Hover, active and focus states use the Figma tokens; try them with the mouse and the keyboard."
        >
          <div className="flex flex-col gap-6">
            {(['md', 'lg'] as const).map((size) => (
              <div key={size} className="flex flex-col gap-3">
                <h3 className="type-ui-md text-typography-primary">size {size}</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <ButtonLink href="#" size={size} icon="export" onClick={preventNavigation}>
                    Primary with icon
                  </ButtonLink>
                  <ButtonLink href="#" size={size} onClick={preventNavigation}>
                    Primary
                  </ButtonLink>
                  <ButtonLink href="#" size={size} variant="secondary" onClick={preventNavigation}>
                    Secondary
                  </ButtonLink>
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-3">
              <h3 className="type-ui-md text-typography-primary">variant inverse (on a brand-colored banner)</h3>
              <div className="flex flex-wrap items-center gap-4 rounded-32 bg-surface-brand-default p-6">
                <ButtonLink href="#" size="lg" variant="inverse" icon="export" onClick={preventNavigation}>
                  Inverse with icon
                </ButtonLink>
                <ButtonLink href="#" size="md" variant="inverse" onClick={preventNavigation}>
                  Inverse
                </ButtonLink>
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="icon-buttons"
          title="Icon buttons and icons"
          note="IconButton (a button) and IconLink (a link) are round and hold one 24 px icon: md is 44 px, lg is 48 px. Always give them an aria-label. Icon draws any single-color Figma SVG in the current text color, so it follows the theme."
        >
          <div className="flex flex-wrap items-center gap-6">
            <ThemeToggle />
            <IconButton aria-label="Sun icon button">
              <Icon src={sunIcon} width={24} height={24} />
            </IconButton>
            <IconButton aria-label="Moon icon button">
              <Icon src={moonIcon} width={20.8634} height={21.5021} />
            </IconButton>
            <span className="text-icon-brand">
              <Icon src={sunIcon} width={24} height={24} />
            </span>
            <span className="text-icon-secondary">
              <Icon src={moonIcon} width={20.8634} height={21.5021} />
            </span>
            <IconButton size="lg" aria-label="Sun icon button, large">
              <Icon src={sunIcon} width={24} height={24} />
            </IconButton>
            <IconLink href="#" size="lg" aria-label="Icon link, large" onClick={preventNavigation}>
              <span className="grid size-6 place-items-center">
                <Icon src={exportIcon} width={21.5} height={21.5} />
              </span>
            </IconLink>
          </div>
        </Section>

        <Section id="badges" title="Badges" note="Badge: a small pill label with an optional icon, for example &quot;Coming soon&quot;.">
          <div className="flex flex-wrap items-center gap-4">
            <Badge>New</Badge>
            <Badge icon="clock">Coming soon</Badge>
          </div>
        </Section>

        <Section
          id="header"
          title="Header"
          note="Header: one component for every page. The page passes which menu item is current (`currentId`, a grey fill like a hovered item) and, if needed, other items or buttons. In a page it is pinned to the top and hides while scrolling down; here `isPinned={false}` keeps it in the flow."
        >
          <div className="flex flex-col gap-6 overflow-hidden rounded-32 ring-1 ring-border-subtle">
            <Header isPinned={false} currentId="products" />
            <Header isPinned={false} currentId="pricing" />
          </div>
        </Section>

        <Section
          id="footer"
          title="Footer"
          note="Footer: one component for every page. The upper part has the logo, the description and five columns of links; the lower bar has the company, legal links and the copyright. Pages can pass their own columns, legal links and year."
        >
          <div className="overflow-hidden rounded-32 ring-1 ring-border-subtle">
            <Footer />
          </div>
        </Section>

        <Section
          id="backgrounds"
          title="Interactive background"
          note="InteractiveDots: a dot grid that the pointer pushes away, so the background feels alive. Move the pointer over the panel. Drop it into any positioned, overflow-hidden parent; it is transparent, so the page color and the theme show through."
        >
          <div className="flex flex-col gap-4">
            <div
              data-el="ui-kit__dots-demo"
              className="relative h-72 overflow-hidden rounded-32 bg-surface-page ring-1 ring-inset ring-border-medium"
            >
              <InteractiveDots />
            </div>
            <dl className="type-body-sm grid grid-cols-1 gap-x-8 gap-y-1 text-typography-secondary tablet:grid-cols-2">
              <div>
                <dt className="type-ui-sm text-typography-primary">Usage</dt>
                <dd>{'<div className="relative overflow-hidden"><InteractiveDots /></div>'}</dd>
              </div>
              <div>
                <dt className="type-ui-sm text-typography-primary">Defaults (approved prototype)</dt>
                <dd>spacing 40, dotSize 1, radius 150, force 1, ease 0.1</dd>
              </div>
              <div>
                <dt className="type-ui-sm text-typography-primary">Color</dt>
                <dd>surface-dots (Figma theme/surface/dots): neutral/400 in Light, neutral/600 in Dark</dd>
              </div>
              <div>
                <dt className="type-ui-sm text-typography-primary">Behavior</dt>
                <dd>pointer on the whole window, touch ignored, stops when idle or off screen, still with reduced motion</dd>
              </div>
            </dl>
          </div>
        </Section>

        <Section
          id="glow"
          title="Glow and glass"
          note="GlowBackdrop: a soft blurred ellipse of colored light behind a card. It is used by the dark scenes of the Industries block: the block gets data-theme=&quot;dark&quot; (every token flips inside it, in a light site too), the open card is glass (surface-white-16 + backdrop blur) and the button is the inverse (white) one. The hues are the tokens surface-glow-*."
        >
          <ul className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
            {glowHues.map((hue) => (
              <li
                key={hue}
                data-el={`ui-kit__glow-demo-${hue}`}
                data-theme="dark"
                className="relative flex h-56 items-center justify-center overflow-hidden rounded-32 bg-surface-page ring-1 ring-inset ring-border-medium"
              >
                <GlowBackdrop hue={hue} visible className="absolute top-1/2 left-1/2 h-40 w-[130%] -translate-x-1/2 -translate-y-1/2" />
                <div className="relative flex flex-col items-center gap-4 rounded-32 bg-surface-white-16 px-8 py-6 text-center ring-1 ring-inset ring-border-subtle backdrop-blur-xl">
                  <p className="type-heading-md text-typography-primary">{hue}</p>
                  <ButtonLink href="#glow" variant="inverse" icon="export">
                    Book a demo
                  </ButtonLink>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="layout"
          title="Layout, spacing and radius"
          note="Spacing is the 4 px Tailwind scale (every value in the design is a multiple of 4). The page column is up to 1440 px wide (Container) with side padding 16 / 32 / 80 px. Breakpoints: tablet from 768 px, desktop from 1280 px."
        >
          <div className="flex flex-col gap-6">
            <ul className="flex flex-col gap-2">
              {spacingSteps.map((step) => (
                <li key={step} className="flex items-center gap-4">
                  <span className="type-ui-sm w-24 shrink-0 text-typography-primary">
                    {step} → {step * 4}px
                  </span>
                  <span className="h-3 rounded-pill bg-surface-brand-default" style={{ width: step * 4 }} />
                </li>
              ))}
            </ul>
            <ul className="flex flex-col gap-3">
              {[
                { name: 'rounded-pill', note: 'buttons, menu items', className: 'rounded-pill' },
                { name: 'rounded-32', note: 'hero__dash; hero__media below desktop', className: 'rounded-32' },
                { name: 'rounded-40', note: 'features cards', className: 'rounded-40' },
                { name: 'rounded-48', note: 'hero__media on desktop', className: 'rounded-48' },
              ].map(({ name, note, className }) => (
                <li key={name} className="flex items-center gap-4">
                  <span className="type-ui-sm w-24 shrink-0 text-typography-primary">{name}</span>
                  <span
                    className={`h-16 w-40 shrink-0 bg-surface-brand-light ring-1 ring-inset ring-border-brand ${className}`}
                  />
                  <span className="type-body-sm text-typography-secondary">{note}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3">
              <h3 className="type-ui-md text-typography-primary">CornerDots</h3>
              <p className="type-body-sm text-typography-secondary">
                Two dots on the corners of a block, exactly where the column lines meet a horizontal line. The parent must be positioned.
              </p>
              {/* The horizontal line is outside the column (like the section border under the column in a block). */}
              <div className="border-b border-border-subtle">
                <div
                  data-el="ui-kit__corner-dots-demo"
                  className="relative h-24 shadow-[inset_1px_0_0_var(--color-border-subtle),inset_-1px_0_0_var(--color-border-subtle)]"
                >
                  <CornerDots edge="bottom" block="ui-kit" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="type-ui-md text-typography-primary">ColumnFade</h3>
              <p className="type-body-sm text-typography-secondary">
                The column lines continued beyond the block and fading out, starting at the corner dots. Put it next to CornerDots in the
                positioned column box; edge is the side where the lines leave the block.
              </p>
              <div className="mb-24 border-b border-border-subtle">
                <div
                  data-el="ui-kit__column-fade-demo"
                  className="relative h-24 shadow-[inset_1px_0_0_var(--color-border-subtle),inset_-1px_0_0_var(--color-border-subtle)]"
                >
                  <CornerDots edge="bottom" block="ui-kit-fade" />
                  <ColumnFade edge="bottom" block="ui-kit" length={96} />
                </div>
              </div>
            </div>
          </div>
        </Section>
      </Container>
    </main>
  )
}
