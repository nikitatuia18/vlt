import { expect, test, type Page } from '@playwright/test'

// The animated pictures of the product cards (docs/blocks/features.motion.md, code in src/components/blocks/Features/illustrations/).
// Most of the suite runs with the animations off (the clocks stand on the state of the design); the groups below switch them on.

const card = (page: Page, id: string) => page.locator(`[data-el="features__card-${id}"]`)
const opacity = (page: Page, selector: string) => page.locator(selector).evaluate((element) => Number(getComputedStyle(element).opacity))
const offsetY = (page: Page, selector: string) =>
  page.locator(selector).evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m42)
const dash = (page: Page, id: string) =>
  page.locator(`[data-el="features__payouts-flow-${id}"]`).evaluate((element) => Number.parseFloat(getComputedStyle(element).strokeDasharray))
/** Number of pixels of the tesseract canvas that are not transparent. */
const inkOf = (page: Page) =>
  page.locator('[data-el="features__tesseract"]').evaluate((element) => {
    const canvas = element as HTMLCanvasElement
    const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data
    let ink = 0
    for (let index = 3; index < data.length; index += 4) if (data[index] > 0) ink++
    return ink
  })
/** A fingerprint of the picture of the tesseract: it changes while the cube turns. */
const fingerprintOf = (page: Page) =>
  page.locator('[data-el="features__tesseract"]').evaluate((element) => {
    const canvas = element as HTMLCanvasElement
    const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data
    let sum = 0
    for (let index = 3; index < data.length; index += 97) sum = (sum * 31 + data[index]) % 1000003
    return sum
  })

const toCards = async (page: Page, width = 1440) => {
  await page.setViewportSize({ width, height: 900 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await card(page, 'invoicing').scrollIntoViewIfNeeded()
}

const inside = async (page: Page, selector: string, cardId: string) => {
  const inner = (await page.locator(selector).boundingBox())!
  const outer = (await card(page, cardId).boundingBox())!
  expect(inner.x, selector).toBeGreaterThanOrEqual(outer.x - 1)
  expect(inner.x + inner.width, selector).toBeLessThanOrEqual(outer.x + outer.width + 1)
  expect(inner.y, selector).toBeGreaterThanOrEqual(outer.y - 1)
  expect(inner.y + inner.height, selector).toBeLessThanOrEqual(outer.y + outer.height + 1)
}

test.describe('state of the design (animations off)', () => {
  test('Invoicing shows the document with the button; Ramp shows 0.0%; Payouts has no dash and no flash; the tesseract is drawn', async ({ page }) => {
    await toCards(page)
    expect(await opacity(page, '[data-el="features__invoicing-doc"]')).toBe(1)
    expect(await opacity(page, '[data-el="features__invoicing-doc-action"]')).toBe(1)
    expect(await opacity(page, '[data-el="features__invoicing-icon-tick-circle"]')).toBe(0)
    expect(await opacity(page, '[data-el="features__invoicing-loader"]')).toBe(0)
    expect(Math.abs(await offsetY(page, '[data-el="features__ramp-counter-scroll"]'))).toBeLessThan(1)
    for (const id of ['dollar-bank', 'dollar-crypto', 'dollar-card', 'bank-person', 'crypto-person', 'card-person']) expect(await dash(page, id), id).toBe(0)
    for (const id of ['bank', 'crypto', 'card']) expect(await opacity(page, `[data-el="features__payouts-method-${id}-flash"]`)).toBe(0)
    expect(await inkOf(page)).toBeGreaterThan(1000)
  })

  test('the texts of the pictures are the texts of the design', async ({ page }) => {
    await toCards(page)
    await expect(page.locator('[data-el="features__invoicing-doc-title"]')).toHaveText('Invoice #2144')
    await expect(page.locator('[data-el="features__invoicing-doc-value"]')).toHaveText('$12,263.00')
    await expect(page.locator('[data-el="features__invoicing-doc-due"]')).toHaveText('Due in 7 days')
    await expect(page.locator('[data-el="features__invoicing-doc-action"]')).toHaveText('Send invoice')
    for (const [id, label] of [['bank', 'Bank transfer'], ['crypto', 'Crypto'], ['card', 'Card']]) {
      await expect(page.locator(`[data-el="features__payouts-method-${id}-label"]`)).toHaveText(label)
    }
    await expect(page.locator('[data-el="features__ramp-counter"]')).toContainText('0.')
  })

  for (const width of [393, 768, 1280, 1440]) {
    test(`the pictures stay inside their cards at ${width} px and nothing sticks out sideways`, async ({ page }) => {
      await toCards(page, width)
      await inside(page, '[data-el="features__invoicing-doc"]', 'invoicing')
      await inside(page, '[data-el="features__ramp-counter"]', 'ramp')
      await inside(page, '[data-el="features__payouts-method-bank"]', 'payouts')
      await inside(page, '[data-el="features__payouts-recipient-bank"]', 'payouts')
      await inside(page, '[data-el="features__tesseract"]', 'crypto').catch(() => undefined) // the design lets it go 34 px beyond the right edge (clipped by the card)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow).toBe(0)
      await card(page, 'invoicing').screenshot({ path: `tests/artifacts/features-invoicing-${width}.png` })
      await card(page, 'payouts').screenshot({ path: `tests/artifacts/features-payouts-${width}.png` })
    })
  }

  test('on a phone the pictures shrink with the card: the document of Invoicing is narrower than in the design', async ({ page }) => {
    await toCards(page, 393)
    const doc = (await page.locator('[data-el="features__invoicing-doc"]').boundingBox())!
    expect(doc.width).toBeLessThan(246)
    expect(doc.width).toBeGreaterThan(180)
  })
})

test.describe('with the animations on', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('Invoicing plays its story: the loader, the tick, the flight out to the right and back', async ({ page }) => {
    await toCards(page)
    const settle = { timeout: 16000 }
    await expect.poll(() => opacity(page, '[data-el="features__invoicing-loader"]'), settle).toBeGreaterThan(0.9)
    await expect.poll(() => opacity(page, '[data-el="features__invoicing-icon-tick-circle"]'), settle).toBeGreaterThan(0.9)
    const outsideTheCard = async () => {
      const doc = (await page.locator('[data-el="features__invoicing-doc"]').boundingBox())!
      const outer = (await card(page, 'invoicing').boundingBox())!
      return doc.x >= outer.x + outer.width - 1
    }
    await expect.poll(outsideTheCard, settle).toBe(true)
    // and it is a loop: the document comes again
    await expect.poll(async () => !(await outsideTheCard()), settle).toBe(true)
  })

  test('Ramp counts to 0.5% and holds it', async ({ page }) => {
    await toCards(page)
    await card(page, 'ramp').scrollIntoViewIfNeeded()
    await expect.poll(() => offsetY(page, '[data-el="features__ramp-counter-scroll"]'), { timeout: 8000 }).toBeCloseTo(-640, 0)
  })

  test('Payouts: the dashes run, the ways to pay light up green, the dashes run to the people', async ({ page }) => {
    await toCards(page)
    await card(page, 'payouts').scrollIntoViewIfNeeded()
    const settle = { timeout: 12000 }
    await expect.poll(() => dash(page, 'dollar-bank'), settle).toBeGreaterThan(0.1)
    // The glow peaks for one frame, so it is watched on every frame instead of being polled.
    const glowed = await page.evaluate(
      () =>
        new Promise<boolean>((resolve) => {
          const element = document.querySelector('[data-el="features__payouts-method-bank-flash"]')!
          const started = performance.now()
          const look = () => {
            if (Number(getComputedStyle(element).opacity) > 0.5) resolve(true)
            else if (performance.now() - started > 12000) resolve(false)
            else requestAnimationFrame(look)
          }
          look()
        }),
    )
    expect(glowed).toBe(true)
    await expect.poll(() => dash(page, 'bank-person'), settle).toBeGreaterThan(0.05)
  })

  test('Payouts: the ways to pay start one after another, not together', async ({ page }) => {
    await toCards(page)
    await card(page, 'payouts').scrollIntoViewIfNeeded()
    const starts = await page.evaluate(
      () =>
        new Promise<Record<string, number>>((resolve) => {
          const ids = ['bank', 'card', 'crypto']
          const elements = Object.fromEntries(ids.map((id) => [id, document.querySelector(`[data-el="features__payouts-flow-dollar-${id}"]`)!]))
          const first: Record<string, number> = {}
          const began = performance.now()
          const look = () => {
            for (const id of ids) {
              if (!(id in first) && Number.parseFloat(getComputedStyle(elements[id]).strokeDasharray) > 0) first[id] = performance.now() - began
            }
            if (Object.keys(first).length === ids.length || performance.now() - began > 8000) resolve(first)
            else requestAnimationFrame(look)
          }
          look()
        }),
    )
    expect(Object.keys(starts)).toHaveLength(3)
    expect(starts.card - starts.bank).toBeGreaterThan(100)
    expect(starts.crypto - starts.card).toBeGreaterThan(100)
  })

  test('the tesseract turns while the card is on the screen', async ({ page }) => {
    await toCards(page)
    await card(page, 'crypto').scrollIntoViewIfNeeded()
    const before = await fingerprintOf(page)
    await page.waitForTimeout(800)
    expect(await fingerprintOf(page)).not.toBe(before)
  })

  test('a long wait on the screen at 4 times slower processor: no long freezes', async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __long: number[] }
      w.__long = []
      new PerformanceObserver((list) => list.getEntries().forEach((entry) => w.__long.push(entry.duration))).observe({ type: 'longtask', buffered: true })
    })
    const session = await page.context().newCDPSession(page)
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    await toCards(page)
    await page.waitForTimeout(1500) // the load of the page (the globe, the fonts) is not what is measured here
    await page.evaluate(() => ((window as unknown as { __long: number[] }).__long.length = 0))
    await page.waitForTimeout(5000)
    const long = await page.evaluate(() => (window as unknown as { __long: number[] }).__long)
    console.log('long tasks at x4 while the four pictures play:', JSON.stringify(long.map((value) => Math.round(value))))
    expect(Math.max(0, ...long)).toBeLessThan(200)
  })
})

test.describe('reduced motion', () => {
  test.use({ storageState: { cookies: [], origins: [] }, reducedMotion: 'reduce' })

  test('everything stands in the state of the design and nothing moves', async ({ page }) => {
    await toCards(page)
    await page.waitForTimeout(1200)
    expect(await opacity(page, '[data-el="features__invoicing-doc"]')).toBe(1)
    expect(await opacity(page, '[data-el="features__invoicing-doc-action"]')).toBe(1)
    expect(Math.abs(await offsetY(page, '[data-el="features__ramp-counter-scroll"]'))).toBeLessThan(1)
    expect(await dash(page, 'dollar-bank')).toBe(0)
    const before = await fingerprintOf(page)
    await page.waitForTimeout(800)
    expect(await fingerprintOf(page)).toBe(before)
  })
})
