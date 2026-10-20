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

/** Vertical shift of the first word (or line) of a text (px): positive while it is still below its mask. */
const lineShift = (page: Page, heading: string) =>
  page
    .locator(`[data-el="${heading}"] .overflow-hidden > span`)
    .first()
    .evaluate((line) => new DOMMatrix(getComputedStyle(line).transform).m42)

test('page load: the header comes down, the hero plays in turn and everything stands in place at the end', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.waitForTimeout(150)
  // At the start: the header is above the screen, the media card and the buttons are not there yet.
  expect((await page.locator('[data-el="header"]').boundingBox())!.y).toBeLessThan(-1)
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

test('next steps: the title and the text unroll word by word, each word from its own mask, and end up in place', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.waitForTimeout(500)
  const shifts = (selector: string) =>
    page.locator(selector).evaluate((heading) =>
      [...heading.querySelectorAll('.overflow-hidden > span')].map((word) => new DOMMatrix(getComputedStyle(word).transform).m42),
    )
  // Before it comes into view every word is under its mask.
  const hidden = await shifts('[data-el="next-steps__title"]')
  expect(hidden.length).toBe(5) // What are our next steps?
  expect(Math.min(...hidden)).toBeGreaterThan(10)

  await scrollToSection(page, 'next-steps', 0)
  await page.waitForTimeout(450)
  // In the middle of the run the first words are further up than the last ones: they follow one another.
  const middle = await shifts('[data-el="next-steps__title"]')
  expect(middle[0]).toBeLessThan(middle.at(-1)!)
  await page.waitForTimeout(2600)
  for (const selector of ['[data-el="next-steps__title"]', '[data-el="next-steps__desc"]']) {
    const done = await shifts(selector)
    expect(done.length, selector).toBeGreaterThan(4)
    for (const shift of done) expect(shift, selector).toBeCloseTo(0, 1)
  }
  // Still one readable heading and one paragraph.
  await expect(page.locator('[data-el="next-steps__title"]')).toHaveText('What are our next steps?')
  await expect(page.locator('[data-el="next-steps__desc"]')).toHaveText('From initial consultation to your first live transaction in 4 transparent steps.')
})

test('global: the text waits for the globe, then the figures count up', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await scrollToSection(page, 'global', 0.2)
  await page.waitForTimeout(1500)
  expect(await lineShift(page, 'global__title')).toBeGreaterThan(10)
  expect(await lineShift(page, 'global__desc')).toBeGreaterThan(10)
  // The figures are not there before their turn (they must not stand as zeros).
  for (const metric of ['uptime', 'rails', 'latency']) {
    expect(await opacityOf(page, `[data-el="global__metric-${metric}-value"]`), metric).toBe(0)
  }

  await scrollToSection(page, 'global', 0.7)
  await page.waitForTimeout(3500)
  expect(await lineShift(page, 'global__title')).toBeCloseTo(0, 1)
  expect(await lineShift(page, 'global__desc')).toBeCloseTo(0, 1)
  const counted = (metric: string) => page.locator(`[data-el="global__metric-${metric}-value"] > span > span[aria-hidden="true"]:not(.invisible)`)
  await expect(counted('uptime')).toHaveText('99.9%')
  await expect(counted('rails')).toHaveText('15+')
  await expect(counted('latency')).toHaveText('<1 sec')
  // The figure keeps its place (the invisible copy has the final width).
  expect((await page.locator('[data-el="global__metric-uptime-value"]').boundingBox())!.width).toBeGreaterThan(100)
})

test('footer: the lower bar at the very end of the page appears too (and its links can be used)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForTimeout(2500)
  expect(await opacityOf(page, '[data-el="footer-bottom__container"]')).toBe(1)
  await expect(page.locator('[data-el^="footer-bottom__link-"]').first()).toBeVisible()
  expect(await opacityOf(page, '[data-el="footer-bottom__copyright"]')).toBe(1)
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

test('industries dark scene: the whole page fades to dark (class theme-fading), the header follows, and it fades back', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.waitForTimeout(500)
  await scrollToSection(page, 'industries', 0)
  await page.waitForTimeout(800)
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark')
  // Into Startups (the third item of seven).
  await page.evaluate(() => {
    const el = document.querySelector('[data-el="industries"]') as HTMLElement
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, top + (2.5 / 7) * (el.getBoundingClientRect().height - window.innerHeight))
  })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('html')).toHaveClass(/theme-fading/)
  await page.waitForTimeout(1500)
  await expect(page.locator('html')).not.toHaveClass(/theme-fading/)
  // The header is dark too (its surface is the dark surface-subtle).
  expect(await page.locator('[data-el="header"]').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(24, 24, 24)')
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
    await expect(page.locator('[data-el="hero__title"] .overflow-hidden')).toHaveCount(0)
    await expect(page.locator('[data-el="hero__title"]')).toBeVisible()
  })
})

// The words and masks must not change the layout: every converted text has the same size and the same place in its block
// with the appearance on (after it has played) as with it off.
for (const viewport of [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'mobile-393', width: 393, height: 850 },
]) {
  test(`the word reveal keeps the layout of every text (${viewport.name})`, async ({ browser }) => {
    const measure = async (revealOff: boolean) => {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } })
      if (revealOff) await context.addInitScript(() => localStorage.setItem('velant-reveal', 'off'))
      const page = await context.newPage()
      await page.goto('/')
      await page.evaluate(() => document.fonts.ready)
      // Walk down the page so that everything comes into view, then wait for the longest run.
      for (let y = 0; y < 16000; y += 600) {
        await page.evaluate((top) => window.scrollTo(0, top), y)
        await page.waitForTimeout(90)
      }
      await page.waitForTimeout(3500)
      const rects = await page.evaluate(() => {
        const selector = 'h1, h2, [data-el$="__desc"], [data-el$="__subtitle"], [data-el$="__eyebrow"], [data-el$="-desc"], [data-el$="-label"], [data-el^="footer__col-"][data-el$="-title"]'
        const found: Record<string, number[]> = {}
        for (const element of document.querySelectorAll<HTMLElement>(selector)) {
          // Skip the texts inside the cards that open and close by themselves (their size depends on the moment).
          if (element.closest('[data-el="industries__slider"], [data-el^="global__pin"], [data-el^="industries__item"], [data-el^="next-steps__card"], [data-el^="faq__item"]')) continue
          const block = element.closest('section, footer') as HTMLElement | null
          const box = element.getBoundingClientRect()
          const blockTop = block ? block.getBoundingClientRect().top : 0
          const key = element.getAttribute('data-el') ?? element.id ?? element.tagName
          found[key] = [Math.round(box.width), Math.round(box.height), Math.round(box.top - blockTop), Math.round(box.left)]
        }
        return found
      })
      await context.close()
      return rects
    }
    const off = await measure(true)
    const on = await measure(false)
    const keys = Object.keys(off)
    expect(keys.length).toBeGreaterThan(12)
    for (const key of keys) {
      expect(on[key], key).toBeDefined()
      off[key].forEach((value, index) => expect(Math.abs(on[key][index] - value), `${key} [width, height, top, left][${index}]`).toBeLessThanOrEqual(2))
    }
  })
}

// The text of a panel that opens (an answer, the text of a step, the text of an Industries card) rises word by word every time it opens.
const wordShifts = (page: Page, selector: string) =>
  page.locator(selector).evaluate((text) =>
    [...text.querySelectorAll('.overflow-hidden > span')].map((word) => new DOMMatrix(getComputedStyle(word).transform).m42),
  )

test('FAQ: an answer unrolls word by word each time its question is opened', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.waitForTimeout(500)
  await scrollToSection(page, 'faq', 0)
  await page.waitForTimeout(2500)
  const heads = page.locator('[data-el^="faq__item-"][data-el$="-head"]')
  const answer = '[data-el^="faq__item-"][data-el$="-answer"] >> nth=1'
  await heads.nth(1).click()
  await page.waitForTimeout(500)
  // Early in the run: the first words are further along than the last ones.
  const early = await wordShifts(page, answer)
  expect(early.length).toBeGreaterThan(6)
  expect(early[0]).toBeLessThan(early.at(-1)!)
  await page.waitForTimeout(2800)
  for (const shift of await wordShifts(page, answer)) expect(shift).toBeCloseTo(0, 1)

  // Close it, wait for the fold to be over, open it again: the words play again.
  await heads.nth(1).click()
  await page.waitForTimeout(2200)
  await heads.nth(1).click()
  await page.waitForTimeout(600)
  const again = await wordShifts(page, answer)
  expect(Math.max(...again)).toBeGreaterThan(3)
  await page.waitForTimeout(2800)
  for (const shift of await wordShifts(page, answer)) expect(shift).toBeCloseTo(0, 1)
  // The lead of an answer has its own (stronger) color, as before.
  await expect(page.locator('[data-el^="faq__item-"][data-el$="-answer"]').first()).toContainText('We use a custodial solution')
})

test('Next steps: the description of a card unrolls word by word when the card is opened', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.waitForTimeout(500)
  await scrollToSection(page, 'next-steps', 0)
  await page.waitForTimeout(2500)
  const titles = page.locator('[data-el^="next-steps__card-"][data-el$="-title"]')
  const desc = '[data-el^="next-steps__card-"][data-el$="-desc"] >> nth=2'
  await titles.nth(2).click()
  await page.waitForTimeout(900)
  const early = await wordShifts(page, desc)
  expect(early.length).toBeGreaterThan(6)
  expect(Math.max(...early)).toBeGreaterThan(1) // not all of it is out yet
  await page.waitForTimeout(2500)
  for (const shift of await wordShifts(page, desc)) expect(shift).toBeCloseTo(0, 1)
})

test('Industries: the description of the card unrolls word by word when the card opens', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.waitForTimeout(800)
  const goTo = (fraction: number) =>
    page.evaluate((f) => {
      const el = document.querySelector('[data-el="industries"]') as HTMLElement
      const top = el.getBoundingClientRect().top + window.scrollY
      window.scrollTo(0, top + f * (el.getBoundingClientRect().height - window.innerHeight))
    }, fraction)
  await goTo(0.5 / 7)
  await page.waitForTimeout(2500)
  await goTo(1.5 / 7) // E-commerce opens
  await page.waitForTimeout(1100)
  const early = await wordShifts(page, '[data-el="industries__item-ecommerce-desc"]')
  expect(early.length).toBeGreaterThan(8)
  expect(Math.max(...early)).toBeGreaterThan(1)
  await page.waitForTimeout(2800)
  for (const shift of await wordShifts(page, '[data-el="industries__item-ecommerce-desc"]')) expect(shift).toBeCloseTo(0, 1)
})
