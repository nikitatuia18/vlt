import logo from '../../../assets/brand/logo-velant-pay-footer.svg'
import { Reveal } from '../../../motion/reveal'
import { Container } from '../Container'
import { CornerDots } from '../CornerDots'
import { Icon } from '../Icon'
import {
  brandDescription,
  companyLicense,
  companyName,
  footerColumns,
  legalLinks as siteLegalLinks,
  type FooterColumn,
  type LegalLink,
} from './navigation'

export type FooterProps = {
  /** Columns of links. Default: the footer of the site (`navigation.ts`). */
  columns?: readonly FooterColumn[]
  /** Legal links of the lower bar (Terms, Privacy, AML Policy by default). */
  legalLinks?: readonly LegalLink[]
  /** Year in the copyright line. Default: the current year. */
  year?: number
}

const linkClasses =
  'type-body-md rounded-pill text-typography-secondary transition-colors hover:text-typography-primary ' +
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-typography-brand'

// The column lines are drawn inside (an inset shadow, like a Figma stroke), so they do not narrow the content.
const columnLines = 'shadow-[inset_1px_0_0_var(--color-border-subtle),inset_-1px_0_0_var(--color-border-subtle)]'

/**
 * Site footer, one component for all pages. Figma blocks `footer` (logo, description, five columns of links) and
 * `footer-bottom` (the lower bar with the company, legal links and copyright). Pages pass only what differs.
 *
 * From the design: the upper part on the `surface/subtle` color with a line under it, column 1440 px with 40 px inside,
 * vertical padding 120 px, logo 271 px wide, columns of links 40 px apart, titles 24 px, links 16 px with 8 px between;
 * the lower bar on the page color, 16 px above and below the text; the column lines run through both parts.
 * Derived (not in the desktop frame): the brand and the columns stand side by side from 1600 px, between 1280 and 1599 px
 * the brand is above the columns, below 1280 px the columns are a grid of 3 or 2; the lower bar is a row from 1440 px and a column below.
 * Font note: the titles are Urbanist Regular in the design, which is not in the font set: `heading-md` is the closest style.
 */
// Read once when the page loads (a render must not depend on the clock).
const currentYear = new Date().getFullYear()

export function Footer({ columns = footerColumns, legalLinks = siteLegalLinks, year = currentYear }: FooterProps) {
  return (
    <footer data-el="site-footer">
      <div data-el="footer" className="border-b border-border-subtle bg-surface-subtle">
        <Container>
          <div
            data-el="footer__container"
            className={`relative flex flex-col gap-10 px-4 py-12 tablet:px-8 tablet:py-16 desktop:gap-12 desktop:px-10 desktop:py-20 min-[100rem]:flex-row min-[100rem]:justify-between min-[100rem]:py-30 ${columnLines}`}
          >
            <Reveal data-el="footer__brand" className="flex flex-col items-start gap-4">
              <a href="/" aria-label="Velant Pay, home" className="flex text-typography-primary">
                <span data-el="img-logo-velant-pay" className="flex">
                  <Icon src={logo} width={271} height={65.6985} />
                </span>
              </a>
              <p data-el="footer__brand-desc" className="type-body-md text-typography-secondary">
                {brandDescription}
              </p>
            </Reveal>

            <nav
              aria-label="Footer"
              data-el="footer__links"
              className="grid grid-cols-2 gap-x-6 gap-y-8 tablet:grid-cols-3 desktop:flex desktop:items-start desktop:gap-10"
            >
              {columns.map((column, index) => (
                <Reveal key={column.id} delay={0.1 + index * 0.08} data-el={`footer__col-${column.id}`} className="flex flex-col gap-2">
                  <h3 data-el={`footer__col-${column.id}-title`} className="type-heading-md text-typography-primary">
                    {column.title}
                  </h3>
                  <ul data-el={`footer__col-${column.id}-list`} className="flex flex-col gap-2">
                    {column.links.map((link) => (
                      <li key={link.id}>
                        <a href={link.href} data-el={`footer__link-${link.id}`} className={`${linkClasses} desktop:whitespace-nowrap`}>
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </nav>

            {/* Dots on the corners where the line under the footer meets the column. */}
            <CornerDots edge="bottom" block="footer" />
          </div>
        </Container>
      </div>

      <div data-el="footer-bottom" className="bg-surface-page">
        <Container>
          <Reveal
            variant="fade"
            atPageEnd
            data-el="footer-bottom__container"
            className={`flex flex-col gap-2 px-4 py-4 tablet:px-8 min-[90rem]:flex-row min-[90rem]:items-start min-[90rem]:justify-between min-[90rem]:px-10 ${columnLines}`}
          >
            <div data-el="footer-bottom__company" className="type-body-md flex flex-col gap-1 text-typography-secondary tablet:flex-row tablet:items-center tablet:gap-6 min-[90rem]:w-[673.5px]">
              <span data-el="footer-bottom__company-name">{companyName}</span>
              <span data-el="footer-bottom__company-license">{companyLicense}</span>
            </div>
            <ul data-el="footer-bottom__legal" className="flex flex-wrap items-center gap-x-6 gap-y-1">
              {legalLinks.map((link) => (
                <li key={link.id}>
                  <a href={link.href} data-el={`footer-bottom__link-${link.id}`} className={linkClasses}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <p data-el="footer-bottom__copyright" className="type-body-md text-typography-secondary">
              © {year} {companyName}
            </p>
          </Reveal>
        </Container>
      </div>
    </footer>
  )
}
