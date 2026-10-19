export type NavItem = {
  /** Same slug as the Figma layer `header__menu-item-{id}`. */
  id: string
  label: string
  href: string
  /** Highlighted as the current section (selected pill in the design). */
  isCurrent?: boolean
}

// Link targets are placeholders: the design has no URLs. Replace them when routes are known.
export const navItems: readonly NavItem[] = [
  { id: 'products', label: 'Products', href: '#products', isCurrent: true },
  { id: 'solutions', label: 'Solutions', href: '#solutions' },
  { id: 'developers', label: 'Developers', href: '#developers' },
  { id: 'pricing', label: 'Pricing', href: '#pricing' },
  { id: 'company', label: 'Company', href: '#company' },
]

export const demoCta = { label: 'Book a demo', href: '#book-a-demo' }
export const exploreCta = { label: 'Explore products', href: '#products' }
