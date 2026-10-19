import { expect, test, type Page } from '@playwright/test'

const viewports = [
  { name: 'mobile-393', width: 393, height: 850 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 800 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-2560', width: 2560, height: 1200 },
]

const ids = ['industry-first', 'ecommerce', 'startups', 'luxury-automotive', 'real-estate', 'export-import', 'operations-payroll']
const titles = ['Industry-first scenarios', 'E-commerce', 'Startups', 'Luxury goods and Automotive', 'Real estate', 'Export/Import', 'Operations and payroll']

const section = (page: Page) => page.locator('[data-el="industries"]')
const item = (page: Page, id: string) => page.locator(`[data-el="industries__item-${id}"]`)
const box = async (page: Page, selector: string) => (await page.locator(selector).boundingBox())!

// Scrolls through the pinned section: 0 = it has just been pinned, 1 = it is about to be released. Waits for the list to settle.
const scrollToProgress = async (page: Page, progress: number) => {
  await page.evaluate((fraction) => {
    const element = document.querySelector('[data-el="industries"]')!
    const top = element.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, top + fraction * (element.getBoundingClientRect().height - window.innerHeight))
  }, progress)
  await page.waitForTimeout(1600)
}

const activeId = (page: Page) =>
  section(page).locator('li[data-active="true"]').evaluate((el) => el.getAttribute('data-el')!.replace('industries__item-', ''))

for (const viewport of viewports) {
  test(`industries screenshot ${viewport.name} (Startups open)`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await scrollToProgress(page, 0.3)
    await page.screenshot({ path: `tests/artifacts/industries-${viewport.name}.png` })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBe(0)
  })
}

test('texts: the title and the seven items (the typo "E-comersce" of the design is fixed)', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 2, name: 'From first payment to final payout.' })).toBeAttached()
  for (let i = 0; i < ids.length; i++) {
    await expect(page.locator(`[data-el="industries__item-${ids[i]}-title"]`)).toHaveText(titles[i])
  }
  await expect(page.locator('[data-el="industries__item-startups-desc"]')).toHaveText(
    'Let your clients pay in crypto, and receive fiat.Forget about chargebacks',
  )
  await expect(page.locator('[data-el="industries__item-startups-cta"]')).toHaveText('Book a demo')
})

test('the section is pinned: it is 100vh + 6 x 60vh tall and the stage stays at the top of the screen while you scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  expect((await section(page).boundingBox())!.height).toBeCloseTo(900 + 6 * 0.6 * 900, 0)
  for (const progress of [0.05, 0.4, 0.9]) {
    await scrollToProgress(page, progress)
    expect((await box(page, '[data-el="industries__stage"]')).y).toBeCloseTo(0, 0)
  }
})

test('scrolling opens the items one after another, in the order of the list', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const steps: [number, string][] = [
    [0.01, 'industry-first'],
    [0.2, 'ecommerce'],
    [0.4, 'startups'],
    [0.5, 'luxury-automotive'],
    [0.7, 'real-estate'],
    [0.8, 'export-import'],
    [0.99, 'operations-payroll'],
  ]
  for (const [progress, expected] of steps) {
    await scrollToProgress(page, progress)
    expect(await activeId(page), `at ${progress}`).toBe(expected)
    await expect(section(page).locator('li[data-active="true"]')).toHaveCount(1)
  }
  // And back up: the first item opens again.
  await scrollToProgress(page, 0.01)
  expect(await activeId(page)).toBe('industry-first')
})

test('the title stays in place and the open item stands opposite it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await scrollToProgress(page, 0.05)
  const titleY = (await box(page, '[data-el="industries__title"]')).y
  for (const [progress, id] of [[0.05, 'industry-first'], [0.4, 'startups'], [0.7, 'real-estate'], [0.99, 'operations-payroll']] as const) {
    await scrollToProgress(page, progress)
    expect((await box(page, '[data-el="industries__title"]')).y).toBeCloseTo(titleY, 0)
    const region = await box(page, '[data-el="industries__list-region"]')
    const open = (await item(page, id).boundingBox())!
    expect(Math.abs(open.y + open.height / 2 - (region.y + region.height / 2)), `item ${id}`).toBeLessThan(3)
  }
})

test('the open item is a white card (radius 32, padding 60 x 40) and the description unfolds; closed items are grey and folded', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await scrollToProgress(page, 0.4) // Startups
  const inner = page.locator('[data-el="industries__item-startups-inner"]')
  const style = await inner.evaluate((el) => {
    const cs = getComputedStyle(el)
    return { radius: cs.borderTopLeftRadius, background: cs.backgroundColor, paddingX: cs.paddingLeft, paddingY: cs.paddingTop }
  })
  expect(style).toEqual({ radius: '32px', background: 'rgb(255, 255, 255)', paddingX: '60px', paddingY: '40px' })
  const details = page.locator('[data-el="industries__item-startups-details"]')
  await expect(details).toHaveAttribute('aria-hidden', 'false')
  expect((await details.boundingBox())!.height).toBeGreaterThan(100)
  const color = (id: string) => page.locator(`[data-el="industries__item-${id}-title"]`).evaluate((el) => getComputedStyle(el).color)
  expect(await color('startups')).toBe('rgb(24, 24, 24)') // typography-primary
  expect(await color('real-estate')).not.toBe('rgb(24, 24, 24)') // typography-tertiary (grey)

  await scrollToProgress(page, 0.8) // Export/Import is open, Startups is closed again
  await expect(details).toHaveAttribute('aria-hidden', 'true')
  expect((await details.boundingBox())!.height).toBeLessThan(2)
  await expect(page.locator('[data-el="industries__item-startups-cta"]')).toHaveAttribute('tabindex', '-1')
  expect((await inner.evaluate((el) => getComputedStyle(el).paddingLeft))).toBe('0px')
})

test('desktop layout: title on the left at 64 px, the list on the right, items are single lines', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1200 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await scrollToProgress(page, 0.4)
  const title = page.locator('[data-el="industries__title"]')
  expect(await title.evaluate((el) => getComputedStyle(el).fontSize)).toBe('64px')
  const list = await box(page, '[data-el="industries__list-region"]')
  const header = await box(page, '[data-el="industries__header"]')
  expect(header.x + header.width).toBeLessThanOrEqual(list.x) // the title is left of the list
  // 60 px between the title area and the list.
  expect(list.x - (header.x + header.width)).toBeCloseTo(60, 0)
  for (const id of ids) {
    const titleBox = (await page.locator(`[data-el="industries__item-${id}-title"]`).boundingBox())!
    expect(titleBox.height, id).toBeCloseTo(72, 0) // one line of 72
  }
})

test('mobile: title above the list, smaller type, nothing sticks out', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 850 })
  await page.goto('/')
  await scrollToProgress(page, 0.4)
  const title = await box(page, '[data-el="industries__title"]')
  const region = await box(page, '[data-el="industries__list-region"]')
  expect(title.y + title.height).toBeLessThanOrEqual(region.y + 1)
  expect(await page.locator('[data-el="industries__title"]').evaluate((el) => getComputedStyle(el).fontSize)).toBe('32px')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBe(0)
})

test('reduced motion: a plain static block with Startups open, no pinning, no sliding', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  expect((await section(page).boundingBox())!.height).toBeLessThan(1700)
  expect(await page.locator('[data-el="industries__stage"]').evaluate((el) => getComputedStyle(el).position)).toBe('static')
  expect(await activeId(page)).toBe('startups')
  await expect(page.locator('[data-el="industries__item-startups-details"]')).toHaveAttribute('aria-hidden', 'false')
  const transform = await page.locator('[data-el="industries__list"]').evaluate((el) => (el as HTMLElement).style.transform)
  expect(transform).toBe('')
  // Scrolling changes nothing.
  await scrollToProgress(page, 0.8)
  expect(await activeId(page)).toBe('startups')
})

test('the section follows the features block', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const features = await box(page, '[data-el="features"]')
  expect((await section(page).boundingBox())!.y).toBeCloseTo(features.y + features.height, 0)
})

test('dark theme: the open card is dark and its title is white', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.locator('[data-el="header"] [data-el="header__theme-toggle"]').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await scrollToProgress(page, 0.4)
  await expect(page.locator('[data-el="industries__item-startups-inner"]')).toHaveCSS('background-color', 'rgb(24, 24, 24)')
  await expect(page.locator('[data-el="industries__item-startups-title"]')).toHaveCSS('color', 'rgb(255, 255, 255)')
  await page.screenshot({ path: 'tests/artifacts/industries-desktop-1440-dark.png' })
})
