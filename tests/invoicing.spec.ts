import { expect, test, type Page } from '@playwright/test'
import { factsContent, invoicing, stepsContent } from '../src/pages/invoicing/content'
import { formatMoney, INVOICE_NO, totals, type Draft } from '../src/pages/invoicing/demo'

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
  await page.goto('/invoicing')
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.evaluate(() => document.fonts.ready)
}

const toBlock = (page: Page, name: string) => page.locator(`[data-el="${name}"]`).evaluate((el) => el.scrollIntoView({ block: 'center' }))

// The scenes stand in their final state in this suite (the appearance animations are off, see playwright.config.ts); the last test plays them.

for (const viewport of viewports) {
  test(`invoicing page ${viewport.name}: the hero scene and the three steps fit, no horizontal scroll`, async ({ page }) => {
    await open(page, viewport.width, viewport.height)
    for (const name of ['invoicing__hero__media', 'invoicing__step-create', 'invoicing__step-send', 'invoicing__step-get-paid']) {
      await toBlock(page, name)
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
  await expect(page.locator('h1')).toHaveText(invoicing.hero.title.join(' '))
  const order = await page.locator('main > section').evaluateAll((els) => els.map((el) => el.getAttribute('data-el')))
  expect(order).toEqual(['invoicing__hero', 'invoicing__steps', 'invoicing__facts', 'works-with', 'industries', 'faq', 'cta'])
  for (const fact of factsContent.items) {
    await expect(page.locator(`[data-el="invoicing__fact-${fact.id}-value"]`)).toHaveText(fact.value)
    await expect(page.locator(`[data-el="invoicing__fact-${fact.id}-text"]`)).toHaveText(fact.text)
  }
  await expect(page.locator('[data-el="cta__title"]')).toHaveText(invoicing.cta.title!)
  await expect(page.locator('[data-el="faq__list"] > li')).toHaveCount(invoicing.faq.items!.length)
  await expect(page.locator('[data-el="industries__list"] > li')).toHaveCount(invoicing.industries.items!.length)
  await expect(page).toHaveTitle(invoicing.meta.title)
  await expect(page.locator('[data-el="invoicing__steps-title"]')).toHaveText(stepsContent.title)
  for (const step of stepsContent.steps) await expect(page.locator(`[data-el="invoicing__step-${step.id}-title"]`)).toHaveText(step.title)
  await expect(page.locator('[data-el="invoicing__hero__cta-secondary"]')).toHaveAttribute('href', '#how-it-works')
  await expect(page.locator('#how-it-works')).toHaveAttribute('data-el', 'invoicing__steps')
})

test('the sums add up: the total in the coin does not depend on the currency of the invoice', () => {
  const base: Draft = { currency: 'EUR', items: ['media', 'creative', 'reporting'], due: 14, tax: true }
  expect(totals(base)).toMatchObject({ subtotal: 2000, taxAmount: 400, total: 2400, coin: 2608.7 })
  expect(totals({ ...base, tax: false })).toMatchObject({ total: 2000, coin: 2173.91 })
  expect(totals({ ...base, items: ['media', 'creative'] })).toMatchObject({ total: 2160, coin: 2347.83 })
  for (const currency of ['GBP', 'BRL', 'INR', 'AED'] as const) expect(totals({ ...base, currency }).coin).toBe(2608.7)
})

test('hero: a click on an invoice opens it in two currencies; "New invoice" puts a new one on top', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'invoicing__hero__media')
  const detail = page.locator('[data-el="invoicing__hero-scene-detail"]')
  await expect(detail).toContainText(INVOICE_NO)
  await expect(detail).toContainText('EUR')
  await expect(detail).toContainText('2,608.70 USDT')

  await page.locator('[data-invoice="INV-1040"]').click()
  await expect(detail).toContainText('INV-1040')
  await expect(detail).toContainText('Harbor Labs')
  await expect(detail).toContainText('BRL')
  await expect(detail).toContainText('USDT')

  await page.locator('[data-el="invoicing__hero-scene-new"]').click()
  const first = page.locator('[data-el="invoicing__hero-scene-rows"] button').first()
  await expect(first).toHaveAttribute('data-invoice', 'INV-1043')
  await expect(detail).toContainText('INV-1043')
})

test('step 1: the currency, the items and the tax recount both totals; "Create invoice" gives the link', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'invoicing__step-create')
  const sheet = page.locator('[data-el="invoicing__step-create-sheet"]')
  await expect(sheet).toContainText('EUR')
  await expect(sheet).toContainText('2,400.00')
  await expect(sheet).toContainText('2,608.70 USDT')

  await page.getByRole('button', { name: 'BRL', exact: true }).click()
  await expect(sheet).toContainText('BRL')
  await expect(sheet).toContainText('14,347.82')
  await expect(sheet).toContainText('2,608.70 USDT')

  await page.locator('[data-item="reporting"]').click()
  await expect(sheet).not.toContainText('Reporting dashboard')
  await expect(sheet).toContainText('2,347.83 USDT')

  await page.getByRole('button', { name: 'Tax 20%' }).click()
  await expect(sheet).toContainText('1,956.52 USDT')

  await page.locator('[data-el="invoicing__step-create-button"]').click()
  await expect(page.locator('[data-el="invoicing__step-create-result"]')).toContainText('pay.velantpay.com/inv-1042')
  // A changed invoice has to be created again.
  await page.getByRole('button', { name: '30 days' }).click()
  await expect(page.locator('[data-el="invoicing__step-create-button"]')).toBeVisible()
})

test('steps 2 and 3 use the invoice built in step 1; the channel changes the target', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'invoicing__step-create')
  await page.getByRole('button', { name: 'GBP', exact: true }).click()
  const gbp = totals({ currency: 'GBP', items: ['media', 'creative', 'reporting'], due: 14, tax: true })

  await toBlock(page, 'invoicing__step-send')
  const send = page.locator('[data-el="invoicing__step-send-illustration"]')
  await expect(page.locator('[data-el="invoicing__step-send-page"]')).toContainText('GBP')
  await expect(send.locator('[data-event]')).toHaveCount(3)
  await expect(send.locator('[data-el="invoicing__step-send-eye"]')).toBeVisible()
  await send.getByRole('button', { name: 'Email', exact: true }).click()
  await expect(send.locator('[data-el="invoicing__step-send-target"]')).toHaveText('Northwind Media')
  await send.getByRole('button', { name: 'PDF', exact: true }).click()
  await expect(send.locator('[data-el="invoicing__step-send-target"]')).toHaveText(`${INVOICE_NO}.pdf`)

  await toBlock(page, 'invoicing__step-get-paid')
  const pay = page.locator('[data-el="invoicing__step-get-paid-illustration"]')
  await expect(pay).toContainText(`GBP ${formatMoney(gbp.total)}`)
  await expect(pay.locator('[data-el="invoicing__step-pay-status"]')).toContainText('Reconciled')
  await expect(pay.locator('[data-invoice="INV-1042"] [data-status="reconciled"]')).toBeVisible()
  await expect(pay.locator('[data-el="invoicing__step-pay-log"]')).toContainText('invoice.reconciled')
})

test.describe('with the appearance animations on', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('the hero cabinet lives by itself: statuses go on and the received sum grows; the steps play when seen', async ({ page }) => {
    await open(page, 1440, 900)
    await toBlock(page, 'invoicing__hero__media')
    const received = page.locator('[data-el="invoicing__hero-scene-received"]')
    const before = await received.textContent()
    // One invoice goes through its statuses in a few steps, then the next one joins the list.
    await expect.poll(async () => received.textContent(), { timeout: 15000 }).not.toBe(before)
    await expect
      .poll(async () => page.locator('[data-el="invoicing__hero-scene-rows"] button').first().getAttribute('data-invoice'), { timeout: 15000 })
      .not.toBe('INV-1042')

    await toBlock(page, 'invoicing__step-get-paid')
    await expect(page.locator('[data-el="invoicing__step-pay-status"]')).toHaveAttribute('data-done', 'true', { timeout: 15000 })
  })
})
