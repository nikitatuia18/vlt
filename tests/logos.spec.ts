import { expect, test, type Page } from '@playwright/test'

const viewports = [
  { name: 'mobile-393', width: 393, height: 900 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 900 },
  { name: 'desktop-1280', width: 1280, height: 900 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-2560', width: 2560, height: 1000 },
]

// Every tile (not its inner icon slot).
const tiles = (page: Page) => page.locator('[data-el^="logos__item-"]:not([data-el$="-icon"])')
const section = (page: Page) => page.locator('[data-el="logos"]')

for (const viewport of viewports) {
  test(`logos screenshot ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')
    await section(page).scrollIntoViewIfNeeded()
    await expect(tiles(page).first()).toBeVisible()
    await page.waitForTimeout(300)
    await section(page).screenshot({ path: `tests/artifacts/logos-${viewport.name}.png` })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBe(0)
  })
}

test('desktop frame: section is 140 + 150 + 140 = 430 px high and starts where the hero ends', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1000 })
  await page.goto('/')
  const hero = await page.locator('[data-el="hero"]').boundingBox()
  const logos = await section(page).boundingBox()
  expect(logos?.height).toBeCloseTo(430, 0)
  expect(logos!.y).toBeCloseTo(hero!.y + hero!.height, 0)
})

test('tiles are 80 px round circles in the surface-subtle color with the subtle ring', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const first = tiles(page).first()
  const box = await first.boundingBox()
  expect(box?.width).toBeCloseTo(80, 0)
  expect(box?.height).toBeCloseTo(80, 0)
  const style = await first.evaluate((el) => {
    const cs = getComputedStyle(el)
    return { radius: cs.borderTopLeftRadius, background: cs.backgroundColor }
  })
  expect(style.radius).toBe('9999px')
  expect(style.background).toBe('rgb(255, 255, 255)')
})

test('all nine brands are present with accessible names, the rest are the same ones', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const names = await tiles(page).evaluateAll((elements) => [...new Set(elements.map((el) => el.getAttribute('aria-label')))])
  expect(names.sort()).toEqual(['AllTrust', 'Apple Pay', 'Bybit', 'Flitt', 'Google Pay', 'MultiMoney', 'SEPA', 'SWIFT', 'Utila'])
})

// With reduced motion the tiles stand exactly where the design puts them (tiles 7 to 20 of the frame).
const designTiles: [number, number][] = [
  [311.27, 61.54], [433.91, 37.02], [558.45, 12.11], [682.04, 0.61], [804.68, 25.13], [927.31, 49.66], [1048, 74],
  [1174, 62], [1296, 37], [1421, 12], [1544, 1], [1667, 25], [1790, 50], [1910, 74],
]

test('reduced motion at the width of the desktop frame: tiles stand as in the design and do not move', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 2560, height: 1000 })
  await page.goto('/')
  const track = await page.locator('[data-el="logos__track-wrap"]').boundingBox()
  const positions = async () =>
    (await tiles(page).evaluateAll((elements) => elements.map((el) => { const r = el.getBoundingClientRect(); return [r.x, r.y] })))
      .map(([x, y]) => [x - track!.x, y - track!.y] as [number, number])

  const before = await positions()
  for (const [left, top] of designTiles) {
    const match = before.find(([x, y]) => Math.abs(x - left) <= 3.5 && Math.abs(y - top) <= 1.5)
    expect(match, `no tile near design position ${left}, ${top}`).toBeTruthy()
  }
  await page.waitForTimeout(700)
  expect(await positions()).toEqual(before)
})

test('the tiles run from right to left, slowly (about 24 px per second)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await section(page).scrollIntoViewIfNeeded()
  const tile = tiles(page).nth(6)
  const read = () => tile.evaluate((el) => ({ x: el.getBoundingClientRect().x, t: performance.now() }))
  await expect(tile).toBeVisible()
  const a = await read()
  await page.waitForTimeout(1500)
  const b = await read()
  const speed = ((a.x - b.x) / (b.t - a.t)) * 1000 // positive = moving left
  expect(speed).toBeGreaterThan(14)
  expect(speed).toBeLessThan(34)
})

test('pointer or scroll does not matter: the run keeps going while the strip is on screen, and nothing sticks out sideways', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 800 })
  await page.goto('/')
  await section(page).scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBe(0)
})

test('dark theme: tiles are dark and the logos turn light (invert + screen)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.locator('[data-el="header"] [data-el="header__theme-toggle"]').click()
  await page.mouse.move(700, 100)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await section(page).scrollIntoViewIfNeeded()
  const tile = tiles(page).first()
  await expect(tile).toHaveCSS('background-color', 'rgb(24, 24, 24)')
  const image = tile.locator('img')
  await expect(image).toHaveCSS('mix-blend-mode', 'screen')
  expect(await image.evaluate((el) => getComputedStyle(el).filter)).toContain('invert(1)')
  await page.waitForTimeout(300)
  await section(page).screenshot({ path: 'tests/artifacts/logos-desktop-1440-dark.png' })
})
