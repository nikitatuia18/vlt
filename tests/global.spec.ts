import { expect, test, type Page } from '@playwright/test'
import { FRAMES, pinTimelines, routeSource, routeTarget, routeTimelines } from '../src/components/blocks/Global/timeline'

const viewports = [
  { name: 'mobile-393', width: 393, height: 850 },
  { name: 'tablet-768', width: 768, height: 1000 },
  { name: 'tablet-1024', width: 1024, height: 800 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'desktop-2560', width: 2560, height: 1200 },
]

// Ids are listed here (not imported): the data module imports SVG files, which the test runner cannot load.
const pinIds = ['ca', 'us', 'eu', 'ge', 'in', 'br', 'cl', 'kg', 'ar']
const routeIds = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const canvas = (page: Page) => page.locator('[data-el="global__globe"] canvas')

/** Opens the page and scrolls the pinned section to `progress` (0 = just pinned, 1 = about to unpin; negative = still coming in). */
const open = async (page: Page, width: number, height: number, progress = 0.97) => {
  await page.setViewportSize({ width, height })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await scrollTo(page, progress)
}

const scrollTo = async (page: Page, progress: number) => {
  await page.evaluate((fraction) => {
    const section = document.querySelector('[data-el="global"]') as HTMLElement
    const top = section.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, fraction < 0 ? top + fraction * window.innerHeight : top + fraction * (section.offsetHeight - window.innerHeight))
  }, progress)
  await page.waitForTimeout(1800)
}

const globe = (page: Page) =>
  canvas(page).evaluate((element) => ({
    radius: Number(element.dataset.radius),
    x: Number(element.dataset.centerX),
    y: Number(element.dataset.centerY),
    cards: element.dataset.cards,
  }))

for (const viewport of viewports) {
  test(`global screenshot ${viewport.name}`, async ({ page }) => {
    await open(page, viewport.width, viewport.height)
    await page.waitForTimeout(1500)
    await page.screenshot({ path: `tests/artifacts/global-${viewport.name}.png` })
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
  await expect(page.locator('[data-el="global__stage"]')).toHaveCount(1)
  await expect(page.locator('[data-el="global__globe-slot"]')).toHaveCount(1)
  await expect(canvas(page)).toHaveCount(1)
  await expect(page.locator('[data-el^="global__pin-"][data-el$="-label"]')).toHaveCount(pinIds.length)
})

test('scene: big globe without text, then it flies to its place, then text and cards appear', async ({ page }) => {
  await open(page, 1440, 900, 0.05)
  const big = await globe(page)
  // Big: as wide as the page container (a bit less at the very start of the pin, the smoothstep has begun), in the middle, no text, no cards.
  const container = (await page.locator('[data-el="global__content"]').boundingBox())!
  expect(big.radius).toBeLessThanOrEqual(container.width / 2 + 2)
  expect(big.radius).toBeGreaterThan(container.width * 0.45)
  expect(Math.abs(big.x - 720)).toBeLessThan(15)
  expect(big.cards).toBe('off')

  // On the way it shrinks steadily, without a pause at the top.
  const radii = [big.radius]
  for (const progress of [0.3, 0.6]) {
    await scrollTo(page, progress)
    radii.push((await globe(page)).radius)
  }
  expect(radii[1]).toBeLessThan(radii[0] - 20)
  expect(radii[2]).toBeLessThan(radii[1] - 20)

  await scrollTo(page, 0.97)
  const final = await globe(page)
  const slot = (await page.locator('[data-el="global__globe-slot"]').boundingBox())!
  expect(final.radius).toBeLessThan(big.radius / 1.5)
  expect(Math.abs(final.radius - Math.min(slot.width, slot.height) / 2)).toBeLessThan(2)
  expect(final.cards).toBe('on')
  expect(Number(await page.locator('[data-el="global__message"]').evaluate((el) => getComputedStyle(el).opacity))).toBe(1)
})

test('global in wide layout: globe on the left, metrics under it, message on the right', async ({ page }) => {
  await open(page, 1440, 900)
  const slot = (await page.locator('[data-el="global__globe-slot"]').boundingBox())!
  const metrics = (await page.locator('[data-el="global__metrics"]').boundingBox())!
  const message = (await page.locator('[data-el="global__message"]').boundingBox())!
  expect(slot.x + slot.width).toBeLessThanOrEqual(message.x + 1)
  expect(metrics.y).toBeGreaterThanOrEqual(slot.y + slot.height - 1)
  // The globe stands right above the numbers (a few px apart), not hanging at the top of the screen.
  expect(metrics.y - (slot.y + slot.height)).toBeLessThan(24)
  expect(metrics.x + metrics.width).toBeLessThanOrEqual(message.x + 1)
  expect(Math.abs(metrics.y + metrics.height - (message.y + message.height))).toBeLessThan(2)
})

test('global in stacked layout: globe above the text, all of it on the screen', async ({ page }) => {
  await open(page, 393, 850)
  const slot = (await page.locator('[data-el="global__globe-slot"]').boundingBox())!
  const message = (await page.locator('[data-el="global__message"]').boundingBox())!
  const metrics = (await page.locator('[data-el="global__metrics"]').boundingBox())!
  expect(slot.y + slot.height).toBeLessThanOrEqual(message.y + 1)
  expect(slot.height).toBeGreaterThan(200)
  expect(metrics.y + metrics.height).toBeLessThanOrEqual(850)
})

test('on a phone: the card of a country is a round flag (not squeezed), the text is close to the heading', async ({ page }) => {
  await open(page, 393, 850)
  // offsetWidth / offsetHeight ignore the scale the globe loop puts on the card.
  const sizes = await page.locator('[data-el="global__pin-ge"]').evaluate((el) => ({
    width: (el as HTMLElement).offsetWidth,
    height: (el as HTMLElement).offsetHeight,
    flag: (el.querySelector('img') as HTMLImageElement).offsetWidth,
  }))
  expect(sizes.flag).toBe(44)
  expect(Math.abs(sizes.width - sizes.height)).toBeLessThan(2)

  const title = (await page.locator('[data-el="global__title"]').boundingBox())!
  const desc = (await page.locator('[data-el="global__desc"]').boundingBox())!
  expect(desc.y - (title.y + title.height)).toBeLessThanOrEqual(20)
})

test('cards come and go over time while the globe turns', async ({ page }) => {
  await open(page, 1440, 900)
  // Sample all cards every 300 ms for 5 s: a card must change a lot (the timeline plays and the turn changes who is seen).
  const samples = await page.evaluate(
    () =>
      new Promise<number[][]>((resolve) => {
        const cards = Array.from(document.querySelectorAll('[data-el^="global__pin-"]:not([data-el$="-label"]):not([data-el$="-desc"])'))
        const found: number[][] = []
        const timer = setInterval(() => {
          found.push(cards.map((card) => Number(getComputedStyle(card.parentElement!).opacity)))
          if (found.length >= 17) {
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

test('the globe can be grabbed only on the globe itself', async ({ page }) => {
  await open(page, 1440, 900)
  const { x, y, radius } = await globe(page)
  await page.mouse.move(x, y)
  await expect(canvas(page)).toHaveCSS('cursor', 'grab')
  await page.mouse.move(x + radius * 1.3, y)
  await expect(canvas(page)).toHaveCSS('cursor', 'auto')
})

test('dark theme: the dots and the card follow the tokens', async ({ page }) => {
  await open(page, 1440, 900)
  await page.locator('[data-el="header"] [data-el="header__theme-toggle"]').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await scrollTo(page, 0.97)
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'tests/artifacts/global-desktop-1440-dark.png' })
  // The dots take the light color of the dark theme: the page is dark, the dots are lighter than it.
  const [dot, page_] = await page.evaluate(() => {
    const probe = document.querySelector('[data-el="global__globe"] span.text-surface-dots') as HTMLElement
    return [getComputedStyle(probe).color, getComputedStyle(document.body).backgroundColor]
  })
  expect(dot).not.toBe(page_)
})

test('every line flies from a country with a card to a different country, and never outlives the card', () => {
  const frame = (fraction: number) => fraction * FRAMES
  for (const id of routeIds) {
    const route = routeTimelines[id]
    const card = pinTimelines[routeSource[id]]
    expect(pinIds, `route ${id} source`).toContain(routeSource[id])
    expect(pinIds, `route ${id} target`).toContain(routeTarget[id])
    expect(routeTarget[id], `route ${id} goes somewhere else`).not.toBe(routeSource[id])
    const cardShown = frame(card.opacity.times[1])
    const cardGone = frame(card.opacity.times[4])
    const drawStart = frame(route.draw.times[1])
    const lineGone = frame(route.opacity.times[2])
    expect(drawStart, `route ${id} starts drawing`).toBeGreaterThanOrEqual(cardShown)
    // The line may fade out up to 6 frames (0.1 s) after the card.
    expect(lineGone, `route ${id} fades out`).toBeLessThanOrEqual(cardGone + 6)
    // Nothing is left at the end of the loop.
    expect(route.opacity.values.at(-1)).toBe(0)
  }
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('no pinned scene: a still picture with the timeline frozen on a frame with three cards', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await page.locator('[data-el="global"]').scrollIntoViewIfNeeded()
    await page.waitForTimeout(800)
    await expect(page.locator('[data-el="global__stage"]')).toHaveCSS('position', 'relative')
    const { radius, cards } = await globe(page)
    const slot = (await page.locator('[data-el="global__globe-slot"]').boundingBox())!
    expect(Math.abs(radius - slot.width / 2)).toBeLessThan(2)
    expect(cards).toBe('on')
    const opacity = (id: string) => page.locator(`[data-el="global__pin-${id}"]`).evaluate((el) => Number(getComputedStyle(el.parentElement!).opacity))
    // The timeline stands at a frozen frame with EU, Chile and Argentina on; Europe faces us, Georgia is not on yet.
    expect(await opacity('eu')).toBe(1)
    expect(await opacity('ge')).toBe(0)
    await page.locator('[data-el="global__stage"]').screenshot({ path: 'tests/artifacts/global-reduced-1440.png' })
  })
})

// Spacing: the text stands as far from the lower edge of the block as the globe from the upper one (the rhythm of the other blocks),
// not 48 px from the edge of the screen.
test('global spacing: room under the text, the same room above the globe', async ({ page }) => {
  await open(page, 1440, 900)
  const stage = (await page.locator('[data-el="global__stage"]').boundingBox())!
  const slot = (await page.locator('[data-el="global__globe-slot"]').boundingBox())!
  const metrics = (await page.locator('[data-el="global__metrics"]').boundingBox())!
  const message = (await page.locator('[data-el="global__message"]').boundingBox())!
  const below = stage.y + stage.height - Math.max(metrics.y + metrics.height, message.y + message.height)
  const above = slot.y - stage.y
  expect(below).toBeGreaterThanOrEqual(100)
  expect(Math.abs(below - above)).toBeLessThan(3)
  // The globe is still big enough to be the hero of the block.
  expect(slot.width).toBeGreaterThan(480)
})

test('global spacing on a tall screen reaches the 140 px of the other blocks', async ({ page }) => {
  await open(page, 1920, 1200)
  const stage = (await page.locator('[data-el="global__stage"]').boundingBox())!
  const message = (await page.locator('[data-el="global__message"]').boundingBox())!
  expect(stage.y + stage.height - (message.y + message.height)).toBeGreaterThanOrEqual(139)
})

// The big scene plays once: after the block has gone up out of the screen it is a plain block with the globe in its place.
const sectionRect = (page: Page) =>
  page.locator('[data-el="global"]').evaluate((el) => {
    const rect = el.getBoundingClientRect()
    return { top: rect.top + window.scrollY, height: rect.height }
  })

test('the big globe plays once: scrolling back up shows the finished block, and the page does not jump while it settles', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

  // Through the scene, to the very end of the pinned scroll.
  const tall = await sectionRect(page)
  await page.evaluate((y) => window.scrollTo(0, y), tall.top + tall.height - 900 - 10)
  await page.waitForTimeout(1200)
  await expect(page.locator('[data-el="global__stage"]')).toHaveCSS('position', 'sticky')
  const before = await globe(page)
  expect(before.cards).toBe('on')

  // A marker below the block: where it stands on the screen while the block is still on the screen, and after it has settled.
  const markerTop = () => page.locator('[data-el="next-steps"]').evaluate((el) => el.getBoundingClientRect().top)
  const markerBefore = await markerTop()
  const step = 1200 // leaves the block behind (it is 900 + 150vh tall; the end is 10 px below the screen bottom)
  await page.evaluate((delta) => window.scrollBy(0, delta), step)
  await page.waitForTimeout(1200)
  await expect(page.locator('[data-el="global__stage"]')).toHaveCSS('position', 'relative')
  // The marker moved up by exactly the scroll we made: the collapse of the block did not shift the page.
  expect(Math.abs(markerBefore - step - (await markerTop()))).toBeLessThan(3)

  // Back up into the block: no big globe, no pinning; the globe stands in its place, the text is there, the block is one screen tall.
  const plain = await sectionRect(page)
  expect(plain.height).toBeLessThan(900 * 1.1)
  await page.evaluate((y) => window.scrollTo(0, y), plain.top)
  await page.waitForTimeout(1200)
  const slot = (await page.locator('[data-el="global__globe-slot"]').boundingBox())!
  const settled = await globe(page)
  expect(Math.abs(settled.radius - Math.min(slot.width, slot.height) / 2)).toBeLessThan(2)
  expect(settled.cards).toBe('on')
  await expect(page.locator('[data-el="global__title"]')).toBeVisible()
  // Scrolled a bit more up: still the same finished globe (nothing flies in).
  await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, plain.top - 300))
  await page.waitForTimeout(800)
  expect(Math.abs((await globe(page)).radius - settled.radius)).toBeLessThan(2)
})

test('after a reload the big globe plays again', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const tall = await sectionRect(page)
  await page.evaluate((y) => window.scrollTo(0, y), tall.top + tall.height + 200)
  await page.waitForTimeout(1000)
  await page.reload()
  await page.evaluate(() => document.fonts.ready)
  await scrollTo(page, 0.05)
  expect((await globe(page)).radius).toBeGreaterThan(550)
})

test('a hard wheel flick through the end of the block does not make the page jump (the smooth scroll is kept in step)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const tall = await sectionRect(page)
  await page.evaluate((y) => window.scrollTo(0, y), tall.top + tall.height - 900 - 900)
  await page.waitForTimeout(1500)
  await page.evaluate(() => {
    const w = window as unknown as { __tops: number[] }
    w.__tops = []
    const marker = document.querySelector('[data-el="next-steps"]') as HTMLElement
    const tick = () => {
      w.__tops.push(marker.getBoundingClientRect().top)
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  await page.mouse.move(700, 450)
  await page.mouse.wheel(0, 2400)
  await page.waitForTimeout(2500)
  const jumps = await page.evaluate(() => {
    const tops = (window as unknown as { __tops: number[] }).__tops
    return tops.slice(1).map((top, index) => Math.abs(top - tops[index]))
  })
  expect(Math.max(...jumps)).toBeLessThan(700)
  // The block settled meanwhile (the flick took it up out of the screen).
  await expect(page.locator('[data-el="global__stage"]')).toHaveCSS('position', 'relative')
})
