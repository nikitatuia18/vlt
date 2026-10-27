import { expect, test, type Page } from '@playwright/test'
import { bookDemo } from '../src/pages/book-a-demo/content'

const viewports = [
  { name: 'mobile-393', width: 393, height: 850 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 800 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-2560', width: 2560, height: 1200 },
]

const el = (page: Page, name: string) => page.locator(`[data-el="${name}"]`)

/** The widget of Calendly is replaced by a stand-in that only puts a mark into the place it is given and remembers the address. */
const fakeCalendly = async (page: Page) => {
  await page.route('https://assets.calendly.com/assets/external/widget.css', (route) => route.fulfill({ contentType: 'text/css', body: '' }))
  await page.route('https://assets.calendly.com/assets/external/widget.js', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: `window.Calendly = { initInlineWidget: ({ url, parentElement }) => {
        window.__calendlyUrl = url
        const mark = document.createElement('div')
        mark.setAttribute('data-el', 'fake-calendly')
        mark.textContent = 'calendar'
        parentElement.append(mark)
      } }`,
    }),
  )
}

const message = (page: Page, origin: string, event: string) =>
  page.evaluate(([from, name]) => window.dispatchEvent(new MessageEvent('message', { origin: from, data: { event: name } })), [origin, event])

const open = async (page: Page, width: number, height: number) => {
  await page.setViewportSize({ width, height })
  await page.goto('/book-a-demo')
  await expect(page.locator('h1')).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
}

for (const viewport of viewports) {
  test(`book a demo ${viewport.name}: the text and the card fit, no horizontal scroll`, async ({ page }) => {
    await open(page, viewport.width, viewport.height)
    await page.waitForTimeout(400)
    await el(page, 'book-a-demo').screenshot({ path: `tests/artifacts/book-a-demo-${viewport.name}.png` })
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
    // From the desktop width the card stands beside the text, below it under the text.
    const text = (await el(page, 'book-a-demo__list-block').boundingBox())!
    const card = (await el(page, 'book-a-demo__card').boundingBox())!
    if (viewport.width >= 1280) expect(card.x).toBeGreaterThan(text.x + text.width - 1)
    else expect(card.y).toBeGreaterThan(text.y + text.height)
  })
}

test('the texts of the brief, one h1, the order of the blocks', async ({ page }) => {
  await open(page, 1440, 900)
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toHaveText(bookDemo.title)
  await expect(el(page, 'book-a-demo__list-title')).toHaveText(bookDemo.listTitle)
  await expect(page.locator('[data-el="book-a-demo__list"] > li')).toHaveText([...bookDemo.list])
  await expect(el(page, 'book-a-demo__steps-title')).toHaveText(bookDemo.stepsTitle)
  await expect(page.locator('[data-el="book-a-demo__steps"] > li')).toHaveText(bookDemo.steps.map((step) => `${step.label}${step.text}`))
  await expect(el(page, 'book-a-demo__cta')).toHaveText(bookDemo.card.button)
  await expect(page).toHaveTitle(bookDemo.meta.title)
  const order = await page.locator('main > section').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-el')))
  expect(order).toEqual(['book-a-demo'])
})

test('the buttons of the site lead here: the header, the hero and the banner of the home page', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await expect(el(page, 'header__cta-primary')).toHaveAttribute('href', '/book-a-demo')
  await expect(el(page, 'hero__cta-primary')).toHaveAttribute('href', '/book-a-demo')
  await expect(el(page, 'cta__cta-primary')).toHaveAttribute('href', '/book-a-demo')
  await page.goto('/crypto-processing')
  await expect(el(page, 'crypto-processing__hero__cta-primary')).toHaveAttribute('href', '/book-a-demo')
})

test('the button opens the calendar of Calendly in the card, with the colors of the site', async ({ page }) => {
  await fakeCalendly(page)
  await open(page, 1440, 900)
  // Nothing of Calendly is loaded before the click.
  expect(await page.evaluate(() => 'Calendly' in window)).toBe(false)
  await el(page, 'book-a-demo__cta').click()
  await expect(el(page, 'book-a-demo__card')).toHaveAttribute('data-state', 'calendar')
  await expect(el(page, 'fake-calendly')).toBeAttached()
  const url = new URL(await page.evaluate(() => (window as unknown as { __calendlyUrl: string }).__calendlyUrl))
  expect(url.searchParams.get('hide_gdpr_banner')).toBe('1')
  expect(url.searchParams.get('background_color')).toBe('ffffff') // surface/subtle, Light
  expect(url.searchParams.get('text_color')).toBe('181818') // typography/primary
  expect(url.searchParams.get('primary_color')).toBe('b63b12') // surface/brand-default
  // The veil of the loading comes off when the calendar says it is shown.
  await message(page, 'https://calendly.com', 'calendly.event_type_viewed')
  await expect(el(page, 'book-a-demo__calendar').locator('output')).toHaveCount(0)
  await el(page, 'book-a-demo').screenshot({ path: 'tests/artifacts/book-a-demo-calendar-1440.png' })
})

test('after the booking the card says it: booked, check the mail, see you on the call', async ({ page }) => {
  await fakeCalendly(page)
  await open(page, 1440, 900)
  await el(page, 'book-a-demo__cta').click()
  await expect(el(page, 'book-a-demo__card')).toHaveAttribute('data-state', 'calendar')
  await message(page, 'https://calendly.com', 'calendly.event_scheduled')
  await expect(el(page, 'book-a-demo__card')).toHaveAttribute('data-state', 'booked')
  await expect(el(page, 'book-a-demo__booked-title')).toHaveText(bookDemo.card.bookedTitle)
  await expect(el(page, 'book-a-demo__booked-text')).toHaveText(bookDemo.card.bookedText)
  await expect(el(page, 'fake-calendly')).toHaveCount(0)
  await expect(el(page, 'book-a-demo__booked')).toBeFocused()
  await expect(el(page, 'book-a-demo__booked')).toHaveAttribute('aria-live', 'polite')
  await page.waitForTimeout(900)
  await el(page, 'book-a-demo').screenshot({ path: 'tests/artifacts/book-a-demo-booked-1440.png' })
})

test('messages from other senders and other messages do not book anything', async ({ page }) => {
  await fakeCalendly(page)
  await open(page, 1440, 900)
  await el(page, 'book-a-demo__cta').click()
  await expect(el(page, 'book-a-demo__card')).toHaveAttribute('data-state', 'calendar')
  await message(page, 'https://evil.example', 'calendly.event_scheduled')
  await message(page, 'https://calendly.com', 'calendly.date_and_time_selected')
  await page.waitForTimeout(200)
  await expect(el(page, 'book-a-demo__card')).toHaveAttribute('data-state', 'calendar')
})

test('when the widget cannot load the card offers the calendar in a new tab', async ({ page }) => {
  await page.route('https://assets.calendly.com/**', (route) => route.abort())
  await open(page, 1440, 900)
  await el(page, 'book-a-demo__cta').click()
  await expect(el(page, 'book-a-demo__card')).toHaveAttribute('data-state', 'error')
  await expect(el(page, 'book-a-demo__fallback')).toHaveAttribute('target', '_blank')
  await expect(el(page, 'book-a-demo__fallback')).toHaveAttribute('href', /^https:\/\/calendly\.com\//)
})

test('on a phone the click brings the card to the screen; Dark theme', async ({ page }) => {
  await fakeCalendly(page)
  await open(page, 393, 850)
  await el(page, 'book-a-demo__cta').evaluate((node) => node.scrollIntoView({ block: 'end' }))
  await el(page, 'book-a-demo__cta').click()
  await expect(el(page, 'book-a-demo__card')).toHaveAttribute('data-state', 'calendar')
  await expect
    .poll(async () => (await el(page, 'book-a-demo__card').boundingBox())!.y, { timeout: 4000 })
    .toBeLessThan(200)

  await page.goto('/book-a-demo')
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
  await page.waitForTimeout(600)
  await el(page, 'book-a-demo').screenshot({ path: 'tests/artifacts/book-a-demo-mobile-393-dark.png' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
})
