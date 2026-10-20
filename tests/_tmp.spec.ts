import { test } from '@playwright/test'

for (const [w, h] of [[1440, 900], [1920, 1080], [1024, 800], [393, 850]] as const) {
  test(`global look ${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const tall = await page.evaluate(() => {
      const r = document.querySelector('[data-el="global"]')!.getBoundingClientRect()
      return { top: r.top + window.scrollY, height: r.height }
    })
    // End of the pinned scene.
    await page.evaluate((y) => window.scrollTo(0, y), tall.top + tall.height - h - 10)
    await page.waitForTimeout(2800)
    await page.screenshot({ path: `tests/artifacts/tmp-global-pinned-${w}.png` })
    // Leave downward, come back up: the plain block.
    await page.evaluate(() => window.scrollBy(0, 1500))
    await page.waitForTimeout(1200)
    const plain = await page.evaluate(() => {
      const r = document.querySelector('[data-el="global"]')!.getBoundingClientRect()
      return r.top + window.scrollY
    })
    await page.evaluate((y) => window.scrollTo(0, y - 60), plain)
    await page.waitForTimeout(2200)
    await page.screenshot({ path: `tests/artifacts/tmp-global-plain-${w}.png` })
  })
}
