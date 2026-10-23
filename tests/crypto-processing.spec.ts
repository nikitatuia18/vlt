import { expect, test, type Page } from '@playwright/test'
import { apiContent, cryptoProcessing, flowContent } from '../src/pages/crypto-processing/content'

const viewports = [
  { name: 'mobile-393', width: 393, height: 850 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 800 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-2560', width: 2560, height: 1200 },
]

const open = async (page: Page, width: number, height: number) => {
  await page.setViewportSize({ width, height })
  await page.goto('/crypto-processing')
  await page.evaluate(() => document.fonts.ready)
}

for (const viewport of viewports) {
  test(`crypto processing page ${viewport.name}: both blocks fit, no horizontal scroll`, async ({ page }) => {
    await open(page, viewport.width, viewport.height)
    for (const name of ['crypto-processing__flow', 'crypto-processing__api']) {
      await page.locator(`[data-el="${name}"]`).evaluate((el) => el.scrollIntoView({ block: 'center' }))
      await page.waitForTimeout(300)
      await page.locator(`[data-el="${name}"]`).screenshot({ path: `tests/artifacts/${name}-${viewport.name}.png` })
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBe(0)
  })
}

test('the page has one h1, the blocks stand in the planned order and the shared blocks carry the texts of the product', async ({ page }) => {
  await open(page, 1440, 900)
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toHaveText(cryptoProcessing.hero.title.join(' '))
  // The order: hero, logos, the two blocks about the product, industries, faq, cta.
  const order = await page.locator('main > section').evaluateAll((els) => els.map((el) => el.getAttribute('data-el')))
  expect(order).toEqual(['crypto-processing__hero', 'logos', 'crypto-processing__flow', 'crypto-processing__api', 'industries', 'faq', 'cta'])
  await expect(page.locator('[data-el="cta__title"]')).toHaveText(cryptoProcessing.cta.title!)
  await expect(page.locator('[data-el="faq__list"] > li')).toHaveCount(cryptoProcessing.faq.items!.length)
  await expect(page.locator('[data-el="industries__list"] > li')).toHaveCount(cryptoProcessing.industries.items!.length)
  await expect(page).toHaveTitle(cryptoProcessing.meta.title)
})

test('block 1 names the three steps, block 2 the three events; the second hero button leads to block 1', async ({ page }) => {
  await open(page, 1440, 900)
  for (const step of flowContent.steps) {
    await expect(page.locator(`[data-el="crypto-processing__flow-step-${step.id}-title"]`)).toHaveText(step.title)
    await expect(page.locator(`[data-el="crypto-processing__flow-step-${step.id}-text"]`)).toHaveText(step.text)
  }
  for (const event of apiContent.events) {
    await expect(page.locator(`[data-el="crypto-processing__api-feed-event-${event.id}"]`)).toHaveText(event.name)
  }
  const secondary = page.locator('[data-el="crypto-processing__hero__cta-secondary"]')
  await expect(secondary).toHaveAttribute('href', '#how-it-works')
  await expect(page.locator('#how-it-works')).toHaveAttribute('data-el', 'crypto-processing__flow')
})

test('the tabs of the code window switch the code', async ({ page }) => {
  await open(page, 1440, 900)
  const code = page.locator('[data-el="crypto-processing__api-code"] pre')
  await expect(code).toContainText('POST /v1/payments')
  await page.locator('[data-el="crypto-processing__api-tab-webhook"]').click()
  await expect(code).toContainText('payment.confirmed')
  await expect(page.locator('[data-el="crypto-processing__api-tab-webhook"]')).toHaveAttribute('aria-selected', 'true')
})

test('the home page still shows its own texts in the shared blocks', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-el="cta__title"]')).toHaveText("Tell us what you're building.")
  await expect(page.locator('[data-el="faq__title"]')).toHaveText('Still have questions?')
})
