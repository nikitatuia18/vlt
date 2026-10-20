import { expect, test } from '@playwright/test'

test('the first stop of Tab is the skip link: it shows up and takes the visitor to the content', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const skip = page.locator('[data-el="skip-link"]')
  // Hidden until it gets focus.
  const hidden = (await skip.boundingBox())!
  expect(hidden.width).toBeLessThanOrEqual(1)
  await page.keyboard.press('Tab')
  await expect(skip).toBeFocused()
  await page.screenshot({ path: 'tests/artifacts/skip-link-focus.png', clip: { x: 0, y: 0, width: 720, height: 140 } })
  const shown = (await skip.boundingBox())!
  expect(shown.width).toBeGreaterThan(80)
  expect(shown.x).toBeGreaterThanOrEqual(0)
  expect(shown.y).toBeGreaterThanOrEqual(0)
  await page.keyboard.press('Enter')
  expect(page.url()).toMatch(/#main$/)
  await expect(page.locator('main#main')).toBeAttached()
})

test('links of the header and the footer show a focus ring for the keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const ring = (selector: string) =>
    page.locator(selector).evaluate((el) => {
      const style = getComputedStyle(el)
      return { style: style.outlineStyle, width: style.outlineWidth }
    })
  // Tab through the start of the page: skip link, logo, menu items. Each of them must get an outline of its own.
  const seen: string[] = []
  for (let step = 0; step < 4; step++) {
    await page.keyboard.press('Tab')
    const name = await page.evaluate(() => document.activeElement?.getAttribute('data-el') ?? '')
    if (name.startsWith('header__')) {
      seen.push(name)
      expect(await ring(`[data-el="${name}"]`), name).toEqual({ style: 'solid', width: '2px' })
    }
  }
  expect(seen.length).toBeGreaterThanOrEqual(2)
  // The footer logo link (the footer links have had their ring from the start).
  await page.locator('footer a[aria-label="Velant Pay, home"]').focus()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  expect(await ring('footer a[aria-label="Velant Pay, home"]')).toEqual({ style: 'solid', width: '2px' })
})
