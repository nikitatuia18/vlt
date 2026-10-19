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

test('background: the canvas fills the hero and draws the dot grid in the surface-dots color', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const hero = await page.locator('[data-el="hero"]').boundingBox()
  const box = await canvas(page).boundingBox()
  // The background frame is 79.17 % of the section high and starts 4.85 % above it (design: 1273 px, -78 px, section 1608 px).
  expect(box?.width).toBeCloseTo(hero!.width, 0)
  expect(box?.height).toBeCloseTo(hero!.height * 0.7917, 0)
  expect(box!.y).toBeCloseTo(hero!.y - hero!.height * 0.0485, 0)
  await expect.poll(() => alphaAtFirstDot(page)).toBeGreaterThan(100)
  const { r, g, b } = await pixelAtFirstDot(page)
  for (const channel of [r, g, b]) expect(Math.abs(channel - 0xa3)).toBeLessThanOrEqual(2) // surface-dots Light = neutral/400 #a3a3a3
})

test('background: the pointer pushes dots away and they return when it leaves', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const box = await canvas(page).boundingBox()
  await expect.poll(() => alphaAtFirstDot(page)).toBeGreaterThan(100)

  // Pointer 40 px to the right of the first dot (canvas coordinates 20, 20): the dot is pushed away from it.
  await page.mouse.move(box!.x + 60, box!.y + 20)
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
  const box = await canvas(page).boundingBox()
  await expect.poll(() => alphaAtFirstDot(page)).toBeGreaterThan(100)
  await page.mouse.move(box!.x + 60, box!.y + 20)
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
  // Dark: surface-dots = neutral/600 #525252, a much darker dot than the Light one (#a3a3a3).
  await expect.poll(async () => Math.abs((await pixelAtFirstDot(page)).r - 0x52)).toBeLessThanOrEqual(3)
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

// --- Hero Media (placeholder card) ---
test('hero media at the width of the desktop frame: 1440 x 800, radius 48, white card; whole hero is 1608 px', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1000 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const media = page.locator('[data-el="hero__media"]')
  const box = await media.boundingBox()
  expect(box?.width).toBeCloseTo(1440, 0)
  expect(box?.height).toBeCloseTo(800, 0)
  const style = await media.evaluate((el) => {
    const cs = getComputedStyle(el)
    return { radius: cs.borderTopLeftRadius, background: cs.backgroundColor, overflow: cs.overflow }
  })
  expect(style.radius).toBe('48px')
  expect(style.background).toBe('rgb(255, 255, 255)') // surface-subtle
  expect(style.overflow).toBe('hidden')
  // 80 px between the buttons and the card; hero = 140 + 448 + 80 + 800 + 140.
  const actions = await page.locator('[data-el="hero__actions"]').boundingBox()
  expect(box!.y - (actions!.y + actions!.height)).toBeCloseTo(80, 0)
  const hero = await page.locator('[data-el="hero"]').boundingBox()
  expect(hero?.height).toBeCloseTo(1608, 0)
})

test('hero media keeps the 1440 : 800 proportion and is empty at every width', async ({ page }) => {
  for (const width of [393, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const media = page.locator('[data-el="hero__media"]')
    const box = await media.boundingBox()
    expect(box!.width / box!.height).toBeCloseTo(1440 / 800, 2)
    await expect(media).toBeEmpty()
    const radius = await media.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)
    expect(radius).toBe(width >= 1280 ? '48px' : '32px')
  }
})

// --- Fade: a gradient in the page color over the dots ---
test('background fade: frame 1273 px high, 78 px above the section, at the width of the desktop frame', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1000 })
  await page.goto('/')
  const hero = await page.locator('[data-el="hero"]').boundingBox()
  const bg = await page.locator('[data-el="hero__bg"]').boundingBox()
  expect(bg?.height).toBeCloseTo(1273, 0)
  expect(hero!.y - bg!.y).toBeCloseTo(78, 0)
  // The fade covers exactly the dots and is a gradient in the page color.
  const fade = await page.locator('[data-el="hero__bg-fade"]').boundingBox()
  expect(fade?.height).toBeCloseTo(1273, 0)
  const image = await page.locator('[data-el="hero__bg-fade"]').evaluate((el) => getComputedStyle(el).backgroundImage)
  // Direction is "to bottom" by default and is not written out. Starts fully transparent, ends in the page color.
  expect(image).toContain('linear-gradient')
  expect(image).toContain('/ 0) 0%')
  expect(image).toContain('rgb(251, 251, 251) 100%')
})

// Reads the real pixels of a page area: screenshot → canvas → darkest channel value.
const darkestPixel = async (page: Page, clip: { x: number; y: number; width: number; height: number }) => {
  const png = await page.screenshot({ clip, fullPage: true })
  return page.evaluate(async (base64) => {
    const image = new Image()
    image.src = `data:image/png;base64,${base64}`
    await image.decode()
    const surface = document.createElement('canvas')
    surface.width = image.width
    surface.height = image.height
    const context = surface.getContext('2d')!
    context.drawImage(image, 0, 0)
    const data = context.getImageData(0, 0, image.width, image.height).data
    let darkest = 255
    for (let i = 0; i < data.length; i += 4) darkest = Math.min(darkest, data[i], data[i + 1], data[i + 2])
    return darkest
  }, png.toString('base64'))
}

test('background fade: dots are visible near the top and gone at the bottom edge of the frame', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1000 })
  await page.goto('/')
  await expect.poll(() => alphaAtFirstDot(page)).toBeGreaterThan(100)
  const hero = await page.locator('[data-el="hero"]').boundingBox()
  // Top: a dot row 22..102 px below the section top; bottom: last dot row of the frame (1182 px).
  const top = await darkestPixel(page, { x: 0, y: hero!.y + 95, width: 300, height: 14 })
  const bottom = await darkestPixel(page, { x: 0, y: hero!.y + 1176, width: 300, height: 14 })
  expect(top).toBeLessThan(200) // dots visible (#a3a3a3 = 163, slightly faded)
  expect(bottom).toBeGreaterThanOrEqual(247) // page color #fbfbfb = 251, dots fully faded
})

test('background fade: in the dark theme it fades into the dark page color', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.locator('[data-el="header"] [data-el="header__theme-toggle"]').click()
  await page.mouse.move(700, 800)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  const fadeEnd = await page.locator('[data-el="hero__bg-fade"]').evaluate((el) => getComputedStyle(el).backgroundImage)
  // The gradient end is the page color of the dark theme (#0e0e0e = rgb(14, 14, 14)), not the light one.
  expect(fadeEnd).toContain('14, 14, 14')
  expect(fadeEnd).not.toContain('251, 251, 251')
})
