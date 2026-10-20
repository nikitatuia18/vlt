import { expect, test, type Page } from '@playwright/test'

// These tests switch the appearance animations ON (the rest of the suite runs with them off, see playwright.config.ts).
test.use({ storageState: { cookies: [], origins: [] } })

const opacityOf = (page: Page, selector: string) =>
  page.locator(selector).first().evaluate((element) => Number(getComputedStyle(element).opacity))

const scrollToSection = async (page: Page, name: string, fraction = 0) => {
  await page.evaluate(
    ({ name, fraction }) => {
      const element = document.querySelector(`[data-el="${name}"]`) as HTMLElement
      const top = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo(0, top + fraction * (element.offsetHeight - window.innerHeight))
    },
    { name, fraction },
  )
}

/** Vertical shift of the first line of a heading (px): positive while the line is still below its mask. */
const lineShift = (page: Page, heading: string) =>
  page
    .locator(`[data-el="${heading}"] > span > span`)
    .first()
    .evaluate((line) => new DOMMatrix(getComputedStyle(line).transform).m42)

test('page load: the header comes down, the hero plays in turn and everything stands in place at the end', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.waitForTimeout(150)
  // At the start: the header is above the screen, the media card and the buttons are not there yet.
  expect((await page.locator('[data-el="header"]').boundingBox())!.y).toBeLessThan(-5)
  expect(await opacityOf(page, '[data-el="hero__media"]')).toBeLessThan(0.05)
  // (the button is inside a box that appears)
  expect(await page.locator('[data-el="hero__cta-primary"]').locator('..').evaluate((el) => Number(getComputedStyle(el).opacity))).toBeLessThan(0.05)

  await page.waitForTimeout(4500)
  expect((await page.locator('[data-el="header"]').boundingBox())!.y).toBeCloseTo(0, 0)
  expect(await lineShift(page, 'hero__title')).toBeCloseTo(0, 1)
  for (const name of ['hero__subtitle', 'hero__cta-primary', 'hero__cta-secondary', 'hero__media', 'header__logo']) {
    expect(await opacityOf(page, `[data-el="${name}"]`), name).toBe(1)
  }
  // The blur is gone and the filter removed, so the text is not left on a layer of its own.
  expect(await page.locator('[data-el="hero__subtitle"]').evaluate((el) => getComputedStyle(el).filter)).toBe('none')
})

test('the title is still one readable heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-el="hero__title"]')).toHaveText('Banking for today. Clients pay their way. You settle yours.')
  await expect(page.locator('h1')).toHaveCount(1)
})

test('below the fold: waits until it comes into view, plays once, does not hide again', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.waitForTimeout(500)
  // Not in view yet: hidden.
  expect(await opacityOf(page, '[data-el="features__card-crypto"]')).toBe(0)
  expect(await lineShift(page, 'features__title')).toBeGreaterThan(10)

  await scrollToSection(page, 'features')
  await page.waitForTimeout(2800)
  expect(await opacityOf(page, '[data-el="features__card-crypto"]')).toBe(1)
  expect(await lineShift(page, 'features__title')).toBeCloseTo(0, 1)

  // Scroll far away and back: it stays.
  await scrollToSection(page, 'faq')
  await page.waitForTimeout(800)
  await scrollToSection(page, 'features')
  await page.waitForTimeout(500)
  expect(await opacityOf(page, '[data-el="features__card-crypto"]')).toBe(1)
})

test('global: the text waits for the globe, then the figures count up', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await scrollToSection(page, 'global', 0.2)
  await page.waitForTimeout(1500)
  expect(await lineShift(page, 'global__title')).toBeGreaterThan(10)
  expect(await opacityOf(page, '[data-el="global__desc"]')).toBe(0)

  await scrollToSection(page, 'global', 0.7)
  await page.waitForTimeout(3500)
  expect(await lineShift(page, 'global__title')).toBeCloseTo(0, 1)
  expect(await opacityOf(page, '[data-el="global__desc"]')).toBe(1)
  const counted = (metric: string) => page.locator(`[data-el="global__metric-${metric}-value"] > span > span[aria-hidden="true"]:not(.invisible)`)
  await expect(counted('uptime')).toHaveText('99.9%')
  await expect(counted('rails')).toHaveText('15+')
  await expect(counted('latency')).toHaveText('<1 sec')
  // The figure keeps its place (the invisible copy has the final width).
  expect((await page.locator('[data-el="global__metric-uptime-value"]').boundingBox())!.width).toBeGreaterThan(100)
})

test('cta: the banner opens, the person rises, the badges jump out and the end state is clean', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.waitForTimeout(300)
  expect(await opacityOf(page, '[data-el="cta__banner"]')).toBe(0)
  await scrollToSection(page, 'cta')
  await page.waitForTimeout(4500)
  expect(await opacityOf(page, '[data-el="cta__banner"]')).toBe(1)
  expect(await page.locator('[data-el="cta__banner"]').evaluate((el) => getComputedStyle(el).clipPath)).toBe('none')
  expect(await opacityOf(page, '[data-el="img-cta-person"]')).toBe(1)
  for (const id of ['payments', 'multi-currency', 'kyb']) {
    // The badge itself is always visible; its box (a point) plays the jump-out.
    const outer = page.locator(`[data-el="cta__badge-${id}"]`).locator('..')
    expect(await outer.evaluate((el) => Number(getComputedStyle(el).opacity)), id).toBe(1)
  }
  // The badges keep their own scale of the design after the jump-out.
  const scale = await page.locator('[data-el="cta__badge-payments"]').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a)
  expect(scale).toBeGreaterThan(0.3)
  expect(scale).toBeLessThanOrEqual(1.01)
})

test('faq: the questions come one after another and the dividers draw themselves', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await scrollToSection(page, 'faq')
  await page.waitForTimeout(3500)
  const items = page.locator('[data-el="faq__list"] > li')
  expect(await items.count()).toBe(5)
  for (let i = 0; i < 5; i++) expect(await items.nth(i).evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1)
  // Four dividers (the last question has none), all drawn to the full width.
  const dividers = page.locator('[data-el="faq__list"] > li > div.h-px')
  expect(await dividers.count()).toBe(4)
  for (let i = 0; i < 4; i++) {
    expect(await dividers.nth(i).evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a)).toBeCloseTo(1, 2)
  }
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('nothing is hidden and nothing moves: all at once, in the final state', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.waitForTimeout(150)
    expect((await page.locator('[data-el="header"]').boundingBox())!.y).toBeCloseTo(0, 0)
    for (const name of ['hero__media', 'hero__cta-primary', 'features__card-crypto', 'faq__title', 'cta__banner', 'footer__brand']) {
      expect(await opacityOf(page, `[data-el="${name}"]`), name).toBe(1)
    }
    // The heading is plain: no masks, no moving lines.
    await expect(page.locator('[data-el="hero__title"] > span > span')).toHaveCount(0)
    await expect(page.locator('[data-el="hero__title"]')).toBeVisible()
  })
})
