import { expect, test } from '@playwright/test'

test('the wheel scrolls smoothly: the page does not jump at once but catches up in a moment', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await page.mouse.wheel(0, 600)
  await page.waitForTimeout(60)
  const early = await page.evaluate(() => window.scrollY)
  expect(early).toBeLessThan(560) // still on its way
  await page.waitForTimeout(1600)
  const settled = await page.evaluate(() => window.scrollY)
  expect(settled).toBeGreaterThan(590)
  expect(settled).toBeLessThan(610)
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('the wheel scrolls as usual, without smoothing', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.mouse.wheel(0, 600)
    await page.waitForTimeout(200)
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(590)
  })
})
