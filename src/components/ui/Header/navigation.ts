import { href } from '../../../lib/route'

export type NavItem = {
  /** Slug of the item and `id` of the block of the home page it leads to (the block carries `id="{id}"`). */
  id: string
  label: string
  href: string
}

/** A button of the header. */
export type HeaderCta = { label: string; href: string }

/**
 * The menu follows the home page as a landing: one short name per block, in the order of the blocks. On the home page an item glides to
 * its block (`useAnchorLinks`) and is marked while the block is on the screen (`useScrollSpy`); on the other pages it leads to the home
 * page and its block. The Figma menu (Products / Solutions / Developers / Pricing / Company) is replaced by this on purpose.
 */
export const navItems: readonly NavItem[] = [
  { id: 'products', label: 'Products', href: href('', 'products') }, // Features
  { id: 'industries', label: 'Industries', href: href('', 'industries') },
  { id: 'global', label: 'Global', href: href('', 'global') },
  { id: 'get-started', label: 'Get started', href: href('', 'get-started') }, // NextSteps
  { id: 'faq', label: 'FAQ', href: href('', 'faq') },
  { id: 'contact', label: 'Contact', href: href('', 'contact') }, // Cta
]

/** The ids of the blocks of the menu, for the scroll spy. */
export const navBlockIds: readonly string[] = navItems.map((item) => item.id)

export const demoCta: HeaderCta = { label: 'Book a demo', href: '#book-a-demo' }
export const exploreCta: HeaderCta = { label: 'Explore products', href: href('', 'products') }
