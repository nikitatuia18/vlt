import { expect, test, type Page } from '@playwright/test'
import { cryptoProcessing } from '../src/pages/crypto-processing/content'
import { invoicing } from '../src/pages/invoicing/content'
import { massPayouts } from '../src/pages/mass-payouts/content'
import { ramp } from '../src/pages/ramp/content'

const viewports = [
  { name: 'mobile-393', width: 393, height: 900 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 900 },
  { name: 'desktop-1280', width: 1280, height: 900 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-2560', width: 2560, height: 1000 },
]

const pages = [
  { path: '/crypto-processing', name: 'crypto-processing', content: cryptoProcessing },
  { path: '/invoicing', name: 'invoicing', content: invoicing },
  { path: '/ramp', name: 'ramp', content: ramp },
  { path: '/mass-payouts', name: 'mass-payouts', content: massPayouts },
]

// The id of a product in the dropdown of "Products" is also its name in the layers; the page of each is the one of the product.
const products: Record<string, { label: string; href: string }> = {
  'crypto-processing': { label: 'Crypto Processing', href: '/crypto-processing' },
  'crypto-to-cash': { label: 'Crypto to Cash', href: '/ramp' },
  invoicing: { label: 'Invoicing', href: '/invoicing' },
  'mass-payouts': { label: 'Mass Payouts', href: '/mass-payouts' },
}

const section = (page: Page) => page.locator('[data-el="works-with"]')
const card = (page: Page, product: string) => page.locator(`[data-el="works-with__card-${product}"]`)

for (const { path, content } of pages) {
  test(`${path}: three cards with the other products, each the whole card a link with its own line`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 2, name: 'Works great with' })).toBeVisible()
    const items = content.worksWith.items
    expect(items).toHaveLength(3)
    const icons = new Set<string>()
    for (const item of items) {
      const product = products[item.product]
      const link = card(page, item.product)
      // Never a link to the page we are on, and always one of the other three products.
      expect(product.href).not.toBe(path)
      expect(await link.evaluate((element) => element.tagName)).toBe('A')
      await expect(link).toHaveAttribute('href', product.href)
      await expect(link.locator('a, button')).toHaveCount(0)
      await expect(page.locator(`[data-el="works-with__card-${item.product}-title"]`)).toHaveText(product.label)
      await expect(page.locator(`[data-el="works-with__card-${item.product}-desc"]`)).toHaveText(item.description)
      // The icon of the product from the dropdown (a mask over the text color) and the round arrow (a plain box).
      await expect(page.locator(`[data-el="works-with__card-${item.product}-icon"] > span`)).toHaveCSS('mask-image', /^url\(/)
      icons.add(await page.locator(`[data-el="works-with__card-${item.product}-icon"] > span`).evaluate((element) => getComputedStyle(element).maskImage))
      expect(await page.locator(`[data-el="works-with__card-${item.product}-arrow"]`).evaluate((element) => element.tagName)).toBe('SPAN')
    }
    expect(icons.size, 'every product has its own icon').toBe(3)
    // The block stands before "Industries" and no digits are left in the cards.
    const order = await page.locator('main > section').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-el')))
    expect(order.indexOf('works-with')).toBe(order.indexOf('industries') - 1)
    await expect(section(page)).not.toContainText(/\b0[1-9]\b/)
  })

  test(`${path}: a click on a card opens the product`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(path)
    const first = content.worksWith.items[0].product
    await card(page, first).scrollIntoViewIfNeeded()
    await page.waitForTimeout(1500)
    await card(page, first).click({ position: { x: 100, y: 120 } })
    await expect(page).toHaveURL(new RegExp(`${products[first].href}$`))
  })
}

for (const viewport of viewports) {
  test(`works-with screenshot ${viewport.name} on all four pages, no horizontal scroll`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    for (const { path, name } of pages) {
      await page.goto(path)
      await page.evaluate(() => document.fonts.ready)
      await section(page).evaluate((node) => node.scrollIntoView({ block: 'center' }))
      await page.waitForTimeout(1800)
      await section(page).screenshot({ path: `tests/artifacts/works-with-${name}-${viewport.name}.png` })
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow, path).toBe(0)
    }
  })
}

test('layout: one column on mobile, three in a row from the tablet width, cards of one height', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 900 })
  await page.goto('/invoicing')
  const mobile = await Promise.all(['crypto-processing', 'crypto-to-cash', 'mass-payouts'].map((product) => card(page, product).boundingBox()))
  expect(mobile[1]!.y).toBeGreaterThan(mobile[0]!.y)
  expect(mobile[1]!.x).toBeCloseTo(mobile[0]!.x, 0)

  for (const width of [768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/invoicing')
    const row = await Promise.all(['crypto-processing', 'crypto-to-cash', 'mass-payouts'].map((product) => card(page, product).boundingBox()))
    expect(row[1]!.y).toBeCloseTo(row[0]!.y, 0)
    expect(row[2]!.y).toBeCloseTo(row[0]!.y, 0)
    expect(row[1]!.x).toBeGreaterThan(row[0]!.x + row[0]!.width)
    expect(row[1]!.height).toBeCloseTo(row[0]!.height, 0)
  }
})

test('hover: the card grows 3 % and turns grey, the circle with the arrow stays white', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/crypto-processing')
  const target = card(page, 'invoicing')
  const arrow = page.locator('[data-el="works-with__card-invoicing-arrow"]')
  await target.scrollIntoViewIfNeeded()
  await page.waitForTimeout(1500)
  await expect(target).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await target.hover({ position: { x: 100, y: 120 } })
  await expect(target).toHaveCSS('background-color', 'rgb(243, 243, 243)') // surface-hover
  await expect(arrow).toHaveCSS('background-color', 'rgb(255, 255, 255)') // surface-subtle
  await expect.poll(() => target.evaluate((element) => getComputedStyle(element).scale)).toBe('1.03')
})

test('dark theme: dark cards, a lighter hover, the circle darker than the hovered card', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/ramp')
  await page.locator('[data-el="header"] [data-el="header__theme-toggle"]').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await section(page).evaluate((node) => node.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(1800)
  const target = card(page, 'invoicing')
  await expect(target).toHaveCSS('background-color', 'rgb(24, 24, 24)') // surface-subtle, Dark
  await target.hover({ position: { x: 100, y: 120 } })
  await expect(target).toHaveCSS('background-color', 'rgb(38, 38, 38)') // surface-hover, Dark
  await expect(page.locator('[data-el="works-with__card-invoicing-arrow"]')).toHaveCSS('background-color', 'rgb(24, 24, 24)')
  await section(page).screenshot({ path: 'tests/artifacts/works-with-ramp-desktop-1440-dark.png' })
})
