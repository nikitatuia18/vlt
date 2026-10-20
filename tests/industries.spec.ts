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
  // 1 px more: the line under the block (border of the section)
  expect((await section(page).boundingBox())!.height - 1).toBeCloseTo(900 + 6 * 0.6 * 900, 0)
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
  test(`the title is the first thing of the sliding content: above the first item at the start, gone upwards later at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await scrollToProgress(page, 0.02)
    const title = await box(page, '[data-el="industries__title"]')
    const first = await box(page, `[data-el="industries__item-${ids[0]}"]`)
    expect(title.y + title.height, 'above the first item').toBeLessThanOrEqual(first.y)
    expect(title.y, 'on the screen').toBeGreaterThanOrEqual(0)
    // The title is not pinned: it slides up with the content (on a tall screen it may still be visible for a while),
    // it is always above the open item, and its width never changes.
    let previousY = title.y
    for (const index of [2, 4, ids.length - 1]) {
      await scrollToProgress(page, (index + 0.5) / ids.length)
      const current = await box(page, '[data-el="industries__title"]')
      const open = await box(page, `[data-el="industries__item-${ids[index]}"]`)
      expect(current.y, `${ids[index]} moved up`).toBeLessThan(previousY - 20)
      expect(current.y + current.height, `${ids[index]} above the open item`).toBeLessThanOrEqual(open.y)
      expect(current.width, ids[index]).toBeCloseTo(title.width, 0)
      previousY = current.y
    }
    // At the last item the title has left the screen on a normal one (not on a very tall one).
    if (viewport.height <= 900) {
      const last = await box(page, '[data-el="industries__title"]')
      expect(last.y + last.height).toBeLessThan(0)
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

test('every one of the seven items is centered on the screen when it opens (1440 x 900), and the others stay visible around it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  for (let index = 0; index < ids.length; index++) {
    await scrollToProgress(page, (index + 0.5) / ids.length)
    const open = (await item(page, ids[index]).boundingBox())!
    expect(Math.abs(open.y + open.height / 2 - 450), ids[index]).toBeLessThan(3)
    // Nothing is hidden or faded: the neighbours above and below the open one are fully opaque and not masked.
    for (const neighbour of [index - 1, index + 1]) {
      if (neighbour < 0 || neighbour >= ids.length) continue
      const state = await item(page, ids[neighbour]).evaluate((el) => {
        const chain: string[] = []
        for (let node: HTMLElement | null = el; node; node = node.parentElement) {
          const style = getComputedStyle(node)
          chain.push(`${style.opacity}|${style.maskImage}`)
        }
        return chain
      })
      expect(state.every((entry) => entry === '1|none'), `${ids[neighbour]} next to ${ids[index]}`).toBe(true)
    }
  }
  // Going back up keeps the centering too.
  await scrollToProgress(page, 0.5 / ids.length)
  const first = (await item(page, ids[0]).boundingBox())!
  expect(Math.abs(first.y + first.height / 2 - 450)).toBeLessThan(3)
})
test('the open item is a white card (radius 32, padding 60 x 40) and the description unfolds; closed items are grey and folded', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await scrollToProgress(page, 0.5 / ids.length) // Industry-first scenarios: a light scene (Startups is a dark glass one)
  const inner = page.locator('[data-el="industries__item-industry-first-inner"]')
  const style = await inner.evaluate((el) => {
    const cs = getComputedStyle(el)
    return { radius: cs.borderTopLeftRadius, background: cs.backgroundColor, paddingX: cs.paddingLeft, paddingY: cs.paddingTop }
  })
  expect(style).toEqual({ radius: '32px', background: 'rgb(255, 255, 255)', paddingX: '60px', paddingY: '40px' })
  const details = page.locator('[data-el="industries__item-industry-first-details"]')
  await expect(details).toHaveAttribute('aria-hidden', 'false')
  expect((await details.boundingBox())!.height).toBeGreaterThan(100)
  const color = (id: string) => page.locator(`[data-el="industries__item-${id}-title"]`).evaluate((el) => getComputedStyle(el).color)
  expect(await color('industry-first')).toBe('rgb(24, 24, 24)') // typography-primary
  expect(await color('real-estate')).not.toBe('rgb(24, 24, 24)') // typography-tertiary (grey)

  await scrollToProgress(page, 0.8) // Export/Import is open, the first item is closed again
  await expect(details).toHaveAttribute('aria-hidden', 'true')
  expect((await details.boundingBox())!.height).toBeLessThan(2)
  await expect(page.locator('[data-el="industries__item-industry-first-cta"]')).toHaveAttribute('tabindex', '-1')
  expect(await inner.evaluate((el) => getComputedStyle(el).paddingLeft)).toBe('0px')
})

test('desktop frame (2560): the title is centered above the list at 64 px, items are single lines', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1200 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await scrollToProgress(page, 0.02)
  const titleElement = page.locator('[data-el="industries__title"]')
  expect(await titleElement.evaluate((el) => getComputedStyle(el).fontSize)).toBe('64px')
  const title = await box(page, '[data-el="industries__title"]')
  expect(title.x + title.width / 2).toBeCloseTo(1280, 0) // centered on the screen
  const list = await box(page, '[data-el="industries__list"]')
  expect(title.y + title.height).toBeLessThanOrEqual(list.y)
  await scrollToProgress(page, 0.4)
  for (const id of ids) {
    const titleBox = (await page.locator(`[data-el="industries__item-${id}-title"]`).boundingBox())!
    expect(titleBox.height, id).toBeCloseTo(72, 0) // one line of 72
  }
})

test('mobile: smaller type, nothing sticks out sideways', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 850 })
  await page.goto('/')
  await scrollToProgress(page, 0.02)
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
  const transform = await page.locator('[data-el="industries__slider"]').evaluate((el) => (el as HTMLElement).style.transform)
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
  await scrollToProgress(page, 0.5 / ids.length)
  await expect(page.locator('[data-el="industries__item-industry-first-inner"]')).toHaveCSS('background-color', 'rgb(24, 24, 24)')
  await expect(page.locator('[data-el="industries__item-industry-first-title"]')).toHaveCSS('color', 'rgb(255, 255, 255)')
  await page.screenshot({ path: 'tests/artifacts/industries-desktop-1440-dark.png' })
})

// The dark scenes: the block turns dark while E-commerce, Startups, Luxury, Real estate or Export/Import is open,
// a glow of its own hue lies behind the glass card and the button is white. The first and the last items stay light.
const scenes: Record<string, string | null> = {
  'industry-first': null,
  ecommerce: 'violet',
  startups: 'pink',
  'luxury-automotive': 'orange',
  'real-estate': 'blue',
  'export-import': 'green',
  'operations-payroll': null,
}

for (const [index, id] of ids.entries()) {
  test(`scene of "${id}": ${scenes[id] ? `dark with a ${scenes[id]} glow, glass card, white button` : 'light, brand button, no glow'}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await scrollToProgress(page, (index + 0.5) / ids.length)
    await page.waitForTimeout(900)
    expect(await activeId(page)).toBe(id)

    const hue = scenes[id]
    // The whole site is dark in a dark scene (the theme of <html>), not only the block.
    const root = page.locator('html')
    if (hue) await expect(root).toHaveAttribute('data-theme', 'dark')
    else await expect(root).not.toHaveAttribute('data-theme', 'dark')

    // Exactly the glow of this hue is on; the others are off.
    for (const other of Object.values(scenes).filter((value): value is string => value !== null)) {
      const opacity = await page.locator(`[data-el="industries__glow-${other}"]`).evaluate((el) => Number(getComputedStyle(el).opacity))
      expect(opacity, `glow ${other}`).toBe(other === hue ? 1 : 0)
    }

    const card = page.locator(`[data-el="industries__item-${id}-inner"]`)
    const button = page.locator(`[data-el="industries__item-${id}-cta"]`)
    const cardBackground = await card.evaluate((el) => getComputedStyle(el).backgroundColor)
    const buttonBackground = await button.evaluate((el) => getComputedStyle(el).backgroundColor)
    if (hue) {
      // Glass: the fill is see-through, the backdrop is blurred; the button is the white inverse one with dark text.
      expect(cardBackground).toMatch(/rgba\(|color\(srgb/)
      expect(await card.locator('[data-glass="backdrop"]').evaluate((el) => getComputedStyle(el).backdropFilter)).toContain('blur')
      await expect(card.locator('[data-glass="rim"]')).toHaveCount(1)
      expect(buttonBackground).toBe('rgb(255, 255, 255)')
      await expect(button).toHaveCSS('color', 'rgb(24, 24, 24)')
      // Title and page are on the dark side of the tokens.
      expect(await page.locator(`[data-el="industries__item-${id}-title"]`).evaluate((el) => getComputedStyle(el).color)).toBe('rgb(255, 255, 255)')
    } else {
      expect(cardBackground).toBe('rgb(255, 255, 255)')
      expect(buttonBackground).not.toBe('rgb(255, 255, 255)')
    }
  })
}

const toggle = (page: Page) => page.locator('[data-el="header"] [data-el="header__theme-toggle"]')

test('a dark scene locks the theme toggle (the moon, not pressable) and the site goes back to the choice of the visitor afterwards', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await expect(toggle(page)).toBeEnabled()
  await scrollToProgress(page, 0.4) // Startups: a dark scene
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(toggle(page)).toBeDisabled()
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')
  await toggle(page).click({ force: true, trial: false }).catch(() => undefined)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await scrollToProgress(page, 0.95) // Operations: light again
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(toggle(page)).toBeEnabled()
})

test('if the visitor chose the dark theme, the light items stay dark and the toggle works again', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await toggle(page).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await scrollToProgress(page, 0.4)
  await expect(toggle(page)).toBeDisabled()
  await scrollToProgress(page, 0.95)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(toggle(page)).toBeEnabled()
  // (The header has slid away while scrolling down: press the button in the page, not with the mouse.)
  await toggle(page).evaluate((button) => (button as HTMLButtonElement).click())
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('the scene follows the item both ways: dark, light again, dark again', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const seen: (string | null)[] = []
  for (const progress of [0.07, 0.21, 0.93, 0.5]) {
    await scrollToProgress(page, progress)
    seen.push((await page.locator('html').getAttribute('data-theme')) ?? 'light')
  }
  expect(seen).toEqual(['light', 'dark', 'light', 'dark'])
})

test('reduced motion: the static design state is the dark pink scene of Startups', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.goto('/')
  await section(page).scrollIntoViewIfNeeded()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(section(page)).toHaveAttribute('data-glow', 'pink')
  await context.close()
})

// Depth: the glow behind the open card follows the pointer a little while it is over the card, and comes back when it leaves.
const glowShift = (page: Page) =>
  page.locator('[data-el="industries__glow-layers"]').evaluate((el) => {
    const matrix = new DOMMatrix(getComputedStyle(el).transform)
    return { x: matrix.m41, y: matrix.m42 }
  })

test('parallax: the glow follows the pointer over the open card, within a few dozen px, and returns', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await scrollToProgress(page, 0.4) // Startups
  const card = (await box(page, '[data-el="industries__item-startups-inner"]'))
  expect(Math.abs((await glowShift(page)).x)).toBeLessThan(0.5)

  await page.mouse.move(card.x + card.width * 0.9, card.y + card.height * 0.2, { steps: 5 })
  await page.waitForTimeout(1500)
  const right = await glowShift(page)
  expect(right.x).toBeGreaterThan(10)
  expect(right.x).toBeLessThanOrEqual(28.5)
  expect(right.y).toBeLessThan(0)

  await page.mouse.move(card.x + card.width * 0.1, card.y + card.height * 0.8, { steps: 5 })
  await page.waitForTimeout(1500)
  const left = await glowShift(page)
  expect(left.x).toBeLessThan(-10)
  expect(left.y).toBeGreaterThan(0)

  // Away from the card: back in the middle.
  await page.mouse.move(40, 450, { steps: 5 })
  await page.waitForTimeout(1800)
  const away = await glowShift(page)
  expect(Math.abs(away.x)).toBeLessThan(1)
  expect(Math.abs(away.y)).toBeLessThan(1)
})

test('parallax: in a light scene nothing moves, with reduced motion neither', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/')
  await section(page).scrollIntoViewIfNeeded()
  const card = await box(page, '[data-el="industries__item-startups-inner"]')
  await page.mouse.move(card.x + card.width * 0.9, card.y + card.height * 0.2, { steps: 5 })
  await page.waitForTimeout(800)
  expect(Math.abs((await glowShift(page)).x)).toBeLessThan(0.5)
  await context.close()
})
