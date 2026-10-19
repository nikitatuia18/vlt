export type FooterLink = {
  /** Same slug as the Figma layer `footer__link-{id}`. */
  id: string
  label: string
  href: string
}

export type FooterColumn = {
  /** Same slug as the Figma layer `footer__col-{id}`. */
  id: string
  title: string
  links: readonly FooterLink[]
}

export type LegalLink = {
  /** Same slug as the Figma layer `footer-bottom__link-{id}`. */
  id: string
  label: string
  href: string
}

// Link targets are placeholders: the design has no URLs. Replace them when routes are known.
export const footerColumns: readonly FooterColumn[] = [
  {
    id: 'platform',
    title: 'Platform',
    links: [
      { id: 'payment-orchestration', label: 'Payment orchestration', href: '#payment-orchestration' },
      { id: 'smart-routing', label: 'Smart routing', href: '#smart-routing' },
      { id: 'payment-methods', label: 'Payment methods', href: '#payment-methods' },
      { id: 'crypto-processing', label: 'Crypto processing', href: '#crypto-processing' },
      { id: 'otc-trading', label: 'OTC trading', href: '#otc-trading' },
      { id: 'custom-integrations', label: 'Custom integrations', href: '#custom-integrations' },
    ],
  },
  {
    id: 'solutions',
    title: 'Solutions',
    links: [
      { id: 'merchants', label: 'Merchants', href: '#merchants' },
      { id: 'platforms', label: 'Platforms', href: '#platforms' },
      { id: 'complex-operations', label: 'Complex operations', href: '#complex-operations' },
      { id: 'psps-acquirers', label: 'PSPs & Acquirers', href: '#psps-acquirers' },
    ],
  },
  {
    id: 'company',
    title: 'Company',
    links: [
      { id: 'about', label: 'About', href: '#about' },
      { id: 'coverage', label: 'Coverage', href: '#coverage' },
      { id: 'compliance', label: 'Compliance', href: '#compliance' },
      { id: 'contact', label: 'Contact', href: '#contact' },
    ],
  },
  {
    id: 'developers',
    title: 'Developers',
    links: [
      { id: 'documentation', label: 'Documentation', href: '#documentation' },
      { id: 'api-reference', label: 'API Reference', href: '#api-reference' },
      { id: 'integration-support', label: 'Integration support', href: '#integration-support' },
      { id: 'system-status', label: 'System status', href: '#system-status' },
    ],
  },
  {
    id: 'partners',
    title: 'Partners',
    links: [
      { id: 'become-a-partner', label: 'Become a partner', href: '#become-a-partner' },
      { id: 'payment-provider', label: 'Payment provider', href: '#payment-provider' },
      { id: 'integration-enquiries', label: 'Integration enquiries', href: '#integration-enquiries' },
    ],
  },
]

export const legalLinks: readonly LegalLink[] = [
  { id: 'terms', label: 'Terms', href: '#terms' },
  { id: 'privacy', label: 'Privacy', href: '#privacy' },
  { id: 'aml-policy', label: 'AML Policy', href: '#aml-policy' },
]

export const brandDescription = 'Global payment orchestration for fiat and crypto.'
export const companyName = 'Velant Payments Inc.'
export const companyLicense = 'Canadian Money Services Business'
