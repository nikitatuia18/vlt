import { motion } from 'motion/react'
import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react'
import { RevealLines } from '../../../motion/reveal'
import { duration, easeOut } from '../../../motion/tokens'
import { useRevealOn } from '../../../motion/useReveal'
import { Badge } from '../Badge'
import { Icon } from '../Icon'
import { productMenuItems, type ProductMenuItem } from './productMenu'

/** The pointer may cross the gap between the item and the panel, or leave for a moment, without the panel closing. */
const CLOSE_DELAY_MS = 150

/** Scrolling down by more than this between two scroll events closes the panel (same as the header's own threshold). */
const SCROLL_DOWN_CLOSE_PX = 6

/** Three rows; the products go down the left column first, then down the right one. */
const ROWS = 3

const itemBaseClasses = 'flex gap-4 rounded-24 p-4 text-left'
const itemLinkClasses = 'transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-typography-brand'

/** One product of the list: icon, name, description. The text rises word by word every time the panel opens. */
function ProductItem({ item, index, isOpen }: { item: ProductMenuItem; index: number; isOpen: boolean }) {
  // The words follow the panel as it fades in; neighbours start one after another, row by row (the panel is filled column by column).
  const delay = 0.12 + (index % ROWS) * 0.1 + Math.floor(index / ROWS) * 0.04
  const content = (
    <>
      <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-16 bg-surface-page text-icon-primary ring-1 ring-inset ring-border-subtle">
        <Icon src={item.icon} width={24} height={24} />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="flex items-center gap-3">
          <RevealLines as="span" open={isOpen} delay={delay} lines={[item.label]} className="type-ui-md text-typography-primary" />
          {!item.href && (
            <Badge size="sm" labelReveal={{ open: isOpen, delay: delay + 0.1 }}>
              Soon
            </Badge>
          )}
        </span>
        <RevealLines as="p" open={isOpen} delay={delay + 0.05} lines={[item.description]} className="type-body-sm text-typography-secondary" />
      </span>
    </>
  )

  // A product that is not there yet is not a link: it is shown, but does not react.
  if (!item.href) {
    return (
      <li>
        <div data-el={`header__products-item-${item.id}`} aria-disabled="true" className={itemBaseClasses}>
          {content}
        </div>
      </li>
    )
  }
  return (
    <li>
      <a href={item.href} data-el={`header__products-item-${item.id}`} className={`${itemBaseClasses} ${itemLinkClasses}`}>
        {content}
      </a>
    </li>
  )
}

/**
 * The dropdown of the menu item "Products" (desktop): a panel with the products of the site, two columns. It opens when the pointer is on
 * the item or on the panel, or when the item gets the keyboard focus, and closes with Escape, a click, a scroll down, or when the pointer
 * and the focus have left. The item stays a link to the block "Products" of the home page.
 * `children` draws the item; it gets the state of the panel for `aria-expanded` and the fill.
 */
export function ProductsMenu({ children }: { children: (isOpen: boolean, panelId: string) => ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const panelId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const revealOn = useRevealOn()
  // Escape puts the focus back on the item; that focus must not open the panel again.
  const isReturningFocus = useRef(false)

  const open = () => {
    clearTimeout(closeTimer.current)
    setIsOpen(true)
  }
  const closeSoon = () => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setIsOpen(false), CLOSE_DELAY_MS)
  }
  useEffect(() => () => clearTimeout(closeTimer.current), [])

  // The header slides away when the page goes down, and the panel must go with it. Only that direction closes it: after a scroll up the smooth scroll
  // glides on for about a second, and the pointer that reaches the item meanwhile must still open the panel.
  useEffect(() => {
    if (!isOpen) return
    let lastY = window.scrollY
    const closeOnScrollDown = () => {
      const y = window.scrollY
      if (y - lastY > SCROLL_DOWN_CLOSE_PX) setIsOpen(false)
      lastY = y
    }
    window.addEventListener('scroll', closeOnScrollDown, { passive: true })
    return () => window.removeEventListener('scroll', closeOnScrollDown)
  }, [isOpen])

  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    // Only the keyboard opens it by focus: a mouse click leaves focus on the item too, but the click has its own job.
    if (isReturningFocus.current) return
    if ((event.target as HTMLElement).matches(':focus-visible')) open()
  }
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsOpen(false)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || !isOpen) return
    setIsOpen(false)
    isReturningFocus.current = true
    wrapperRef.current?.querySelector('a')?.focus()
    isReturningFocus.current = false
  }

  const fade = revealOn ? duration.reveal / 2 : 0
  return (
    <div
      ref={wrapperRef}
      role="presentation"
      data-el="header__products"
      data-open={isOpen}
      className="relative flex"
      onMouseEnter={open}
      onMouseLeave={closeSoon}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onClick={() => setIsOpen(false)}
    >
      {children(isOpen, panelId)}

      {/* The top padding is part of the hover area, so that the pointer can cross the gap under the bar. */}
      <div className={`absolute top-full left-0 z-50 pt-6 ${isOpen ? '' : 'pointer-events-none'}`}>
        <motion.div
          id={panelId}
          data-el="header__products-menu"
          initial={false}
          animate={
            isOpen
              ? { opacity: 1, y: 0, visibility: 'visible', transition: { duration: fade, ease: easeOut } }
              : { opacity: 0, y: -8, transitionEnd: { visibility: 'hidden' }, transition: { duration: fade, ease: easeOut } }
          }
          style={{ visibility: 'hidden', opacity: 0 }}
          className="w-160 rounded-32 bg-surface-subtle p-3 shadow-menu ring-1 ring-border-subtle ring-inset"
        >
          <ul className="grid grid-flow-col grid-cols-2 grid-rows-3 gap-x-2 gap-y-1">
            {productMenuItems.map((item, index) => (
              <ProductItem key={item.id} item={item} index={index} isOpen={isOpen} />
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
