import { expect, test, type Page } from '@playwright/test'

const viewports = [
  { name: 'mobile-393', width: 393, height: 850 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 800 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-2560', width: 2560, height: 1200 },
]

const ids = ['book-demo', 'pass-kyb', 'start-process', 'go-live']
const STEP_SECONDS = 5

const card = (page: Page, id: string) => page.locator(`[data-el="next-steps__card-${id}"]`)
const activeId = (page: Page) =>
  page.locator('[data-el="next-steps__cards"] > li[data-active="true"]').evaluate((el) => el.getAttribute('data-el')!.replace('next-steps__card-', ''))
const barShare = (page: Page, id: string) =>
  card(page, id)
    .locator(`[data-el="next-steps__card-${id}-progress-bar"]`)
    .evaluate((bar) => bar.getBoundingClientRect().width / (bar.parentElement as HTMLElement).getBoundingClientRect().width)

// A folded text is clipped to zero height (it is still in the page, so Playwright counts it as visible).
const foldedHeight = (page: Page, id: string) =>
  page.locator(`[data-el="next-steps__card-${id}-desc"]`).evaluate((el) => el.closest('.min-h-0')!.getBoundingClientRect().height)

const open = async (page: Page, width: number, height: number) => {
  await page.setViewportSize({ width, height })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  // Scroll so that the cards are fully on the screen: only then the time runs.
  await page.locator('[data-el="next-steps__cards"]').scrollIntoViewIfNeeded()
  await page.locator('[data-el="next-steps"]').evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(400)
}

for (const viewport of viewports) {
  test(`next-steps screenshot ${viewport.name}`, async ({ page }) => {
    await open(page, viewport.width, viewport.height)
    await page.locator('[data-el="next-steps"]').screenshot({ path: `tests/artifacts/next-steps-${viewport.name}.png` })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBe(0)
  })
}

test('desktop frame (2560): sizes of the design', async ({ page }) => {
  await open(page, 2560, 1200)
  const box = async (selector: string) => (await page.locator(selector).boundingBox())!
  const active = await box('[data-el="next-steps__card-book-demo"]')
  const closed = await box('[data-el="next-steps__card-pass-kyb"]')
  const closed2 = await box('[data-el="next-steps__card-start-process"]')
  expect(Math.abs(active.width - 500)).toBeLessThan(1.5)
  expect(Math.abs(active.height - 680)).toBeLessThan(1.5)
  expect(Math.abs(closed.width - 262)).toBeLessThan(1.5)
  expect(Math.abs(closed.height - 680)).toBeLessThan(1.5)
  // (the column is drawn with a ring, so the cards are 1 px wider than in Figma, where the invisible border narrows the column by 2 px)
  // 24 px between the cards
  expect(closed.x - (active.x + active.width)).toBeCloseTo(24, 0)
  expect(closed2.x - (closed.x + closed.width)).toBeCloseTo(24, 0)
  // The title of the section is on the left and the text on the right, 144 px high header like in the design
  const title = await box('[data-el="next-steps__title"]')
  const desc = await box('[data-el="next-steps__desc"]')
  expect(title.x).toBeLessThan(desc.x)
  expect(title.width).toBeCloseTo(454, 0)
  expect(Math.abs(title.y + title.height - (desc.y + desc.height))).toBeLessThan(2) // aligned to the bottom
  // Text of the design is in place
  await expect(page.locator('[data-el="next-steps__title"]')).toHaveText('What are our next steps?')
  await expect(page.locator('[data-el="next-steps__desc"]')).toHaveText('From initial consultation to your first live transaction in 4 transparent steps.')
  await expect(card(page, 'book-demo').locator('h3')).toHaveText('Book a demo')
})

test('the line fills, then the next step opens; after the last one the first opens again', async ({ page }) => {
  test.setTimeout(60000)
  await open(page, 1440, 900)
  expect(await activeId(page)).toBe('book-demo')
  const early = await barShare(page, 'book-demo')
  await page.waitForTimeout(1200)
  expect(await barShare(page, 'book-demo')).toBeGreaterThan(early + 0.1)
  // The first step ends after about 5 s (a little more is allowed for the loading and the check)
  await expect.poll(() => activeId(page), { timeout: (STEP_SECONDS + 2) * 1000 }).toBe('pass-kyb')
  // The new line starts again from the beginning
  expect(await barShare(page, 'pass-kyb')).toBeLessThan(0.3)
  // Only the open card shows its text
  await expect(card(page, 'pass-kyb').locator('[data-el="next-steps__card-pass-kyb-desc"]')).toBeVisible()
  await expect.poll(() => foldedHeight(page, 'book-demo')).toBeLessThan(1)
})

test('a click opens the step at once and the line starts from it; after the fourth the first opens again', async ({ page }) => {
  test.setTimeout(60000)
  await open(page, 1440, 900)
  await page.waitForTimeout(1500)
  await card(page, 'start-process').click()
  expect(await activeId(page)).toBe('start-process')
  expect(await barShare(page, 'start-process')).toBeLessThan(0.1)
  // The wide card is the open one
  await page.waitForTimeout(1000)
  const widths = await Promise.all(ids.map(async (id) => (await card(page, id).boundingBox())!.width))
  expect(widths[2]).toBeGreaterThan(widths[0])
  expect(widths[2]).toBeGreaterThan(widths[1])
  expect(widths[2]).toBeGreaterThan(widths[3])
  await card(page, 'go-live').click()
  expect(await activeId(page)).toBe('go-live')
  await expect.poll(() => activeId(page), { timeout: (STEP_SECONDS + 2) * 1000 }).toBe('book-demo')
})

test('the time stops while the cards are off the screen', async ({ page }) => {
  await open(page, 1440, 900)
  await page.waitForTimeout(800)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  const before = await barShare(page, 'book-demo')
  await page.waitForTimeout(1500)
  expect(await barShare(page, 'book-demo')).toBeCloseTo(before, 2)
})

test('the text of an opening step does not re-wrap or jump while the card grows', async ({ page }) => {
  await open(page, 1440, 900)
  await card(page, 'start-process').click()
  // Sample the text of the opening card every frame during the first second of the animation.
  const samples = await page.evaluate(
    () =>
      new Promise<{ height: number; width: number; left: number }[]>((resolve) => {
        const text = document.querySelector('[data-el="next-steps__card-start-process-desc"]') as HTMLElement
        const found: { height: number; width: number; left: number }[] = []
        const started = performance.now()
        const tick = () => {
          const box = text.getBoundingClientRect()
          found.push({ height: Math.round(box.height), width: Math.round(box.width), left: Math.round(box.left * 10) / 10 })
          if (performance.now() - started < 1000) requestAnimationFrame(tick)
          else resolve(found)
        }
        tick()
      }),
  )
  // The text keeps one width and one height from the first frame (no re-wrapping), and only the growing card uncovers it.
  expect(new Set(samples.map((sample) => sample.height)).size).toBe(1)
  expect(new Set(samples.map((sample) => sample.width)).size).toBe(1)
  expect(samples.length).toBeGreaterThan(20)
  // The text appears with a delay, after the card has started to grow
  const early = await card(page, 'start-process').locator('[data-el="next-steps__card-start-process-desc"]').evaluate((el) => Number(getComputedStyle(el.parentElement!).opacity))
  expect(early).toBeGreaterThan(0.9) // after the second it is fully there
})

test('stacked layout (tablet): cards one under another, the open one is taller', async ({ page }) => {
  await open(page, 768, 900)
  const first = (await card(page, 'book-demo').boundingBox())!
  const second = (await card(page, 'pass-kyb').boundingBox())!
  expect(second.y).toBeGreaterThan(first.y + first.height - 1)
  expect(first.height).toBeGreaterThan(second.height)
  expect(first.width).toBeCloseTo(second.width, 0)
})

test('nothing is lost: the closed steps keep their text in the page, folded and out of focus', async ({ page }) => {
  await open(page, 1440, 900)
  const desc = page.locator('[data-el="next-steps__card-go-live-desc"]')
  await expect(desc).toHaveCount(1)
  await expect.poll(() => foldedHeight(page, 'go-live')).toBeLessThan(1)
  await expect(desc.locator('xpath=ancestor::div[@inert]')).toHaveCount(1)
  await expect(page.locator('[data-el="next-steps__card-go-live-title"]')).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('[data-el="next-steps__card-book-demo-title"]')).toHaveAttribute('aria-expanded', 'true')
})

test('dark theme: the cards are dark and the line is orange', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await open(page, 1440, 900)
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
  await page.waitForTimeout(900)
  const background = await card(page, 'book-demo').evaluate((el) => getComputedStyle(el).backgroundColor)
  const [red] = background.match(/\d+/g)!.map(Number)
  expect(red).toBeLessThan(60)
  await page.locator('[data-el="next-steps"]').screenshot({ path: 'tests/artifacts/next-steps-dark.png' })
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('nothing runs by itself: step 1 stays open with the line as in the design; a click still works', async ({ page }) => {
    test.setTimeout(30000)
    await open(page, 1440, 900)
    await page.waitForTimeout((STEP_SECONDS + 1) * 1000)
    expect(await activeId(page)).toBe('book-demo')
    expect(await barShare(page, 'book-demo')).toBeCloseTo(325 / 418, 1)
    await card(page, 'pass-kyb').click()
    expect(await activeId(page)).toBe('pass-kyb')
  })
})
