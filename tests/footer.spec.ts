import { expect, test, type Page } from '@playwright/test'
import { footerColumns } from '../src/components/ui/Footer/navigation'

const viewports = [
  { name: 'mobile-393', width: 393, height: 850 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 800 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1000 },
  { name: 'desktop-2560', width: 2560, height: 1200 },
]

const box = async (page: Page, selector: string) => (await page.locator(selector).boundingBox())!
const near = (actual: number, expected: number, tolerance: number, what: string) =>
  expect(Math.abs(actual - expected), `${what}: ${actual} vs ${expected}`).toBeLessThanOrEqual(tolerance)

const open = async (page: Page, width: number, height: number) => {
  await page.setViewportSize({ width, height })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await page.locator('[data-el="site-footer"]').evaluate((el) => el.scrollIntoView({ block: 'end' }))
  await page.waitForTimeout(500)
}

for (const viewport of viewports) {
  test(`footer screenshot ${viewport.name}`, async ({ page }) => {
    await open(page, viewport.width, viewport.height)
    await page.locator('[data-el="site-footer"]').screenshot({ path: `tests/artifacts/footer-${viewport.name}.png` })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBe(0)
  })
}

test('texts: brand, five columns with their links, the lower bar', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-el="footer__brand-desc"]')).toHaveText('Global payment orchestration for fiat and crypto.')
  expect(footerColumns.map((column) => column.title)).toEqual(['Platform', 'Solutions', 'Company', 'Developers', 'Partners'])
  for (const column of footerColumns) {
    await expect(page.locator(`[data-el="footer__col-${column.id}-title"]`)).toHaveText(column.title)
    for (const link of column.links) {
      await expect(page.locator(`[data-el="footer__link-${link.id}"]`)).toHaveText(link.label)
    }
  }
  expect(footerColumns.map((column) => column.links.length)).toEqual([6, 4, 4, 4, 3])
  await expect(page.locator('[data-el="footer-bottom__company-name"]')).toHaveText('Velant Payments Inc.')
  await expect(page.locator('[data-el="footer-bottom__company-license"]')).toHaveText('Canadian Money Services Business')
  await expect(page.locator('[data-el="footer-bottom__link-terms"]')).toHaveText('Terms')
  await expect(page.locator('[data-el="footer-bottom__link-privacy"]')).toHaveText('Privacy')
  await expect(page.locator('[data-el="footer-bottom__link-aml-policy"]')).toHaveText('AML Policy')
  await expect(page.locator('[data-el="footer-bottom__copyright"]')).toHaveText(/^© \d{4} Velant Payments Inc\.$/)
  // One footer landmark for the whole footer.
  await expect(page.getByRole('contentinfo')).toHaveCount(1)
})

test('desktop frame (2560): logo 271 px, columns 40 px apart, links 8 px apart, parts 465 and 56 px high', async ({ page }) => {
  await open(page, 2560, 1200)
  const logo = await box(page, '[data-el="img-logo-velant-pay"]')
  near(logo.width, 271, 1, 'logo width')
  near(logo.height, 65.7, 1, 'logo height')
  const footer = await box(page, '[data-el="footer"]')
  near(footer.height, 465, 2, 'footer height') // 464 + the line under it
  const bottom = await box(page, '[data-el="footer-bottom"]')
  near(bottom.height, 56, 1, 'footer-bottom height')

  // Columns: 40 px between neighbours, brand on the left, columns on the right (column 1440, 40 px inside).
  const ids = footerColumns.map((column) => column.id)
  const columns = await Promise.all(ids.map((id) => box(page, `[data-el="footer__col-${id}"]`)))
  for (let index = 0; index < columns.length - 1; index++) {
    near(columns[index + 1].x - (columns[index].x + columns[index].width), 40, 1.5, `gap after ${ids[index]}`)
  }
  const container = await box(page, '[data-el="footer__container"]')
  near(columns[columns.length - 1].x + columns[columns.length - 1].width, container.x + container.width - 40, 1.5, 'right edge of the columns')
  near(logo.x, container.x + 40, 1.5, 'brand left edge')
  near(logo.y, footer.y + 120, 1.5, 'top padding')

  // Title 24 px / 32, links 16 px / 24 with 8 px between.
  expect(await page.locator('[data-el="footer__col-platform-title"]').evaluate((el) => getComputedStyle(el).fontSize)).toBe('24px')
  expect((await box(page, '[data-el="footer__col-platform-title"]')).height).toBeCloseTo(32, 0)
  const first = await box(page, '[data-el="footer__link-payment-orchestration"]')
  const second = await box(page, '[data-el="footer__link-smart-routing"]')
  near(second.y - first.y, 32, 1, 'link step (24 + 8)')
  expect(await page.locator('[data-el="footer__link-smart-routing"]').evaluate((el) => getComputedStyle(el).fontSize)).toBe('16px')
  // Backgrounds: upper part subtle (white), lower bar the page color
  await expect(page.locator('[data-el="footer"]')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(page.locator('[data-el="footer-bottom"]')).toHaveCSS('background-color', 'rgb(251, 251, 251)')
})

test('the lower bar of the design: company on the left, legal links in the middle, copyright on the right', async ({ page }) => {
  await open(page, 2560, 1200)
  const name = await box(page, '[data-el="footer-bottom__company-name"]')
  const license = await box(page, '[data-el="footer-bottom__company-license"]')
  const terms = await box(page, '[data-el="footer-bottom__link-terms"]')
  const privacy = await box(page, '[data-el="footer-bottom__link-privacy"]')
  const copyright = await box(page, '[data-el="footer-bottom__copyright"]')
  const container = await box(page, '[data-el="footer-bottom__container"]')
  near(name.x, container.x + 40, 1.5, 'company left edge')
  near(license.x - (name.x + name.width), 24, 1.5, 'gap between the company and the licence')
  near(terms.x - container.x, 829.25 - 0, 6, 'legal links start (the design: 829 px from the column edge)')
  near(privacy.x - (terms.x + terms.width), 24, 1.5, 'gap between legal links')
  near(copyright.x + copyright.width, container.x + container.width - 40, 1.5, 'copyright right edge')
})

test('the column lines run through the footer and the lower bar; dots on the line between them', async ({ page }) => {
  await open(page, 1440, 900)
  for (const block of ['footer', 'footer-bottom']) {
    const shadow = await page.locator(`[data-el="${block}__container"]`).evaluate((el) => getComputedStyle(el).boxShadow)
    expect(shadow, block).toContain('inset')
  }
  const container = await box(page, '[data-el="footer__container"]')
  const dot = await box(page, '[data-el="footer__deco-corner-bl"]')
  near(dot.y + dot.height / 2, container.y + container.height + 0.5, 1.5, 'dot on the line under the footer')
  expect(await page.locator('[data-el="footer__deco-corner-bl"]').evaluate((el) => Number(getComputedStyle(el).zIndex))).toBeGreaterThanOrEqual(10)
})

test('links react to the pointer and keyboard: darker on hover, a visible focus ring', async ({ page }) => {
  await open(page, 1440, 900)
  const link = page.locator('[data-el="footer__link-about"]')
  const before = await link.evaluate((el) => getComputedStyle(el).color)
  await link.hover()
  await expect.poll(() => link.evaluate((el) => getComputedStyle(el).color)).not.toBe(before)
  await expect(link).toHaveCSS('color', 'rgb(24, 24, 24)') // typography-primary
  await page.mouse.move(5, 5)
  await link.focus()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  await expect(link).toBeFocused()
})

test('layouts: side by side from 1600 px, brand above the columns at 1440, grid of columns on a tablet, two columns on a phone', async ({ page }) => {
  await open(page, 1920, 1000)
  let brand = await box(page, '[data-el="footer__brand"]')
  let links = await box(page, '[data-el="footer__links"]')
  expect(brand.x + brand.width).toBeLessThanOrEqual(links.x)
  await open(page, 1440, 900)
  brand = await box(page, '[data-el="footer__brand"]')
  links = await box(page, '[data-el="footer__links"]')
  expect(brand.y + brand.height).toBeLessThanOrEqual(links.y)
  await open(page, 768, 900)
  const first = await box(page, '[data-el="footer__col-platform"]')
  const third = await box(page, '[data-el="footer__col-company"]')
  const fourth = await box(page, '[data-el="footer__col-developers"]')
  near(first.y, third.y, 1, 'three columns in a row on a tablet')
  expect(fourth.y).toBeGreaterThan(first.y + 50)
  await open(page, 393, 850)
  const platform = await box(page, '[data-el="footer__col-platform"]')
  const solutions = await box(page, '[data-el="footer__col-solutions"]')
  const company = await box(page, '[data-el="footer__col-company"]')
  near(platform.y, solutions.y, 1, 'two columns in a row on a phone')
  expect(company.y).toBeGreaterThan(platform.y + 50)
})

test('the footer closes the page and follows the cta; the column goes on without a break', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const cta = await box(page, '[data-el="cta"]')
  near((await box(page, '[data-el="site-footer"]')).y, cta.y + cta.height, 0.5, 'footer follows cta')
  await expect(page.locator('[data-el="cta__deco-column-fade-bottom-left"]')).toHaveCount(0)
})

test('dark theme: footer and the bar take the dark surfaces, text follows the tokens', async ({ page }) => {
  await open(page, 1440, 900)
  await page.locator('[data-el="header"] [data-el="header__theme-toggle"]').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.locator('[data-el="site-footer"]').evaluate((el) => el.scrollIntoView({ block: 'end' }))
  await page.waitForTimeout(600)
  await expect(page.locator('[data-el="footer"]')).toHaveCSS('background-color', 'rgb(24, 24, 24)')
  await expect(page.locator('[data-el="footer-bottom"]')).toHaveCSS('background-color', 'rgb(14, 14, 14)')
  await expect(page.locator('[data-el="footer__col-platform-title"]')).toHaveCSS('color', 'rgb(255, 255, 255)')
  await page.locator('[data-el="site-footer"]').screenshot({ path: 'tests/artifacts/footer-desktop-1440-dark.png' })
})
