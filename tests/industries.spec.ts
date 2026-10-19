import { expect, test, type Page } from '@playwright/test'
import { industries } from '../src/components/blocks/Industries/items'

const viewports = [
  { name: 'mobile-393', width: 393, height: 850, gap: 32 },
  { name: 'tablet-768', width: 768, height: 900, gap: 40 },
  { name: 'tablet-1024', width: 1024, height: 800, gap: 40 },
  { name: 'desktop-1280', width: 1280, height: 800, gap: 48 },
  { name: 'desktop-1440', width: 1440, height: 900, gap: 48 },
  { name: 'desktop-2560', width: 2560, height: 1200, gap: 48 },
]

const ids = industries.map((item) => item.id)

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
    await scrollToProgress(page, 0.01)
    await page.screenshot({ path: `tests/artifacts/industries-${viewport.name}-start.png` })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBe(0)
  })
}

test('texts: the title, the seven items, a description and a "Book a demo" button for each (six texts are drafts)', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 2, name: 'From first payment to final payout.' })).toBeAttached()
  expect(industries.map((i) => i.title)).toEqual([
    'Industry-first scenarios', 'E-commerce', 'Startups', 'Luxury goods and Automotive', 'Real estate', 'Export/Import', 'Operations and payroll',
  ])
  for (const entry of industries) {
    await expect(page.locator(`[data-el="industries__item-${entry.id}-title"]`)).toHaveText(entry.title)
    await expect(page.locator(`[data-el="industries__item-${entry.id}-desc"]`)).toHaveText(entry.description.join(''))
    await expect(page.locator(`[data-el="industries__item-${entry.id}-cta"]`)).toHaveText('Book a demo')
    await expect(page.locator(`[data-el="industries__item-${entry.id}-cta"]`)).toHaveAttribute('href', '#book-a-demo')
  }
  // The text of the design is kept as it is.
  await expect(page.locator('[data-el="industries__item-startups-desc"]')).toHaveText(
    'Let your clients pay in crypto, and receive fiat.Forget about chargebacks',
  )
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

for (const viewport of viewports) {
  test(`the title does not move at all while scrolling (position and width) at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await scrollToProgress(page, 0.02)
    const reference = await box(page, '[data-el="industries__title"]')
    // Every item in turn becomes the open one (the widest, "Luxury goods and Automotive", used to push the title around).
    for (let index = 0; index < ids.length; index++) {
      await scrollToProgress(page, (index + 0.5) / ids.length)
      const current = await box(page, '[data-el="industries__title"]')
      expect({ x: current.x, y: current.y, width: current.width, height: current.height }, ids[index]).toEqual({
        x: reference.x,
        y: reference.y,
        width: reference.width,
        height: reference.height,
      })
    }
  })

  test(`the open item stands exactly in the middle of the screen, the first and the last one included, at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    for (const index of [0, 3, ids.length - 1]) {
      await scrollToProgress(page, (index + 0.5) / ids.length)
      const open = (await item(page, ids[index]).boundingBox())!
      expect(Math.abs(open.y + open.height / 2 - viewport.height / 2), ids[index]).toBeLessThan(3)
    }
  })
}

test('every one of the seven items is centered on the screen when it opens (1440 x 900), and the list follows smoothly', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  for (let index = 0; index < ids.length; index++) {
    await scrollToProgress(page, (index + 0.5) / ids.length)
    const open = (await item(page, ids[index]).boundingBox())!
    expect(Math.abs(open.y + open.height / 2 - 450), ids[index]).toBeLessThan(3)
    // The soft fade of the list must not touch the open card (its edges stay sharp).
    const region = await box(page, '[data-el="industries__list-region"]')
    const fade = await page.locator('[data-el="industries__list-region"]').evaluate((el) => ({
      top: parseFloat(el.style.getPropertyValue('--fade-top') || '0'),
      bottom: parseFloat(el.style.getPropertyValue('--fade-bottom') || '0'),
    }))
    expect(region.y + fade.top, `${ids[index]} top fade`).toBeLessThanOrEqual(open.y + 1)
    expect(region.y + region.height - fade.bottom, `${ids[index]} bottom fade`).toBeGreaterThanOrEqual(open.y + open.height - 1)
  }
  // Going back up keeps the centering too.
  await scrollToProgress(page, 0.5 / ids.length)
  const first = (await item(page, ids[0]).boundingBox())!
  expect(Math.abs(first.y + first.height / 2 - 450)).toBeLessThan(3)
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
  expect(await inner.evaluate((el) => getComputedStyle(el).paddingLeft)).toBe('0px')
})

test('desktop frame (2560): the title is centered above the list at 64 px, items are single lines', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1200 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await scrollToProgress(page, 0.4)
  const titleElement = page.locator('[data-el="industries__title"]')
  expect(await titleElement.evaluate((el) => getComputedStyle(el).fontSize)).toBe('64px')
  const title = await box(page, '[data-el="industries__title"]')
  expect(title.x + title.width / 2).toBeCloseTo(1280, 0) // centered on the screen
  const region = await box(page, '[data-el="industries__list-region"]')
  expect(title.y + title.height).toBeLessThanOrEqual(region.y)
  for (const id of ids) {
    const titleBox = (await page.locator(`[data-el="industries__item-${id}-title"]`).boundingBox())!
    expect(titleBox.height, id).toBeCloseTo(72, 0) // one line of 72
  }
})

test('mobile: smaller type, nothing sticks out sideways', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 850 })
  await page.goto('/')
  await scrollToProgress(page, 0.4)
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
