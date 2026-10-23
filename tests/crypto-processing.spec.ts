import { expect, test, type Page } from '@playwright/test'
import { apiContent, cryptoProcessing, flowContent } from '../src/pages/crypto-processing/content'
import { formatAmount, settledAmount } from '../src/pages/crypto-processing/demo'
import { heroScene, journeyScene, testScene } from '../src/pages/crypto-processing/sceneText'

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

const toBlock = (page: Page, name: string) => page.locator(`[data-el="${name}"]`).evaluate((el) => el.scrollIntoView({ block: 'center' }))

// Texts and structure (the rest of the suite runs with the appearance animations off, see playwright.config.ts: the scenes stand still).

for (const viewport of viewports) {
  test(`crypto processing page ${viewport.name}: the hero scene and both blocks fit, no horizontal scroll`, async ({ page }) => {
    await open(page, viewport.width, viewport.height)
    for (const name of ['crypto-processing__hero__media', 'crypto-processing__flow', 'crypto-processing__api']) {
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
  await expect(page.locator('h1')).toHaveText(cryptoProcessing.hero.title.join(' '))
  const order = await page.locator('main > section').evaluateAll((els) => els.map((el) => el.getAttribute('data-el')))
  expect(order).toEqual(['crypto-processing__hero', 'logos', 'crypto-processing__flow', 'crypto-processing__api', 'industries', 'faq', 'cta'])
  await expect(page.locator('[data-el="cta__title"]')).toHaveText(cryptoProcessing.cta.title!)
  await expect(page.locator('[data-el="faq__list"] > li')).toHaveCount(cryptoProcessing.faq.items!.length)
  await expect(page.locator('[data-el="industries__list"] > li')).toHaveCount(cryptoProcessing.industries.items!.length)
  await expect(page).toHaveTitle(cryptoProcessing.meta.title)
  await expect(page.locator('[data-el="crypto-processing__flow-title"]')).toHaveText(flowContent.title)
  await expect(page.locator('[data-el="crypto-processing__api-title"]')).toHaveText(apiContent.title)
  const secondary = page.locator('[data-el="crypto-processing__hero__cta-secondary"]')
  await expect(secondary).toHaveAttribute('href', '#how-it-works')
  await expect(page.locator('#how-it-works')).toHaveAttribute('data-el', 'crypto-processing__flow')
})

test('block 1: a station opens its panel (click and arrow keys); the coin, the network and the sum picked on Accept are used by the next station', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'crypto-processing__flow')
  const station = (id: string) => page.locator(`[data-el="crypto-processing__flow-station-${id}"]`)
  await expect(station('accept')).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('[data-el="crypto-processing__flow-panel-accept"]')).toContainText(journeyScene.panels.accept.title)

  await page.getByRole('button', { name: 'DAI', exact: true }).click()
  await page.getByRole('button', { name: 'Polygon', exact: true }).click()
  await page.getByRole('button', { name: formatAmount(250), exact: true }).click()

  await station('convert').click()
  const convert = page.locator('[data-el="crypto-processing__flow-panel-convert"]')
  await expect(convert).toContainText(`${formatAmount(250)} DAI`)
  await expect(convert).toContainText(`${formatAmount(settledAmount(250))} EUR`)

  await station('convert').press('ArrowRight')
  await expect(station('settle')).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('[data-el="crypto-processing__flow-panel-settle"]')).toContainText(journeyScene.progress.settle.done)
  await station('settle').press('ArrowLeft')
  await expect(station('convert')).toHaveAttribute('aria-selected', 'true')

  // Block 2 shows the same choice in its request.
  await toBlock(page, 'crypto-processing__api')
  const code = page.locator('[data-el="crypto-processing__api-code"]')
  await expect(code).toContainText('"asset": "DAI"')
  await expect(code).toContainText('"network": "Polygon"')
  await expect(code).toContainText(`"amount": ${formatAmount(250)}`)
})

test('block 2 without motion stands in the final state: three events and the order marked as paid; the button starts again', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'crypto-processing__api')
  for (const event of testScene.events) {
    await expect(page.locator(`[data-el="crypto-processing__api-feed-${event.id}"]`)).toContainText(event.name)
    await expect(page.locator(`[data-el="crypto-processing__api-log-${event.id}"]`)).toHaveText(event.log)
  }
  await expect(page.locator('[data-el="crypto-processing__api-send"]')).toHaveText(testScene.replay)
  await page.locator('[data-el="crypto-processing__api-send"]').click()
  await expect(page.locator('[data-el="crypto-processing__api-log-settled"]')).toBeVisible()
})

test('the home page still shows its own texts in the shared blocks', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-el="cta__title"]')).toHaveText("Tell us what you're building.")
  await expect(page.locator('[data-el="faq__title"]')).toHaveText('Still have questions?')
})

// The scenes at work: the appearance animations are ON here.
test.describe('with motion', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('hero map: the button sends a payment that goes Waiting → Confirmed → Settled', async ({ page }) => {
    await open(page, 1440, 900)
    await toBlock(page, 'crypto-processing__hero__media')
    const status = page.locator('[data-el="crypto-processing__hero-scene-status"]')
    await page.locator('[data-el="crypto-processing__hero-scene-send"]').click()
    await expect(status).toHaveAttribute('data-status', 'waiting')
    await expect(status).toHaveAttribute('data-status', 'confirmed', { timeout: 6000 })
    await expect(status).toHaveAttribute('data-status', 'settled', { timeout: 6000 })
    await expect(page.locator('[data-el="crypto-processing__hero-scene-hint"]')).toHaveText(heroScene.hintAgain)
  })

  test('hero map: a click on the map sends a payment from that place', async ({ page }) => {
    await open(page, 1440, 900)
    await toBlock(page, 'crypto-processing__hero__media')
    const canvas = page.locator('[data-el="crypto-processing__hero-scene-illustration"] canvas')
    const box = (await canvas.boundingBox())!
    await canvas.click({ position: { x: box.width * 0.2, y: box.height * 0.5 } })
    await expect(page.locator('[data-el="crypto-processing__hero-scene-status"]')).toHaveAttribute('data-status', 'waiting')
    await expect(page.locator('[data-el="crypto-processing__hero-scene-status"]')).toHaveAttribute('data-status', 'settled', { timeout: 8000 })
  })

  test('hero map: the panel names the place, the payment id and the steps; the landed payment joins the recent ones', async ({ page }) => {
    await open(page, 1440, 900)
    await toBlock(page, 'crypto-processing__hero__media')
    const canvas = page.locator('[data-el="crypto-processing__hero-scene-illustration"] canvas')
    const box = (await canvas.boundingBox())!
    const recent = page.locator('[data-el="crypto-processing__hero-scene-recent"] li')
    await expect(recent).toHaveCount(3, { timeout: 12000 })
    const before = await page.locator('[data-el="crypto-processing__hero-scene-id"]').textContent()
    // The click at the left edge of the map is North America.
    await canvas.click({ position: { x: box.width * 0.2, y: box.height * 0.3 } })
    await expect(page.locator('[data-el="crypto-processing__hero-scene-id"]')).not.toHaveText(before!)
    await expect(page.locator('[data-el="crypto-processing__hero-scene-id"]')).toHaveText(/^pay_[0-9a-f]{6}$/)
    await expect(page.locator('[data-el="crypto-processing__hero-scene-route"]')).toContainText('From North America')
    await expect(page.locator('[data-el="crypto-processing__hero-scene-status"]')).toHaveAttribute('data-status', 'settled', { timeout: 8000 })
    await expect(recent.first()).toContainText('North America')
  })

  test('block 1: every station writes its log; Play writes it again at once', async ({ page }) => {
    await open(page, 1440, 900)
    await toBlock(page, 'crypto-processing__flow')
    const log = (id: string) => page.locator(`[data-el="crypto-processing__flow-log-${id}"]`)
    await expect(log('accept')).toHaveAttribute('data-done', 'false')
    await expect(log('accept')).toHaveAttribute('data-done', 'true', { timeout: 6000 })
    await expect(log('accept')).toContainText('payment.confirmed')
    // The visitor stops the round on Convert: its log is written, and the round stays there.
    await page.locator('[data-el="crypto-processing__flow-station-convert"]').click()
    await expect(log('convert')).toHaveAttribute('data-done', 'true', { timeout: 6000 })
    await expect(log('convert')).toContainText(`${formatAmount(1000)} USDT → ${formatAmount(settledAmount(1000))} EUR`)
    // Play: the log starts over right away.
    await page.locator('[data-el="crypto-processing__flow-play"]').click()
    await expect(log('convert')).toHaveAttribute('data-done', 'false')
  })

  test('block 1 plays by itself while seen, and stops when the visitor picks a station', async ({ page }) => {
    await open(page, 1440, 900)
    await toBlock(page, 'crypto-processing__flow')
    const accept = page.locator('[data-el="crypto-processing__flow-station-accept"]')
    const convert = page.locator('[data-el="crypto-processing__flow-station-convert"]')
    await expect(convert).toHaveAttribute('aria-selected', 'true', { timeout: 8000 })
    await expect(page.locator('[data-el="crypto-processing__flow-play"]')).toHaveText(journeyScene.pause)
    await accept.click()
    await expect(page.locator('[data-el="crypto-processing__flow-play"]')).toHaveText(journeyScene.play)
    await page.waitForTimeout(4500)
    await expect(accept).toHaveAttribute('aria-selected', 'true')
  })

  test('block 2 runs by itself once when seen: the events come one after another and the log ends with "marked as paid"', async ({ page }) => {
    await open(page, 1440, 900)
    await toBlock(page, 'crypto-processing__api')
    const log = (id: string) => page.locator(`[data-el="crypto-processing__api-log-${id}"]`)
    await expect(log('created')).toBeVisible({ timeout: 6000 })
    await expect(log('settled')).toBeHidden()
    await expect(log('confirmed')).toBeVisible({ timeout: 6000 })
    await expect(log('settled')).toBeVisible({ timeout: 6000 })
    await expect(page.locator('[data-el="crypto-processing__api-send"]')).toHaveText(testScene.replay)
    // Replay: the feed empties and fills again.
    await page.locator('[data-el="crypto-processing__api-send"]').click()
    await expect(page.locator('[data-el="crypto-processing__api-send"]')).toHaveText(testScene.sending)
    await expect(log('settled')).toBeVisible({ timeout: 8000 })
  })

  test('reduced motion: nothing plays by itself, the scenes show the final state', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await open(page, 1440, 900)
    await toBlock(page, 'crypto-processing__flow')
    await expect(page.locator('[data-el="crypto-processing__flow-play"]')).toHaveCount(0)
    await page.waitForTimeout(3800)
    await expect(page.locator('[data-el="crypto-processing__flow-station-accept"]')).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('[data-el="crypto-processing__hero-scene-status"]')).toHaveAttribute('data-status', 'settled')
    await toBlock(page, 'crypto-processing__api')
    await expect(page.locator('[data-el="crypto-processing__api-log-settled"]')).toBeVisible()
  })
})
