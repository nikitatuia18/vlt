import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

const typographyCss = readFileSync('src/styles/typography.css', 'utf8')
const tokensCss = readFileSync('src/styles/tokens.css', 'utf8')

test('UI Kit lists every text style and every semantic color from the CSS', async ({ page }) => {
  await page.goto('/ui-kit')
  await expect(page.getByRole('heading', { level: 1, name: 'UI Kit' })).toBeVisible()

  // Text styles: the hand-written list in UiKitPage.tsx must match typography.css.
  const cssStyles = [...typographyCss.matchAll(/@utility (type-[a-z0-9-]+)/g)].map((m) => m[1]).sort()
  const shown = await page.locator('[data-el="ui-kit__typography"] li p:first-child').allTextContents()
  expect(shown.sort()).toEqual(cssStyles)

  // Colors: the page reads tokens.css itself; check the count to catch a broken parser.
  const themeBlock = tokensCss.split('@theme static {')[1].split('\n}')[0]
  const cssColors = [...themeBlock.matchAll(/--(color-(?:typography|icon|surface|border)-[a-z0-9-]+):/g)].length
  await expect(page.locator('[data-el="ui-kit__colors"] ul li')).toHaveCount(cssColors)
  expect(cssColors).toBe(41) // 40 + surface-dots
})

test('UI Kit: text styles are really applied (font size from the computed style)', async ({ page }) => {
  await page.goto('/ui-kit')
  await page.evaluate(() => document.fonts.ready)
  const row = page.locator('[data-el="ui-kit__typography"] li', { hasText: 'type-display-xl' }).first()
  await expect(row).toContainText('80px / 88px')
  const small = page.locator('[data-el="ui-kit__typography"] li', { hasText: 'type-ui-xs' }).first()
  await expect(small).toContainText('12px / 16px')
})

test('UI Kit: colors follow the theme', async ({ page }) => {
  await page.goto('/ui-kit')
  const swatch = page.locator('[data-el="ui-kit__colors"] li', { hasText: 'color-surface-page' }).first()
  await expect(swatch).toContainText('rgb(251, 251, 251)')
  await page.locator('main').getByRole('button', { name: 'Switch color theme' }).first().click()
  await expect(swatch).toContainText('rgb(14, 14, 14)')
})

test('UI Kit: the interactive background demo draws dots and reacts to the pointer', async ({ page }) => {
  await page.goto('/ui-kit')
  const demo = page.locator('[data-el="ui-kit__dots-demo"]')
  await demo.scrollIntoViewIfNeeded()
  const alphaAtFirstDot = () =>
    demo.locator('canvas').evaluate((element) => (element as HTMLCanvasElement).getContext('2d')!.getImageData(20, 20, 1, 1).data[3])
  await expect.poll(alphaAtFirstDot).toBeGreaterThan(100)
  const box = await demo.boundingBox()
  await page.mouse.move(box!.x + 60, box!.y + 20)
  await expect.poll(alphaAtFirstDot).toBeLessThan(10)
})

test('UI Kit screenshots, no sideways scroll', async ({ page }) => {
  for (const [name, width] of [['mobile-393', 393], ['desktop-1440', 1440]] as const) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ui-kit')
    // The page is a lazy chunk: wait until it is really rendered before taking the screenshot.
    await expect(page.getByRole('heading', { level: 1, name: 'UI Kit' })).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: `tests/artifacts/ui-kit-${name}.png`, fullPage: true })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBe(0)
  }
})
