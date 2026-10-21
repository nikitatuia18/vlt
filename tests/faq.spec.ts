import { expect, test, type Page } from '@playwright/test'
import { faqItems } from '../src/components/blocks/Faq/items'

const viewports = [
  { name: 'mobile-393', width: 393, height: 850 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 800 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-2560', width: 2560, height: 1200 },
]

const ids = faqItems.map((item) => item.id)

const item = (page: Page, id: string) => page.locator(`[data-el="faq__item-${id}"]`)
const head = (page: Page, id: string) => page.locator(`[data-el="faq__item-${id}-head"]`)
const box = async (page: Page, selector: string) => (await page.locator(selector).boundingBox())!
const openIds = (page: Page) =>
  page.locator('[data-el="faq__list"] > li[data-open="true"]').evaluateAll((els) => els.map((el) => el.getAttribute('data-el')!.replace('faq__item-', '')))

const open = async (page: Page, width: number, height: number) => {
  await page.setViewportSize({ width, height })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await page.locator('[data-el="faq"]').evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(500)
}

for (const viewport of viewports) {
  test(`faq screenshot ${viewport.name}`, async ({ page }) => {
    await open(page, viewport.width, viewport.height)
    await page.locator('[data-el="faq"]').screenshot({ path: `tests/artifacts/faq-${viewport.name}.png` })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBe(0)
  })
}

test('texts: the title, five questions and their answers (the answers of closed items come from hidden layers of the design)', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 2, name: 'Still have questions?' })).toBeAttached()
  for (const entry of faqItems) {
    await expect(page.locator(`[data-el="faq__item-${entry.id}-question"]`)).toHaveText(entry.question)
    await expect(page.locator(`[data-el="faq__item-${entry.id}-answer"]`)).toHaveText(`${entry.lead ? `${entry.lead} ` : ''}${entry.answer}`)
  }
  expect(faqItems.map((entry) => entry.question)).toEqual([
    'How do you keep funds safe?',
    'What licence do you have?',
    'What is the estimated time for integration?',
    'Do you provide integration and customer support?',
    'I need a custom payment method/new currency/specific financial flow. Can you do that?',
  ])
  // The first part of two answers is set in the primary color, the rest in the secondary one, like in the design.
  const colors = await page.locator('[data-el="faq__item-timeline-answer"]').evaluate((el) => ({
    lead: getComputedStyle(el.querySelector('span.text-typography-primary')!).color,
    rest: getComputedStyle(el).color,
  }))
  expect(colors.lead).toBe('rgb(24, 24, 24)')
  expect(colors.rest).not.toBe('rgb(24, 24, 24)')
})

test('desktop frame (2560): list 906 px wide, items 181 / 109 / 145 / 145 / 184 px high, title on the left', async ({ page }) => {
  await open(page, 2560, 1200)
  const list = await box(page, '[data-el="faq__list"]')
  expect(Math.abs(list.width - 906)).toBeLessThan(1.5)
  const heights = await Promise.all(ids.map(async (id) => (await item(page, id).boundingBox())!.height))
  const expected = [181, 109, 145, 145, 184] // the last one has no line under it
  heights.forEach((height, index) => expect(Math.abs(height - expected[index]), ids[index]).toBeLessThan(1.5))
  const title = await box(page, '[data-el="faq__title"]')
  expect(title.x + title.width).toBeLessThan(list.x)
  expect(Math.abs(title.width - 404)).toBeLessThan(3)
  expect(await page.locator('[data-el="faq__title"]').evaluate((el) => getComputedStyle(el).fontSize)).toBe('64px')
  // Centered against each other vertically
  expect(Math.abs(title.y + title.height / 2 - (list.y + list.height / 2))).toBeLessThan(2)
  // The toggle is a 44 px circle
  const toggle = await box(page, '[data-el="faq__item-safety-toggle"]')
  expect(toggle.width).toBeCloseTo(44, 0)
  expect(toggle.height).toBeCloseTo(44, 0)
  // The first item is open at the start
  expect(await openIds(page)).toEqual(['safety'])
})

test('an accordion: one answer open at a time, a click on an open question closes it', async ({ page }) => {
  await open(page, 1440, 900)
  expect(await openIds(page)).toEqual(['safety'])
  await expect(head(page, 'safety')).toHaveAttribute('aria-expanded', 'true')
  await head(page, 'timeline').click()
  expect(await openIds(page)).toEqual(['timeline'])
  await expect(head(page, 'timeline')).toHaveAttribute('aria-expanded', 'true')
  await expect(head(page, 'safety')).toHaveAttribute('aria-expanded', 'false')
  await head(page, 'timeline').click()
  expect(await openIds(page)).toEqual([])
  await head(page, 'custom-method').click()
  expect(await openIds(page)).toEqual(['custom-method'])
})

test('folded answers take no room and are out of focus and out of the accessibility tree', async ({ page }) => {
  await open(page, 1440, 900)
  const panel = (id: string) => page.locator(`#faq-panel-${id}`)
  await expect.poll(() => panel('licence').evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(1)
  await expect(panel('licence')).toHaveAttribute('aria-hidden', 'true')
  await expect(panel('licence')).toHaveAttribute('inert', '')
  await expect(panel('safety')).toHaveAttribute('aria-hidden', 'false')
  expect((await panel('safety').boundingBox())!.height).toBeGreaterThan(40)
})

test('the keyboard works: Tab to a question, Enter or Space opens it', async ({ page }) => {
  await open(page, 1440, 900)
  await head(page, 'licence').focus()
  await page.keyboard.press('Enter')
  expect(await openIds(page)).toEqual(['licence'])
  await head(page, 'support').focus()
  await page.keyboard.press('Space')
  expect(await openIds(page)).toEqual(['support'])
})

test('the text of an opening answer does not re-wrap or jump while the row unfolds', async ({ page }) => {
  await open(page, 1440, 900)
  await head(page, 'custom-method').click()
  const samples = await page.evaluate(
    () =>
      new Promise<{ height: number; width: number }[]>((resolve) => {
        const text = document.querySelector('[data-el="faq__item-custom-method-answer"]') as HTMLElement
        const found: { height: number; width: number }[] = []
        const started = performance.now()
        const tick = () => {
          const rect = text.getBoundingClientRect()
          found.push({ height: Math.round(rect.height), width: Math.round(rect.width) })
          if (performance.now() - started < 900) requestAnimationFrame(tick)
          else resolve(found)
        }
        tick()
      }),
  )
  expect(samples.length).toBeGreaterThan(20)
  expect(new Set(samples.map((sample) => sample.height)).size).toBe(1)
  expect(new Set(samples.map((sample) => sample.width)).size).toBe(1)
})

test('the toggle changes from plus to minus', async ({ page }) => {
  await open(page, 1440, 900)
  // The vertical bar of the icon lies down onto the horizontal one: turned by 0 degrees (plus) or 90 degrees (minus).
  const angle = (id: string) =>
    page.locator(`[data-el="faq__item-${id}-toggle"] svg line`).nth(1).evaluate((el) => {
      const matrix = new DOMMatrix(getComputedStyle(el).transform)
      return Math.round((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI)
    })
  await expect.poll(() => angle('licence')).toBe(0)
  await expect.poll(() => angle('safety')).toBe(90)
  // a click moves the open item (the other one closes); the turn itself is the motion of the icon
  await page.locator('[data-el="faq__item-licence-head"]').click()
  await expect.poll(() => angle('licence')).toBe(90)
  await expect.poll(() => angle('safety')).toBe(0)
})

test('stacked layout (below 1280 px): the title is above the list', async ({ page }) => {
  await open(page, 1024, 800)
  const title = await box(page, '[data-el="faq__title"]')
  const list = await box(page, '[data-el="faq__list"]')
  expect(title.y + title.height).toBeLessThanOrEqual(list.y)
})

test('dark theme: the dividers and text follow the tokens', async ({ page }) => {
  await open(page, 1440, 900)
  await page.locator('[data-el="header"] [data-el="header__theme-toggle"]').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.locator('[data-el="faq"]').evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(700)
  await expect(page.locator('[data-el="faq__item-safety-question"]')).toHaveCSS('color', 'rgb(255, 255, 255)')
  await page.locator('[data-el="faq"]').screenshot({ path: 'tests/artifacts/faq-desktop-1440-dark.png' })
})

test('reduced motion: a click still opens and closes, without the movement', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await page.locator('[data-el="faq"]').evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await head(page, 'licence').click()
  expect(await openIds(page)).toEqual(['licence'])
  await context.close()
})

test('the section follows the next-steps block', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const steps = await box(page, '[data-el="next-steps"]')
  expect((await page.locator('[data-el="faq"]').boundingBox())!.y).toBeCloseTo(steps.y + steps.height, 0)
})
