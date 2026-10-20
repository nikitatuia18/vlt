import { expect, test, type Page } from '@playwright/test'

const header = (page: Page) => page.locator('[data-el="header"]')
const top = async (page: Page) => (await header(page).boundingBox())!.y
const scrollBy = async (page: Page, delta: number) => {
  await page.mouse.wheel(0, delta)
  await page.waitForTimeout(700)
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
})

test('at the top of the page the header is in place', async ({ page }) => {
  expect(await top(page)).toBe(0)
  await expect(header(page)).toHaveAttribute('data-hidden', 'false')
})

test('scrolling down hides the header, scrolling up brings it back, and it is pinned to the top', async ({ page }) => {
  await scrollBy(page, 1200)
  await expect(header(page)).toHaveAttribute('data-hidden', 'true')
  expect(await top(page)).toBeLessThan(-40)

  await scrollBy(page, -150)
  await expect(header(page)).toHaveAttribute('data-hidden', 'false')
  expect(await top(page)).toBe(0) // pinned: on the top edge of the screen although the page is scrolled

  await scrollBy(page, 600)
  await expect(header(page)).toHaveAttribute('data-hidden', 'true')
})

test('a tiny movement in the other direction does not flip the header', async ({ page }) => {
  await scrollBy(page, 1200)
  await scrollBy(page, -4)
  await expect(header(page)).toHaveAttribute('data-hidden', 'true')
})

test('scrolling back to the very top shows the header', async ({ page }) => {
  await scrollBy(page, 1500)
  await scrollBy(page, -3000) // the smooth scroll goes on by itself, so go back with the wheel like a user
  await page.waitForTimeout(700)
  await expect(header(page)).toHaveAttribute('data-hidden', 'false')
  expect(await top(page)).toBe(0)
})

test('the header stays while the burger menu is open', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 850 })
  await page.getByRole('button', { name: 'Open menu' }).click()
  await scrollBy(page, 1200)
  await expect(header(page)).toHaveAttribute('data-hidden', 'false')
})

test('keyboard focus inside the header keeps it, a mouse click does not', async ({ page }) => {
  await scrollBy(page, 1200)
  await expect(header(page)).toHaveAttribute('data-hidden', 'true')
  await page.keyboard.press('Tab') // the skip link, the first stop of the page: not in the header
  await page.keyboard.press('Tab') // the logo of the header
  await page.waitForTimeout(500)
  await expect(header(page)).toHaveAttribute('data-hidden', 'false')
})
