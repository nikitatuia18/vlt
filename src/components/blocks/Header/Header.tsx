import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'
import { duration, easeOut } from '../../../motion/tokens'
import logo from '../../../assets/brand/logo-velant-pay.svg'
import { ButtonLink } from '../../ui/ButtonLink'
import { Container } from '../../ui/Container'
import { Icon } from '../../ui/Icon'
import { IconButton } from '../../ui/IconButton'
import { ThemeToggle } from '../../ui/ThemeToggle'
import { MenuToggleIcon } from './MenuToggleIcon'
import { demoCta, exploreCta, navItems } from './navigation'

// Must match --breakpoint-desktop in styles/tokens.css: from here the full menu is shown instead of the burger.
const DESKTOP_QUERY = '(min-width: 80rem)'

/** Scrolling less than this many px in the other direction does not flip the header (a trembling finger or wheel). */
const SCROLL_THRESHOLD = 6

const linkBaseClasses = 'rounded-pill px-4 py-3 transition-colors'
const linkCurrentClasses = 'bg-surface-subtle text-typography-primary ring-1 ring-inset ring-border-subtle'
const linkDefaultClasses = 'text-typography-secondary hover:bg-surface-hover'

/**
 * Site header. Figma block `header`.
 * - desktop (>= 80rem): logo, menu, theme toggle, both CTAs (as in the design)
 * - tablet (>= 48rem): logo, primary CTA, burger; the rest is in the dropdown (derived layout)
 * - mobile: logo and burger; everything else is in the dropdown (derived layout)
 *
 * The header is pinned to the top. It slides out of the screen when you scroll down and comes back as soon as you scroll up;
 * at the very top of the page it is always shown. It also stays while the menu is open or while the keyboard focus is inside it.
 */
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const panelId = useId()
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const [isScrolledAway, setIsScrolledAway] = useState(false)
  const [hasFocus, setHasFocus] = useState(false)

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => {
    const delta = y - (scrollY.getPrevious() ?? y)
    const height = headerRef.current?.offsetHeight ?? 0
    if (y <= height) setIsScrolledAway(false) // at the top the header is always there
    else if (delta > SCROLL_THRESHOLD) setIsScrolledAway(true)
    else if (delta < -SCROLL_THRESHOLD) setIsScrolledAway(false)
  })
  const isHidden = isScrolledAway && !isMenuOpen && !hasFocus

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
      className="sticky top-0 z-50 border-b border-border-subtle bg-surface-subtle"
      initial={false}
      animate={{ y: isHidden ? '-100%' : '0%' }}
      transition={{ duration: duration.reveal / 2, ease: easeOut }}
      // Only focus from the keyboard keeps the header: a mouse click leaves focus on the link too, but must not pin the header.
      onFocusCapture={(event) => setHasFocus((event.target as HTMLElement).matches(':focus-visible'))}
      onBlurCapture={() => setHasFocus(false)}
    >
      <Container data-el="header__container" className="flex items-center justify-between py-4">
        <div data-el="header__left" className="flex items-center gap-15">
          <a href="/" aria-label="Velant Pay, home" data-el="header__logo" className="block shrink-0 text-typography-primary">
            <Icon src={logo} width={97.4092} height={32} />
          </a>

          <nav aria-label="Main" data-el="header__menu" className="hidden items-center gap-2 desktop:flex">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                aria-current={item.isCurrent ? 'true' : undefined}
                data-el={`header__menu-item-${item.id}`}
                className={`${linkBaseClasses} type-ui-sm ${item.isCurrent ? linkCurrentClasses : linkDefaultClasses}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div data-el="header__actions" className="flex items-center gap-2 desktop:gap-6">
          {/* max-desktop:hidden, not `hidden desktop:inline-flex`: the component's own display class would win over a bare `hidden`. */}
          <ThemeToggle data-el="header__theme-toggle" className="max-desktop:hidden" />

          <div data-el="header__buttons" className="hidden items-center gap-2 tablet:flex">
            <ButtonLink href={demoCta.href} icon="export" data-el="header__cta-primary">
              {demoCta.label}
            </ButtonLink>
            <ButtonLink
              href={exploreCta.href}
              variant="secondary"
              data-el="header__cta-secondary"
              className="max-desktop:hidden"
            >
              {exploreCta.label}
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
        </div>
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
                    aria-current={item.isCurrent ? 'true' : undefined}
                    className={`block ${linkBaseClasses} type-ui-md ${item.isCurrent ? linkCurrentClasses : linkDefaultClasses}`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center">
            {/* On tablet the primary CTA is already in the bar. */}
            <ButtonLink href={demoCta.href} icon="export" onClick={closeMenu} className="tablet:hidden">
              {demoCta.label}
            </ButtonLink>
            <ButtonLink href={exploreCta.href} variant="secondary" onClick={closeMenu}>
              {exploreCta.label}
            </ButtonLink>
            <ThemeToggle className="self-start tablet:ml-auto" />
          </div>
        </Container>
      </div>
    </motion.header>
  )
}
