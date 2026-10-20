import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'
import { Reveal } from '../../../motion/reveal'
import { appear, duration, easeOut } from '../../../motion/tokens'
import { useRevealOn } from '../../../motion/useReveal'
import logo from '../../../assets/brand/logo-velant-pay.svg'
import { ButtonLink } from '../ButtonLink'
import { Container } from '../Container'
import { Icon } from '../Icon'
import { IconButton } from '../IconButton'
import { ThemeToggle } from '../ThemeToggle'
import { MenuToggleIcon } from './MenuToggleIcon'
import { demoCta, exploreCta, navItems as siteNavItems, type HeaderCta, type NavItem } from './navigation'

// Must match --breakpoint-desktop in styles/tokens.css: from here the full menu is shown instead of the burger.
const DESKTOP_QUERY = '(min-width: 80rem)'

/** Scrolling less than this many px in the other direction does not flip the header (a trembling finger or wheel). */
const SCROLL_THRESHOLD = 6

const linkBaseClasses = 'rounded-pill px-4 py-3 transition-colors'
// The selected item is filled with the same color as a hovered one (grey in Light, lighter than the bar in Dark).
const linkCurrentClasses = 'bg-surface-hover text-typography-primary'
const linkDefaultClasses = 'text-typography-secondary hover:bg-surface-hover'

export type HeaderProps = {
  /** Menu items. Default: the menu of the site (`navigation.ts`). */
  navItems?: readonly NavItem[]
  /** `id` of the menu item of the current page or section: it is filled and gets `aria-current`. */
  currentId?: string
  /** Main button (a filled pill). Default: "Book a demo". */
  primaryCta?: HeaderCta
  /** Second button (outlined pill), desktop and the dropdown. Default: "Explore products". */
  secondaryCta?: HeaderCta
  /** Pinned to the top and hidden while scrolling down (default); `false` puts it in the flow like a normal block. */
  isPinned?: boolean
}

/**
 * Site header, one component for all pages (Figma block `header`). Pages pass only what differs: which item is current,
 * and, if needed, other menu items or buttons.
 * - desktop (>= 80rem): logo, menu, theme toggle, both CTAs (as in the design)
 * - tablet (>= 48rem): logo, primary CTA, burger; the rest is in the dropdown (derived layout)
 * - mobile: logo and burger; everything else is in the dropdown (derived layout)
 *
 * The header is pinned to the top. It slides out of the screen when you scroll down and comes back as soon as you scroll up;
 * at the very top of the page it is always shown. It also stays while the menu is open or while the keyboard focus is inside it.
 */
export function Header({
  navItems = siteNavItems,
  currentId,
  primaryCta = demoCta,
  secondaryCta = exploreCta,
  isPinned = true,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const panelId = useId()
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const [isScrolledAway, setIsScrolledAway] = useState(false)
  const [hasFocus, setHasFocus] = useState(false)
  // On loading the header comes down from above (slowly, once); afterwards it only hides and shows quickly.
  const revealOn = useRevealOn()
  const [hasEntered, setHasEntered] = useState(false)

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => {
    const delta = y - (scrollY.getPrevious() ?? y)
    const height = headerRef.current?.offsetHeight ?? 0
    if (y <= height) setIsScrolledAway(false) // at the top the header is always there
    else if (delta > SCROLL_THRESHOLD) setIsScrolledAway(true)
    else if (delta < -SCROLL_THRESHOLD) setIsScrolledAway(false)
  })
  const isHidden = isPinned && isScrolledAway && !isMenuOpen && !hasFocus

  // Leaving the burger layout closes the dropdown, so it does not reopen when the window shrinks again.
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY)
    const closeOnDesktop = () => {
      if (desktop.matches) setIsMenuOpen(false)
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsMenuOpen(false)
      menuButtonRef.current?.focus()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isMenuOpen])

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <motion.header
      ref={headerRef}
      data-el="header"
      data-hidden={isHidden}
      className={`border-b border-border-subtle bg-surface-subtle ${isPinned ? 'sticky top-0 z-50' : 'relative'}`}
      initial={revealOn ? { y: '-100%', opacity: 0 } : false}
      animate={{ y: isHidden ? '-100%' : '0%', opacity: 1 }}
      transition={{ duration: hasEntered ? duration.reveal / 2 : appear.line.duration, ease: easeOut }}
      onAnimationComplete={() => setHasEntered(true)}
      // Only focus from the keyboard keeps the header: a mouse click leaves focus on the link too, but must not pin the header.
      onFocusCapture={(event) => setHasFocus((event.target as HTMLElement).matches(':focus-visible'))}
      onBlurCapture={() => setHasFocus(false)}
    >
      <Container data-el="header__container" className="flex items-center justify-between py-4">
        <div data-el="header__left" className="flex items-center gap-15">
          <Reveal as="a" variant="drop" atLoad delay={0.3} href="/" aria-label="Velant Pay, home" data-el="header__logo" className="block shrink-0 text-typography-primary">
            <Icon src={logo} width={97.4092} height={32} />
          </Reveal>

          <nav aria-label="Main" data-el="header__menu" className="hidden items-center gap-2 desktop:flex">
            {navItems.map((item, index) => (
              <Reveal
                as="a"
                variant="drop"
                atLoad
                delay={0.4 + index * 0.06}
                key={item.id}
                href={item.href}
                aria-current={item.id === currentId ? 'true' : undefined}
                data-el={`header__menu-item-${item.id}`}
                className={`${linkBaseClasses} type-ui-sm ${item.id === currentId ? linkCurrentClasses : linkDefaultClasses}`}
              >
                {item.label}
              </Reveal>
            ))}
          </nav>
        </div>

        <Reveal variant="drop" atLoad delay={0.7} data-el="header__actions" className="flex items-center gap-2 desktop:gap-6">
          {/* max-desktop:hidden, not `hidden desktop:inline-flex`: the component's own display class would win over a bare `hidden`. */}
          <ThemeToggle data-el="header__theme-toggle" className="max-desktop:hidden" />

          <div data-el="header__buttons" className="hidden items-center gap-2 tablet:flex">
            <ButtonLink href={primaryCta.href} icon="export" data-el="header__cta-primary">
              {primaryCta.label}
            </ButtonLink>
            <ButtonLink
              href={secondaryCta.href}
              variant="secondary"
              data-el="header__cta-secondary"
              className="max-desktop:hidden"
            >
              {secondaryCta.label}
            </ButtonLink>
          </div>

          <IconButton
            ref={menuButtonRef}
            className="desktop:hidden"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls={panelId}
            onClick={() => setIsMenuOpen((open) => !open)}
            data-el="header__menu-toggle"
          >
            <MenuToggleIcon isOpen={isMenuOpen} />
          </IconButton>
        </Reveal>
      </Container>

      {/* Dropdown for tablet and mobile; hidden on desktop where the full menu is in the bar. */}
      <div
        id={panelId}
        hidden={!isMenuOpen}
        data-el="header__menu-panel"
        className="absolute inset-x-0 top-full z-40 border-b border-border-subtle bg-surface-subtle desktop:hidden"
      >
        <Container className="flex flex-col gap-4 py-4">
          <nav aria-label="Main">
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={item.id === currentId ? 'true' : undefined}
                    className={`block ${linkBaseClasses} type-ui-md ${item.id === currentId ? linkCurrentClasses : linkDefaultClasses}`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center">
            {/* On tablet the primary CTA is already in the bar. */}
            <ButtonLink href={primaryCta.href} icon="export" onClick={closeMenu} className="tablet:hidden">
              {primaryCta.label}
            </ButtonLink>
            <ButtonLink href={secondaryCta.href} variant="secondary" onClick={closeMenu}>
              {secondaryCta.label}
            </ButtonLink>
            <ThemeToggle className="self-start tablet:ml-auto" />
          </div>
        </Container>
      </div>
    </motion.header>
  )
}
