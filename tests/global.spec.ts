import { expect, test, type Page } from '@playwright/test'
import { FRAMES, pinTimelines, routeSource, routeTimelines } from '../src/components/blocks/Global/timeline'

const viewports = [
  { name: 'mobile-393', width: 393, height: 850 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 800 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'desktop-2560', width: 2560, height: 1200 },
]

// Ids are listed here (not imported): the data modules import SVG files, which the test runner cannot load.
const pinIds = ['ca', 'us', 'eu', 'ge', 'in', 'br', 'cl', 'kg', 'ar']
const routeIds = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const section = (page: Page) => page.locator('[data-el="global"]')

const open = async (page: Page, width: number, height: number) => {
  await page.setViewportSize({ width, height })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await section(page).scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
}

for (const viewport of viewports) {
  test(`global screenshot ${viewport.name}`, async ({ page }) => {
    await open(page, viewport.width, viewport.height)
    await section(page).screenshot({ path: `tests/artifacts/global-${viewport.name}.png` })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBe(0)
  })
}

test('global has the text, the numbers and the layers of the contract', async ({ page }) => {
  await open(page, 1440, 900)
  await expect(page.locator('[data-el="global__title"]')).toHaveText(/Go global without\s*rebuilding your\s*payments stack\./)
  await expect(page.locator('[data-el="global__desc"]')).toContainText('through one integration')
  await expect(page.locator('[data-el="global__metric-uptime-value"]')).toHaveText('99.9%')
  await expect(page.locator('[data-el="global__metric-rails-value"]')).toHaveText('15+')
  await expect(page.locator('[data-el="global__metric-latency-value"]')).toHaveText('<1 sec')
  // The signature dots are the lowest layer.
  await expect(page.locator('[data-el="global__bg"] canvas')).toHaveCount(1)
  await expect(page.locator('[data-el="global__map"]')).toHaveCount(1)
  await expect(page.locator('[data-el^="global__route-"]')).toHaveCount(routeIds.length)
  await expect(page.locator('[data-el^="global__pin-"][data-el$="-label"]')).toHaveCount(pinIds.length)
})

test('global in wide layout: map behind the text, metrics left, message right', async ({ page }) => {
  await open(page, 1920, 1080)
  const metrics = (await page.locator('[data-el="global__metrics"]').boundingBox())!
  const message = (await page.locator('[data-el="global__message"]').boundingBox())!
  const map = (await page.locator('[data-el="global__map"]').boundingBox())!
  expect(metrics.x).toBeLessThan(message.x)
  expect(Math.abs(metrics.y + metrics.height - (message.y + message.height))).toBeLessThan(2)
  // The map is wider than the text columns: it lies behind them.
  expect(map.width).toBeGreaterThan(metrics.width + message.width)
})

test('global in stacked layout: map above the text, no horizontal scroll', async ({ page }) => {
  await open(page, 1024, 800)
  const map = (await page.locator('[data-el="global__map"]').boundingBox())!
  const message = (await page.locator('[data-el="global__message"]').boundingBox())!
  expect(map.y + map.height).toBeLessThanOrEqual(message.y + 1)
  expect(map.x).toBeGreaterThanOrEqual(-1)
  expect(map.x + map.width).toBeLessThanOrEqual(1025)
})

test('global map is animated: cards and routes change over time', async ({ page }) => {
  await open(page, 1440, 900)
  // Sample all cards every 300 ms for 4.5 s (the start of the loop depends on how fast the page loaded, so one pair of
  // moments could fall in a pause of one card): at least one card must change a lot, and the cards are not all the same.
  const samples = await page.evaluate(
    () =>
      new Promise<number[][]>((resolve) => {
        const cards = Array.from(document.querySelectorAll('[data-el^="global__pin-"]:not([data-el$="-label"]):not([data-el$="-desc"])'))
        const found: number[][] = []
        const timer = setInterval(() => {
          found.push(cards.map((card) => Number(getComputedStyle(card).opacity)))
          if (found.length >= 15) {
            clearInterval(timer)
            resolve(found)
          }
        }, 300)
      }),
  )
  const spans = samples[0].map((_, card) => {
    const values = samples.map((sample) => sample[card])
    return Math.max(...values) - Math.min(...values)
  })
  expect(Math.max(...spans)).toBeGreaterThan(0.5)
})

test('a card grows while it appears, and a route drawn from its far end keeps dash length and offset in step', async ({ page }) => {
  await open(page, 1440, 900)
  await page.waitForFunction(
    () => Number(getComputedStyle(document.querySelector('[data-el="global__pin-us"]')!).opacity) > 0.02,
    undefined,
    { polling: 16, timeout: 30000 },
  )
  // The USD card has just started to appear: it is still smaller than its final size.
  const scale = await page.locator('[data-el="global__pin-us"]').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a)
  expect(scale).toBeLessThan(0.95)
  // Route 2 grows from its far end: the offset is always (length - 1), so the drawn part ends at the end of the path.
  await page.waitForTimeout(700)
  const route = await page.locator('[data-el="global__route-2"] mask path').evaluate((el) => {
    const style = getComputedStyle(el)
    return { dash: parseFloat(style.strokeDasharray), offset: parseFloat(style.strokeDashoffset) }
  })
  expect(route.dash).toBeGreaterThan(0)
  expect(route.dash).toBeLessThan(1)
  expect(route.offset).toBeCloseTo(route.dash - 1, 1)
})

test('a line never outlives the card it flies out of, and starts only after the card has begun to appear', () => {
  const frame = (fraction: number) => fraction * FRAMES
  for (const id of routeIds) {
    const route = routeTimelines[id]
    const card = pinTimelines[routeSource[id]]
    const cardShown = frame(card.opacity.times[1])
    const cardGone = frame(card.opacity.times[4])
    const drawStart = frame(route.draw.times[1])
    const lineGone = frame(route.opacity.times[2])
    expect(drawStart, `route ${id} starts drawing`).toBeGreaterThanOrEqual(cardShown)
    // The line may fade out up to 6 frames (0.1 s) after the card.
    expect(lineGone, `route ${id} fades out`).toBeLessThanOrEqual(cardGone + 6)
    // Nothing is left on the map at the end of the loop.
    expect(route.opacity.values.at(-1)).toBe(0)
  }
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('everything stands still in the final state: all cards and routes visible', async ({ page }) => {
    await open(page, 1440, 900)
    for (const id of pinIds) {
      expect(await page.locator(`[data-el="global__pin-${id}"]`).evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1)
    }
    for (const id of routeIds) {
      expect(await page.locator(`[data-el="global__route-${id}"]`).evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1)
    }
  })
})

