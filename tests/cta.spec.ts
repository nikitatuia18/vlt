import { expect, test, type Page } from '@playwright/test'

const viewports = [
  { name: 'mobile-393', width: 393, height: 850 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 800 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-2560', width: 2560, height: 1200 },
]

const box = async (page: Page, selector: string) => (await page.locator(selector).boundingBox())!
const near = (actual: number, expected: number, tolerance: number, what: string) =>
  expect(Math.abs(actual - expected), `${what}: ${actual} vs ${expected}`).toBeLessThanOrEqual(tolerance)

const open = async (page: Page, width: number, height: number) => {
  await page.setViewportSize({ width, height })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await page.locator('[data-el="cta"]').evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(600)
}

for (const viewport of viewports) {
  test(`cta screenshot ${viewport.name}`, async ({ page }) => {
    await open(page, viewport.width, viewport.height)
    await page.locator('[data-el="cta"]').screenshot({ path: `tests/artifacts/cta-${viewport.name}.png` })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBe(0)
  })
}

test('texts and the button of the design', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 2, name: "Tell us what you're building." })).toBeAttached()
  await expect(page.locator('[data-el="cta__subtitle"]')).toHaveText("We'll map your payment flow and show you how Velant can handle it.")
  await expect(page.locator('[data-el="cta__badge-payments-label"]')).toHaveText('Pay-in / Pay-out')
  await expect(page.locator('[data-el="cta__badge-multi-currency-label"]')).toHaveText('Multi-currency')
  await expect(page.locator('[data-el="cta__badge-kyb-label"]')).toHaveText('Instant KYB')
  const button = page.locator('[data-el="cta__cta-primary"]')
  await expect(button).toHaveText('Book a demo')
  await expect(button).toHaveAttribute('href', '/book-a-demo')
})

test('desktop frame (2560): banner 496 px high, radius 60, padding 60; picture and badges where the design has them', async ({ page }) => {
  await open(page, 2560, 1200)
  const banner = await box(page, '[data-el="cta__banner"]')
  near(banner.width, 1358, 2.5, 'banner width') // the column is drawn with a ring: 2 px wider than in Figma
  near(banner.height, 496, 1.5, 'banner height')
  const bannerStyle = await page.locator('[data-el="cta__banner"]').evaluate((el) => {
    const style = getComputedStyle(el)
    return { radius: style.borderTopLeftRadius, padding: style.paddingLeft, background: style.backgroundColor }
  })
  expect(bannerStyle.radius).toBe('60px')
  expect(bannerStyle.padding).toBe('60px')
  expect(bannerStyle.background).toBe('rgb(182, 59, 18)') // surface/brand-default
  expect(await page.locator('[data-el="cta__title"]').evaluate((el) => getComputedStyle(el).fontSize)).toBe('80px')

  // The person: 507 x 592, bottom on the lower edge of the banner, rising 96 px above its upper edge.
  const person = await box(page, '[data-el="img-cta-person"]')
  near(person.width, 507, 2, 'person width')
  near(person.height, 592, 2, 'person height')
  near(person.y + person.height, banner.y + banner.height, 1.5, 'person bottom')
  near(banner.y - person.y, 96, 2, 'person above the banner')
  near(person.x - banner.x, 747 - 41, 3, 'person x')

  // Badges: size and position (the design draws them in three sizes; the text style is the closest token, hence the tolerance).
  const badges = [
    // Pay-in / Pay-out is moved on purpose (the design has it at 748 / 303): there the scarf of the person covered the end of its label.
    { id: 'payments', width: 191.6, height: 53, x: 748 - 41 - 74, y: 303 - 140 - 46 },
    { id: 'multi-currency', width: 220.7, height: 64.3, x: 674 - 41, y: 482 - 140 },
    { id: 'kyb', width: 184.6, height: 61.9, x: 1155 - 41, y: 370 - 140 },
  ]
  for (const badge of badges) {
    const actual = await box(page, `[data-el="cta__badge-${badge.id}"]`)
    // Urbanist of the design is not in the font set; the substitute (Inter) is a little wider: up to 14 % in width.
    near(actual.width, badge.width, badge.width * 0.14, `${badge.id} width`)
    near(actual.height, badge.height, 4, `${badge.id} height`)
    near(actual.x - banner.x, badge.x, 3, `${badge.id} x`)
    near(actual.y - banner.y, badge.y, 3, `${badge.id} y`)
  }
  // A glass pill: blurred background, white text.
  const glass = await page.locator('[data-el="cta__badge-kyb"]').evaluate((el) => {
    const style = getComputedStyle(el)
    return { blur: style.backdropFilter, color: style.color }
  })
  expect(glass.blur).toContain('blur(8px)')
  expect(glass.color).toBe('rgb(255, 255, 255)')
})

test('the first badge is behind the person, the other two in front of it (the order of the design)', async ({ page }) => {
  await page.goto('/')
  const order = await page.evaluate(() => {
    const position = (selector: string) => {
      const element = document.querySelector(selector)!
      const person = document.querySelector('[data-el="img-cta-person"]')!
      return element.compareDocumentPosition(person) & Node.DOCUMENT_POSITION_FOLLOWING ? 'before' : 'after'
    }
    return [
      position('[data-el="cta__badge-payments"]'),
      position('[data-el="cta__badge-multi-currency"]'),
      position('[data-el="cta__badge-kyb"]'),
    ]
  })
  expect(order).toEqual(['before', 'after', 'after'])
})

test('the white button on the banner: 56 px high, dark text, white in both themes', async ({ page }) => {
  await open(page, 1440, 900)
  const button = page.locator('[data-el="cta__cta-primary"]')
  expect((await button.boundingBox())!.height).toBeCloseTo(56, 0)
  await expect(button).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(button).toHaveCSS('color', 'rgb(24, 24, 24)')
  await page.locator('[data-el="header"] [data-el="header__theme-toggle"]').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.locator('[data-el="cta"]').evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(600)
  await expect(button).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await page.locator('[data-el="cta"]').screenshot({ path: 'tests/artifacts/cta-desktop-1440-dark.png' })
})

test('the background is the dot grid of the UI Kit, faded by a radial mask', async ({ page }) => {
  await open(page, 1440, 900)
  await expect(page.locator('[data-el="cta__bg"] canvas')).toHaveCount(1)
  const mask = await page.locator('[data-el="cta__bg"]').evaluate((el) => getComputedStyle(el).maskImage)
  expect(mask).toContain('radial-gradient')
  // The canvas really draws dots (not an empty transparent surface).
  const drawn = await page.locator('[data-el="cta__bg"] canvas').evaluate((canvas) => {
    const element = canvas as HTMLCanvasElement
    const data = element.getContext('2d')!.getImageData(0, 0, element.width, element.height).data
    for (let index = 3; index < data.length; index += 4) if (data[index] > 0) return true
    return false
  })
  expect(drawn).toBe(true)
})

test('stacked layout (768): the picture stands under the text on the lower edge of the banner', async ({ page }) => {
  await open(page, 768, 900)
  const banner = await box(page, '[data-el="cta__banner"]')
  const person = await box(page, '[data-el="img-cta-person"]')
  const button = await box(page, '[data-el="cta__cta-primary"]')
  near(person.y + person.height, banner.y + banner.height, 1.5, 'person bottom')
  expect(person.y).toBeGreaterThanOrEqual(button.y + button.height - 1)
  expect(person.x).toBeGreaterThan(banner.x)
  expect(person.x + person.width).toBeLessThan(banner.x + banner.width)
})

test('the section follows the faq block, and its column goes on without a break', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const faq = await box(page, '[data-el="faq"]')
  near((await box(page, '[data-el="cta"]')).y, faq.y + faq.height, 0.5, 'cta follows faq')
  // No fade at the bottom of the faq (the column goes into the cta); the dots stay on the line.
  await expect(page.locator('[data-el="faq__deco-column-fade-bottom-left"]')).toHaveCount(0)
  await expect(page.locator('[data-el="faq__deco-corner-bl"]')).toHaveCount(1)
})
