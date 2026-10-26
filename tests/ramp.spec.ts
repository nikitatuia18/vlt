import { expect, test, type Page } from '@playwright/test'
import { quoteContent, ramp, routesContent } from '../src/pages/ramp/content'
import { crypto, fiat, formatRate, quote } from '../src/pages/ramp/demo'
import { directionText, quoteScene } from '../src/pages/ramp/sceneText'

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
  await page.goto('/ramp')
  await page.evaluate(() => document.fonts.ready)
}

const toBlock = (page: Page, name: string) => page.locator(`[data-el="${name}"]`).evaluate((node) => node.scrollIntoView({ block: 'center' }))
const el = (page: Page, name: string) => page.locator(`[data-el="${name}"]`)

// The numbers of the page are the ones of the table of docs/pages/ramp.md ("Формат демо-данных").
test('the arithmetic of the demo: the fee comes off the sum that is sent, the rest is converted', () => {
  expect(quote('on', 1000, 0.92)).toMatchObject({ fee: 5, net: 995, get: 1081.52 })
  expect(quote('off', 1000, 0.92)).toMatchObject({ fee: 5, net: 995, get: 915.4 })
  expect(quote('on', 500, 0.92).get).toBe(540.76)
  expect(quote('on', 2500, 0.92).get).toBe(2703.8)
  expect(quote('on', 10000, 0.92).get).toBe(10815.22)
  expect(quote('off', 500, 0.92).get).toBe(457.7)
  expect(quote('off', 10000, 0.92).get).toBe(9154)
  expect(quote('on', 1234.56, 0.92).fee).toBe(6.17)
  expect(fiat('EUR', 1000)).toBe('EUR 1,000.00')
  expect(crypto(1081.52)).toBe('1,081.52 USDT')
  expect(formatRate(0.92)).toBe('0.92')
  expect(formatRate(0.9187, true)).toBe('0.9187')
})

for (const viewport of viewports) {
  test(`ramp page ${viewport.name}: the hero scene and both blocks fit, no horizontal scroll`, async ({ page }) => {
    await open(page, viewport.width, viewport.height)
    for (const name of ['ramp__hero__media', 'ramp__routes', 'ramp__quote']) {
      await toBlock(page, name)
      await page.waitForTimeout(400)
      await page.locator(`[data-el="${name}"]`).screenshot({ path: `tests/artifacts/${name}-${viewport.name}.png` })
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBe(0)
  })
}

test('the page has one h1, the blocks stand in the planned order and the shared blocks carry the texts of the product', async ({ page }) => {
  await open(page, 1440, 900)
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toHaveText(ramp.hero.title.join(' '))
  const order = await page.locator('main > section').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-el')))
  expect(order).toEqual(['ramp__hero', 'logos', 'ramp__routes', 'ramp__quote', 'industries', 'faq', 'cta'])
  await expect(el(page, 'cta__title')).toHaveText(ramp.cta.title!)
  await expect(page.locator('[data-el="faq__list"] > li')).toHaveCount(ramp.faq.items!.length)
  await expect(page.locator('[data-el="industries__list"] > li')).toHaveCount(ramp.industries.items!.length)
  await expect(page).toHaveTitle(ramp.meta.title)
  await expect(el(page, 'ramp__routes-title')).toHaveText(routesContent.title)
  await expect(el(page, 'ramp__quote-title')).toHaveText(quoteContent.title)
  await expect(el(page, 'ramp__hero__cta-secondary')).toHaveAttribute('href', '#how-it-works')
  await expect(page.locator('#how-it-works')).toHaveAttribute('data-el', 'ramp__routes')
})

test('hero: the receipt says it in words, the switch turns the way round, the amount changes the numbers', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'ramp__hero__media')
  await expect(el(page, 'ramp__hero-scene-direction-on')).toHaveAttribute('aria-pressed', 'true')
  await expect(el(page, 'ramp__hero-scene-direction-caption')).toHaveText(directionText.on.caption)
  await expect(el(page, 'ramp__hero-scene-amount')).toHaveValue('1,000.00')
  await expect(el(page, 'ramp__hero-scene-send')).toHaveText('EUR 1,000.00')
  await expect(el(page, 'ramp__hero-scene-fee')).toHaveText('EUR 5.00')
  await expect(el(page, 'ramp__hero-scene-rate')).toHaveText('1 USDT = EUR 0.92')
  await expect(el(page, 'ramp__hero-scene-get')).toHaveText('1,081.52 USDT')

  await el(page, 'ramp__hero-scene-direction-off').click()
  await expect(el(page, 'ramp__hero-scene-direction-caption')).toHaveText(directionText.off.caption)
  await expect(el(page, 'ramp__hero-scene-send')).toHaveText('1,000.00 USDT')
  await expect(el(page, 'ramp__hero-scene-fee')).toHaveText('5.00 USDT')
  await expect(el(page, 'ramp__hero-scene-get')).toHaveText('EUR 915.40')

  await el(page, 'ramp__hero-scene-amount').fill('2500')
  await expect(el(page, 'ramp__hero-scene-fee')).toHaveText('12.50 USDT')
  await expect(el(page, 'ramp__hero-scene-get')).toHaveText('EUR 2,288.50')

  await el(page, 'ramp__hero-scene-amount').fill('')
  await expect(el(page, 'ramp__hero-scene-get')).toHaveText('–')
})

test('the picture of the hero is drawn: the canvas is not empty', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'ramp__hero__media')
  await page.waitForTimeout(400)
  const painted = await page.locator('[data-el="ramp__hero-scene-illustration"] canvas').evaluate((canvas: HTMLCanvasElement) => {
    const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data
    let colored = 0
    for (let index = 3; index < data.length; index += 4) if (data[index] > 0) colored++
    return colored
  })
  expect(painted).toBeGreaterThan(3000)
})

test('routes: the chosen rail and network make the route and the line under the scene; the direction turns it', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'ramp__routes')
  await expect(page.locator('[data-el^="ramp__routes-rail-"]')).toHaveCount(9)
  await expect(page.locator('[data-el^="ramp__routes-network-"]')).toHaveCount(3)
  await expect(el(page, 'ramp__routes-summary')).toHaveText('EUR via SEPA → USDT on Tron')
  await expect(el(page, 'ramp__routes-plug-bank')).toHaveCount(1)
  await expect(el(page, 'ramp__routes-plug-network')).toHaveCount(1)
  const painted = await el(page, 'ramp__routes-cables').evaluate((canvas: HTMLCanvasElement) => {
    const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data
    let colored = 0
    for (let index = 3; index < data.length; index += 4) if (data[index] > 0) colored++
    return colored
  })
  expect(painted).toBeGreaterThan(200)

  await el(page, 'ramp__routes-rail-br').click()
  await el(page, 'ramp__routes-network-ethereum').click()
  await expect(el(page, 'ramp__routes-rail-br')).toHaveAttribute('aria-pressed', 'true')
  await expect(el(page, 'ramp__routes-summary')).toHaveText('BRL via Pix → USDT on Ethereum')
  await expect(el(page, 'ramp__routes-door-caption')).toHaveText('BRL → USDT')

  await el(page, 'ramp__routes-direction-off').click()
  await expect(el(page, 'ramp__routes-summary')).toHaveText('USDT on Ethereum → BRL via Pix')
  await expect(el(page, 'ramp__routes-door-caption')).toHaveText('USDT → BRL')
  await expect(el(page, 'ramp__routes-direction-caption')).toHaveText(directionText.off.caption)
})

test('the scenes are independent: a choice in one does not change the others', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'ramp__routes')
  await el(page, 'ramp__routes-rail-br').click()
  await el(page, 'ramp__routes-network-polygon').click()
  await el(page, 'ramp__routes-direction-off').click()
  await toBlock(page, 'ramp__quote')
  await expect(el(page, 'ramp__quote-direction-on')).toHaveAttribute('aria-pressed', 'true')
  await expect(el(page, 'ramp__quote-amount')).toHaveValue('1,000.00')
  await expect(el(page, 'ramp__quote-row-get')).toHaveText('1,081.52 USDT')
  await el(page, 'ramp__quote-direction-off').click()
  await toBlock(page, 'ramp__hero__media')
  await expect(el(page, 'ramp__hero-scene-direction-on')).toHaveAttribute('aria-pressed', 'true')
  await expect(el(page, 'ramp__hero-scene-get')).toHaveText('1,081.52 USDT')
  await toBlock(page, 'ramp__routes')
  await expect(el(page, 'ramp__routes-summary')).toHaveText('USDT on Polygon → BRL via Pix')
})

test('quote: Lock holds the price, Confirm makes the transfer, New quote starts over', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'ramp__quote')
  await expect(el(page, 'ramp__quote-status')).toHaveAttribute('data-status', 'live')
  await expect(el(page, 'ramp__quote-row-get')).toHaveText('1,081.52 USDT')

  await el(page, 'ramp__quote-lock').click()
  await expect(el(page, 'ramp__quote-status')).toHaveAttribute('data-status', 'locked')
  await expect(el(page, 'ramp__quote-timer')).toContainText(quoteScene.lockedFor('0:30'))
  await expect(el(page, 'ramp__quote-amount')).toHaveAttribute('readonly', '')
  await expect(el(page, 'ramp__quote-row-rate')).toHaveText('1 USDT = EUR 0.9200')

  await el(page, 'ramp__quote-confirm').click()
  await expect(el(page, 'ramp__quote-status')).toHaveAttribute('data-status', 'done')
  await expect(el(page, 'ramp__quote-result')).toContainText('EUR 1,000.00 became 1,081.52 USDT in your wallet.')

  await el(page, 'ramp__quote-new').click()
  await expect(el(page, 'ramp__quote-status')).toHaveAttribute('data-status', 'live')

  // The other direction: the result is in the bank account.
  await el(page, 'ramp__quote-direction-off').click()
  await el(page, 'ramp__quote-lock').click()
  await el(page, 'ramp__quote-confirm').click()
  await expect(el(page, 'ramp__quote-result')).toContainText('1,000.00 USDT became EUR 915.40 in your bank account.')
})

test('quote: Cancel lets the price go; when the 30 seconds run out the quote updates by itself', async ({ page }) => {
  await page.clock.install()
  await open(page, 1440, 900)
  await toBlock(page, 'ramp__quote')
  await el(page, 'ramp__quote-lock').click()
  await el(page, 'ramp__quote-cancel').click()
  await expect(el(page, 'ramp__quote-status')).toHaveAttribute('data-status', 'live')

  await el(page, 'ramp__quote-lock').click()
  await page.clock.runFor(10_000)
  await expect(el(page, 'ramp__quote-timer')).toContainText(quoteScene.lockedFor('0:20'))
  await page.clock.runFor(21_000)
  await expect(el(page, 'ramp__quote-status')).toHaveAttribute('data-status', 'live')
  await expect(el(page, 'ramp__quote-expired')).toHaveText(quoteScene.expired)
})

test('the home page still shows its own texts in the shared blocks', async ({ page }) => {
  await page.goto('/')
  await expect(el(page, 'cta__title')).toHaveText("Tell us what you're building.")
})

// The scenes at work: the appearance animations are ON here.
test.describe('with motion', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('hero: it turns the way round by itself, and stops doing it when the visitor presses something', async ({ page }) => {
    await open(page, 1440, 900)
    await toBlock(page, 'ramp__hero__media')
    await expect(el(page, 'ramp__hero-scene-direction-on')).toHaveAttribute('aria-pressed', 'true')
    await expect(el(page, 'ramp__hero-scene-direction-off')).toHaveAttribute('aria-pressed', 'true', { timeout: 14_000 })
    await el(page, 'ramp__hero-scene-convert').click()
    await page.waitForTimeout(9000)
    await expect(el(page, 'ramp__hero-scene-direction-off')).toHaveAttribute('aria-pressed', 'true')
  })

  test('routes: a plug can be dragged to another socket, and snaps into it', async ({ page }) => {
    await open(page, 1440, 900)
    await toBlock(page, 'ramp__routes')
    await page.waitForTimeout(800)
    const plug = (await el(page, 'ramp__routes-plug-bank').boundingBox())!
    const target = (await el(page, 'ramp__routes-rail-br').boundingBox())!
    await page.mouse.move(plug.x + plug.width / 2, plug.y + plug.height / 2)
    await page.mouse.down()
    await page.mouse.move(target.x + target.width - 4, target.y + target.height / 2, { steps: 12 })
    await expect(el(page, 'ramp__routes-rail-br')).toHaveClass(/ring-typography-brand/)
    await page.mouse.up()
    await expect(el(page, 'ramp__routes-rail-br')).toHaveAttribute('aria-pressed', 'true')
    await expect(el(page, 'ramp__routes-summary')).toHaveText('BRL via Pix → USDT on Tron')
    // The plug settles in the new socket.
    await page.waitForTimeout(1200)
    const after = (await el(page, 'ramp__routes-plug-bank').boundingBox())!
    const socket = (await el(page, 'ramp__routes-rail-br').boundingBox())!
    expect(Math.abs(after.x + after.width / 2 - (socket.x + socket.width))).toBeLessThan(12)
    expect(Math.abs(after.y + after.height / 2 - (socket.y + socket.height / 2))).toBeLessThan(12)
  })

  test('quote: the price moves by itself and the chart is drawn', async ({ page }) => {
    await open(page, 1440, 900)
    await toBlock(page, 'ramp__quote')
    const seen = new Set<string>()
    for (let index = 0; index < 8; index++) {
      seen.add((await el(page, 'ramp__quote-rate').textContent()) ?? '')
      await page.waitForTimeout(1000)
    }
    expect(seen.size).toBeGreaterThan(1)
    const painted = await el(page, 'ramp__quote-chart').evaluate((canvas: HTMLCanvasElement) => {
      const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data
      let colored = 0
      for (let index = 3; index < data.length; index += 4) if (data[index] > 0) colored++
      return colored
    })
    expect(painted).toBeGreaterThan(300)
  })

  test('reduced motion: the picture stands on the finished crossing, nothing moves by itself', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await open(page, 1440, 900)
    await toBlock(page, 'ramp__hero__media')
    await page.waitForTimeout(3000)
    await expect(el(page, 'ramp__hero-scene-direction-on')).toHaveAttribute('aria-pressed', 'true')
    await toBlock(page, 'ramp__quote')
    await expect(el(page, 'ramp__quote-rate')).toHaveText('1 USDT = EUR 0.9200')
  })
})
