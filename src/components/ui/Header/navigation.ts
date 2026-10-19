export type NavItem = {
  /** Same slug as the Figma layer `header__menu-item-{id}`. */
  id: string
  label: string
  href: string
}

/** A button of the header. */
export type HeaderCta = { label: string; href: string }

// Link targets are placeholders: the design has no URLs. Replace them when routes are known
// (later every item will lead to its block or page; the current one is chosen with `currentId` of the Header).
export const navItems: readonly NavItem[] = [
  { id: 'products', label: 'Products', href: '#products' },
  { id: 'solutions', label: 'Solutions', href: '#solutions' },
  { id: 'developers', label: 'Developers', href: '#developers' },
  { id: 'pricing', label: 'Pricing', href: '#pricing' },
  { id: 'company', label: 'Company', href: '#company' },
]

export const demoCta: HeaderCta = { label: 'Book a demo', href: '#book-a-demo' }
export const exploreCta: HeaderCta = { label: 'Explore products', href: '#products' }
