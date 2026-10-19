import { expect, test } from '@playwright/test'

const viewports = [
  { name: 'mobile-393', width: 393, height: 900 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 900 },
  { name: 'desktop-1280', width: 1280, height: 900 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-2560', width: 2560, height: 1000 },
]

for (const viewport of viewports) {
  test(`hero screenshot ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: `tests/artifacts/hero-${viewport.name}.png`, fullPage: true })

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBe(0)
  })
}

const title = (page: import('@playwright/test').Page) => page.locator('[data-el="hero__title"]')

test('title text and the three lines of the design', async ({ page }) => {
  await page.goto('/')
  await expect(title(page)).toHaveText(/Banking for today\.\s*Clients pay their way\.\s*You settle yours\./)
  // The only h1 of the page.
  await expect(page.locator('h1')).toHaveCount(1)
})

// Title size per width: [width, font-size px, height px = 3 lines × line-height]
const titleSteps = [
  [393, 32, 120], // mobile frame: heading 361 x 120
  [768, 40, 144],
  [1024, 64, 216],
  [1280, 80, 264], // desktop frame: heading 1360 x 264
  [1440, 80, 264],
]

for (const [width, fontSize, height] of titleSteps) {
  test(`title is ${fontSize}px and exactly 3 lines at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const size = await title(page).evaluate((el) => getComputedStyle(el).fontSize)
    expect(size).toBe(`${fontSize}px`)
    const box = await title(page).boundingBox()
    expect(box?.height).toBeCloseTo(height, 0)
  })
}

test('desktop: subtitle 700 px max, buttons 56 px high in a row, centered', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const subtitle = await page.locator('[data-el="hero__subtitle"]').boundingBox()
  expect(subtitle?.width).toBeLessThanOrEqual(700.5)
  const primary = await page.locator('[data-el="hero__cta-primary"]').boundingBox()
  const secondary = await page.locator('[data-el="hero__cta-secondary"]').boundingBox()
  expect(primary?.height).toBeCloseTo(56, 0)
  expect(secondary?.height).toBeCloseTo(56, 0)
  expect(primary!.y).toBeCloseTo(secondary!.y, 0) // same row
  expect(secondary!.x - (primary!.x + primary!.width)).toBeCloseTo(16, 0) // gap 16
  // The pair is centered in the 1440 px column.
  const center = primary!.x + (secondary!.x + secondary!.width - primary!.x) / 2
  expect(center).toBeCloseTo(720, 0)
})

test('mobile: buttons stacked and as wide as the text column (393 - 2 × 16)', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 900 })
  await page.goto('/')
  const primary = await page.locator('[data-el="hero__cta-primary"]').boundingBox()
  const secondary = await page.locator('[data-el="hero__cta-secondary"]').boundingBox()
  expect(primary?.width).toBeCloseTo(361, 0)
  expect(secondary?.width).toBeCloseTo(361, 0)
  expect(secondary!.y).toBeGreaterThan(primary!.y + primary!.height) // stacked
})

test('dark theme: the hero background blends in instead of showing a light rectangle', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.locator('[data-el="header"] [data-el="header__theme-toggle"]').click()
  await page.mouse.move(700, 800)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('[data-el="header__theme-toggle"]').first()).toHaveCSS('background-color', 'rgb(24, 24, 24)')
  const blend = await page.locator('[data-el="img-hero-bg"]').evaluate((el) => getComputedStyle(el).mixBlendMode)
  expect(blend).toBe('screen')
  await page.screenshot({ path: 'tests/artifacts/hero-desktop-1440-dark.png' })
})
