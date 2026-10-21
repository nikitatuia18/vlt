import { expect, test, type Locator, type Page } from '@playwright/test'

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
const strip = (page: Page) => page.locator('[data-el="logos__track"]')

// Reads the vertical position of a tile on the screen and a timestamp.
const readY = (tile: Locator) => tile.evaluate((el) => ({ x: el.getBoundingClientRect().x, y: el.getBoundingClientRect().y, t: performance.now() }))
// Horizontal shift of the whole strip (the scroll drift), px.
const stripShift = (page: Page) =>
  strip(page).evaluate((el) => {
    const transform = getComputedStyle(el).transform
    return transform === 'none' ? 0 : new DOMMatrix(transform).m41
  })

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

test('all nine brands are present with accessible names', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const names = await tiles(page).evaluateAll((elements) => [...new Set(elements.map((el) => el.getAttribute('aria-label')))])
  expect(names.sort()).toEqual(['AllTrust', 'Apple Pay', 'Bybit', 'Flitt', 'Google Pay', 'MultiMoney', 'SEPA', 'SWIFT', 'Utila'])
})

test('logos are links to the official sites (new tab, safe); MultiMoney has no link yet', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const links: Record<string, string> = {
    Bybit: 'https://www.bybit.com',
    Utila: 'https://utila.io',
    Flitt: 'https://flitt.com',
    'Apple Pay': 'https://www.apple.com/apple-pay/',
    'Google Pay': 'https://pay.google.com/',
    AllTrust: 'https://alltrust.me',
    SEPA: 'https://www.europeanpaymentscouncil.eu',
    SWIFT: 'https://www.swift.com',
  }
  for (const [name, href] of Object.entries(links)) {
    const link = section(page).locator(`a[aria-label="${name}"]`).first()
    await expect(link).toHaveAttribute('href', href)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  }
  await expect(section(page).locator('a[aria-label="MultiMoney"]')).toHaveCount(0)
  await expect(section(page).locator('[role="img"][aria-label="MultiMoney"]').first()).toBeVisible()
})

// With reduced motion the tiles stand exactly where the design puts them (tiles 7 to 20 of the frame).
const designTiles: [number, number][] = [
  [311.27, 61.54], [433.91, 37.02], [558.45, 12.11], [682.04, 0.61], [804.68, 25.13], [927.31, 49.66], [1048, 74],
  [1174, 62], [1296, 37], [1421, 12], [1544, 1], [1667, 25], [1790, 50], [1910, 74],
]

test('reduced motion at the width of the desktop frame: tiles stand as in the design, nothing moves, no drift', async ({ page }) => {
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

  // Scrolling must not slide the strip either.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(300)
  expect(await stripShift(page)).toBe(0)
})

test('the tiles stand still along x while the wave lifts and lowers them', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await section(page).scrollIntoViewIfNeeded()
  await page.waitForTimeout(500) // let the scroll settle
  const tile = tiles(page).nth(6)
  const a = await readY(tile)
  await page.waitForTimeout(1500)
  const b = await readY(tile)
  expect(Math.abs(b.x - a.x)).toBeLessThan(0.5) // no running along x
  expect(Math.abs(b.y - a.y)).toBeGreaterThan(5) // but the height changed: the wave went through
})

test('the wave stops while the pointer is over the strip and goes on when it leaves', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await section(page).scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  const tile = tiles(page).nth(6)
  const moving = async () => {
    const a = await readY(tile)
    await page.waitForTimeout(500)
    return Math.abs((await readY(tile)).y - a.y)
  }
  expect(await moving()).toBeGreaterThan(0.5)

  const box = await strip(page).boundingBox()
  await page.mouse.move(700, box!.y + box!.height / 2)
  await page.waitForTimeout(1500) // it eases to a stop
  expect(await moving()).toBeLessThan(0.3)

  await page.mouse.move(700, 20) // out of the strip (over the header)
  await page.waitForTimeout(800)
  expect(await moving()).toBeGreaterThan(0.5)
})

test('the wave also stops while a logo link has keyboard focus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await section(page).scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  const tile = tiles(page).nth(6)
  const moving = async () => {
    const a = await readY(tile)
    await page.waitForTimeout(500)
    return Math.abs((await readY(tile)).y - a.y)
  }
  await section(page).locator('a').first().focus()
  await page.waitForTimeout(1500)
  expect(await moving()).toBeLessThan(0.3)
  await page.evaluate(() => (document.activeElement as HTMLElement).blur())
  await page.waitForTimeout(800)
  expect(await moving()).toBeGreaterThan(0.5)
})

test('scrolling slides the whole strip to the left, up to 250 px, and back when scrolling up', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  expect(await stripShift(page)).toBe(0) // section is still below the screen

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(400)
  const atBottom = await stripShift(page)
  expect(atBottom).toBeLessThan(-50)
  expect(atBottom).toBeGreaterThanOrEqual(-250)

  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(400)
  expect(await stripShift(page)).toBeCloseTo(0, 0)
})

test('nothing sticks out sideways on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 800 })
  await page.goto('/')
  await section(page).scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
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

test('on a phone the strip is drawn at 0.6 of the design: 48 px tiles, a 90 px strip, more than four logos on the screen', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 800 })
  await page.goto('/')
  await section(page).scrollIntoViewIfNeeded()
  const first = (await tiles(page).first().boundingBox())!
  expect(first.width).toBeCloseTo(48, 0)
  expect(first.height).toBeCloseTo(48, 0)
  expect((await page.locator('[data-el="logos__track-wrap"]').boundingBox())!.height).toBeCloseTo(90, 0)
  // Tiles that stand fully inside the screen (the wave and the scroll shift move them, so count with a margin).
  const inside = await tiles(page).evaluateAll((elements) =>
    elements.filter((element) => {
      const box = element.getBoundingClientRect()
      return box.left >= 0 && box.right <= window.innerWidth
    }).length,
  )
  expect(inside).toBeGreaterThanOrEqual(4)
})

test('tablet keeps the full size of the design (80 px tiles)', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 })
  await page.goto('/')
  expect((await tiles(page).first().boundingBox())!.width).toBeCloseTo(80, 0)
})
