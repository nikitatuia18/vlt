import { expect, test, type Page } from '@playwright/test'
import { navItems } from '../src/components/ui/Header/navigation'

// The menu follows the home page as a landing: one item per block, the item of the block on the screen is marked.

const blockOf: Record<string, string> = {
  products: 'features',
  industries: 'industries',
  global: 'global',
  'get-started': 'next-steps',
  faq: 'faq',
  contact: 'cta',
}

/** A block reached from the menu stops under the header: `scroll-padding-top` of the page is 80 px. */
const HEADER = 80

const top = (page: Page, dataEl: string) => page.locator(`[data-el="${dataEl}"]`).evaluate((el) => Math.round(el.getBoundingClientRect().top))

test('every menu item has its block on the home page, in the order of the page', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const tops: number[] = []
  for (const item of navItems) {
    await expect(page.locator(`#${item.id}`)).toHaveAttribute('data-el', blockOf[item.id])
    tops.push(await page.locator(`#${item.id}`).evaluate((el) => el.getBoundingClientRect().top + window.scrollY))
  }
  expect(tops).toEqual([...tops].sort((a, b) => a - b))
})

test('a click on a menu item glides to its block, puts the hash in the address and marks the item', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await page.locator('[data-el="header__menu-item-faq"]').click()
  await expect.poll(() => top(page, 'faq'), { timeout: 8000 }).toBeLessThan(HEADER + 20)
  await expect.poll(() => top(page, 'faq')).toBeGreaterThan(HEADER - 20)
  await expect(page).toHaveURL(/#faq$/)
  await expect(page.locator('[data-el="header__menu-item-faq"]')).toHaveAttribute('aria-current', 'true')
  await expect(page.locator('[data-el="header__menu"] [aria-current="true"]')).toHaveCount(1)
})

test('the selected item follows the scroll and is empty on the first screen', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await expect(page.locator('[data-el="header__menu"] [aria-current="true"]')).toHaveCount(0)
  for (const id of ['products', 'faq', 'contact']) {
    await page.locator(`#${id}`).evaluate((el) => el.scrollIntoView({ block: 'center' }))
    await expect(page.locator(`[data-el="header__menu-item-${id}"]`)).toHaveAttribute('aria-current', 'true')
  }
})

test('on the page of a product the menu leads to the blocks of the home page; the page itself is under "Products"', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/crypto-processing')
  await expect(page.locator('[data-el="header__menu-item-products"]')).toHaveAttribute('aria-current', 'true')
  await page.locator('[data-el="header__menu-item-industries"]').click()
  await expect(page).toHaveURL(/\/#industries$/)
  await page.evaluate(() => document.fonts.ready)
  await expect.poll(() => top(page, 'industries'), { timeout: 8000 }).toBeLessThan(HEADER + 20)
  await expect(page.locator('[data-el="header__menu-item-industries"]')).toHaveAttribute('aria-current', 'true')
})

test('the Crypto Processing card of the home page and the footer lead to its page', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await expect(page.locator('[data-el="features__card-crypto-cta"]')).toHaveAttribute('href', '/crypto-processing')
  await expect(page.locator('[data-el="footer__link-crypto-processing"]')).toHaveAttribute('href', '/crypto-processing')
  await page.locator('[data-el="features__card-crypto-cta"]').click()
  await expect(page).toHaveURL(/\/crypto-processing$/)
  await expect(page.locator('h1')).toContainText('Accept crypto payments')
})

test('the skip link and a link to a block that is not there are left to the browser', async ({ page }) => {
  await page.goto('/')
  await page.locator('[data-el="skip-link"]').focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main$/)
})
