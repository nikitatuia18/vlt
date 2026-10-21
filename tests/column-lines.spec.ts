import { expect, test, type Page } from '@playwright/test'

// Where the column of a block meets a horizontal line: dots on the corners, above the neighbour block.
// Where the column ends in a block without column lines: the lines go on and fade out.
const ends = [
  { block: 'features', edge: 'top', corners: ['tl', 'tr'], fade: true },
  { block: 'features', edge: 'bottom', corners: ['bl', 'br'], fade: false },
  { block: 'industries', edge: 'bottom', corners: ['bl', 'br'], fade: true },
  { block: 'next-steps', edge: 'top', corners: ['tl', 'tr'], fade: true },
  { block: 'next-steps', edge: 'bottom', corners: ['bl', 'br'], fade: false }, // the column goes on in the FAQ block
  { block: 'faq', edge: 'bottom', corners: ['bl', 'br'], fade: false }, // the column goes on in the cta block
  { block: 'cta', edge: 'bottom', corners: ['bl', 'br'], fade: false }, // the column goes on in the footer
  { block: 'footer', edge: 'bottom', corners: ['bl', 'br'], fade: false },
] as const

const box = async (page: Page, selector: string) => (await page.locator(selector).boundingBox())!

// On a phone (below 768 px) the lines and the dots are off: the content stands at the lines and they merge with it.
for (const end of ends) {
  test(`${end.block} ${end.edge}: no column lines, dots and fade at 393`, async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 850 })
    await page.goto('/')
    const container = page.locator(`[data-el="${end.block}__container"]`)
    expect(await container.evaluate((el) => getComputedStyle(el).boxShadow), end.block).toBe('none')
    for (const corner of end.corners) {
      await expect(page.locator(`[data-el="${end.block}__deco-corner-${corner}"]`)).toBeHidden()
    }
    if (end.fade) await expect(page.locator(`[data-el="${end.block}__deco-column-fade-${end.edge}-left"]`)).toBeHidden()
  })
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 768, height: 900 }]) {
  for (const end of ends) {
    test(`${end.block} ${end.edge}: dots on the corners above the next block${end.fade ? ', lines fade out' : ''} at ${viewport.width}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/')
      await page.evaluate(() => document.fonts.ready)
      const container = page.locator(`[data-el="${end.block}__container"]`)
      const containerBox = (await container.boundingBox())!
      const lineY = end.edge === 'top' ? containerBox.y - 0.5 : containerBox.y + containerBox.height + 0.5

      for (const corner of end.corners) {
        const dot = page.locator(`[data-el="${end.block}__deco-corner-${corner}"]`)
        await expect(dot).toHaveCount(1)
        const dotBox = (await dot.boundingBox())!
        // Centered on the horizontal line, on the column line.
        expect(Math.abs(dotBox.y + dotBox.height / 2 - lineY)).toBeLessThan(1.5)
        // Above the neighbour block (which is positioned and would cover the outer half of the dot).
        expect(await dot.evaluate((el) => Number(getComputedStyle(el).zIndex))).toBeGreaterThanOrEqual(10)
      }

      const left = page.locator(`[data-el="${end.block}__deco-column-fade-${end.edge}-left"]`)
      if (!end.fade) {
        await expect(left).toHaveCount(0)
        return
      }
      const fade = await box(page, `[data-el="${end.block}__deco-column-fade-${end.edge}-left"]`)
      expect(fade.height).toBeGreaterThan(100)
      expect(fade.width).toBeLessThan(2)
      // The lines start right behind the horizontal line and run away from the block.
      if (end.edge === 'top') expect(fade.y + fade.height).toBeLessThanOrEqual(containerBox.y)
      else expect(fade.y).toBeGreaterThanOrEqual(containerBox.y + containerBox.height)
      // Full at the line, nothing at the end: a gradient from a visible color to a transparent one.
      const gradient = await left.evaluate((el) => getComputedStyle(el).backgroundImage)
      expect(gradient).toContain('linear-gradient')
    })
  }
}

test('the column lines of the block with products and of the steps are visible (like in industries)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  for (const block of ['features', 'next-steps', 'industries', 'faq', 'cta', 'footer', 'footer-bottom']) {
    const shadow = await page.locator(`[data-el="${block}__container"]`).evaluate((el) => getComputedStyle(el).boxShadow)
    expect(shadow, block).not.toBe('none')
    expect(shadow, block).toContain('inset')
  }
})
