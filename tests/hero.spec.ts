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

// --- Interactive dot background (canvas) ---
// The first dot of the grid sits at (spacing / 2, spacing / 2) = (20, 20) of the canvas, radius 1 px.
type Page = import('@playwright/test').Page
const canvas = (page: Page) => page.locator('[data-el="hero__bg"] canvas')
const pixelAtFirstDot = (page: Page) =>
  canvas(page).evaluate((element) => {
    const [r, g, b, a] = (element as HTMLCanvasElement).getContext('2d')!.getImageData(20, 20, 1, 1).data
    return { r, g, b, a }
  })
const alphaAtFirstDot = async (page: Page) => (await pixelAtFirstDot(page)).a

test('background: the canvas fills the hero and draws the dot grid in the prototype color', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const hero = await page.locator('[data-el="hero"]').boundingBox()
  const box = await canvas(page).boundingBox()
  expect(box?.width).toBeCloseTo(hero!.width, 0)
  expect(box?.height).toBeCloseTo(hero!.height, 0)
  await expect.poll(() => alphaAtFirstDot(page)).toBeGreaterThan(100)
  const { r, g, b } = await pixelAtFirstDot(page)
  for (const channel of [r, g, b]) expect(Math.abs(channel - 0x8f)).toBeLessThanOrEqual(2) // #8f8f8f
})

test('background: the pointer pushes dots away and they return when it leaves', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const hero = await page.locator('[data-el="hero"]').boundingBox()
  await expect.poll(() => alphaAtFirstDot(page)).toBeGreaterThan(100)

  // Pointer 40 px to the right of the first dot: the dot is pushed away from it.
  await page.mouse.move(hero!.x + 60, hero!.y + 20)
  await expect.poll(() => alphaAtFirstDot(page)).toBeLessThan(10)

  await page.evaluate(() => document.documentElement.dispatchEvent(new PointerEvent('pointerleave')))
  await expect.poll(() => alphaAtFirstDot(page), { timeout: 8000 }).toBeGreaterThan(100)
})

test('background: screenshot with the pointer over the middle of the hero', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const hero = await page.locator('[data-el="hero"]').boundingBox()
  await expect.poll(() => alphaAtFirstDot(page)).toBeGreaterThan(100)
  await page.mouse.move(hero!.x + 300, hero!.y + 250, { steps: 8 })
  await page.waitForTimeout(900) // let the dots settle around the pointer
  await page.screenshot({ path: 'tests/artifacts/hero-dots-pushed.png' })
})

test('background: with reduced motion the dots stay still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const hero = await page.locator('[data-el="hero"]').boundingBox()
  await expect.poll(() => alphaAtFirstDot(page)).toBeGreaterThan(100)
  await page.mouse.move(hero!.x + 60, hero!.y + 20)
  await page.waitForTimeout(600)
  expect(await alphaAtFirstDot(page)).toBeGreaterThan(100)
})

test('background: dot color follows the theme', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await expect.poll(() => alphaAtFirstDot(page)).toBeGreaterThan(100)
  await page.locator('[data-el="header"] [data-el="header__theme-toggle"]').click()
  await page.mouse.move(700, 800)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('[data-el="header__theme-toggle"]').first()).toHaveCSS('background-color', 'rgb(24, 24, 24)')
  // Dark: --dots-color = typography-tertiary (white at 34%), so the dot is light, not #8f8f8f.
  await expect.poll(async () => (await pixelAtFirstDot(page)).r).toBeGreaterThan(200)
  await page.screenshot({ path: 'tests/artifacts/hero-desktop-1440-dark.png' })
})

test('background: the canvas does not catch clicks (buttons under the pointer work)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const hit = await page.evaluate(() => {
    const button = document.querySelector('[data-el="hero__cta-primary"]')!.getBoundingClientRect()
    return document.elementFromPoint(button.x + 8, button.y + 8)?.closest('[data-el]')?.getAttribute('data-el')
  })
  expect(hit).toBe('hero__cta-primary')
})
