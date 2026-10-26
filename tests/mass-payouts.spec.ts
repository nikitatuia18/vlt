import { expect, test, type Page } from '@playwright/test'
import { batchContent, massPayouts, routingContent } from '../src/pages/mass-payouts/content'
import { batchCountries, batchTotal, heroCounts, heroNumbers, nextRuns, recipients, runLabel, usdt } from '../src/pages/mass-payouts/demo'

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
  await page.goto('/mass-payouts')
  await page.evaluate(() => document.fonts.ready)
}

const toBlock = (page: Page, name: string) => page.locator(`[data-el="${name}"]`).evaluate((node) => node.scrollIntoView({ block: 'center' }))
const el = (page: Page, name: string) => page.locator(`[data-el="${name}"]`)

// The numbers of the page are the ones of docs/pages/mass-payouts.md ("Формат демо-данных").
test('the arithmetic of the demo: the example batch and the numbers of the hero add up', () => {
  expect(recipients).toHaveLength(10)
  expect(batchTotal).toBe(10000)
  expect(batchCountries).toBe(9)
  expect(usdt(batchTotal)).toBe('10,000.00 USDT')
  const byLane = (lane: string) => recipients.filter((item) => item.lane === lane).reduce((sum, item) => sum + item.amount, 0)
  expect(byLane('bank')).toBe(5700)
  expect(byLane('crypto')).toBe(2400)
  expect(byLane('card')).toBe(1900)
  expect(heroNumbers(10)).toEqual({ total: 500, countries: 4, balanceAfter: 999_500 })
  expect(heroNumbers(250)).toEqual({ total: 12_500, countries: 7, balanceAfter: 987_500 })
  expect(heroNumbers(1000)).toEqual({ total: 50_000, countries: 9, balanceAfter: 950_000 })
  expect(heroNumbers(10000)).toEqual({ total: 500_000, countries: 9, balanceAfter: 500_000 })
  const runs = nextRuns(new Date(2026, 9, 26, 12, 0))
  expect(runLabel(runs[0])).toBe('Nov 1, 09:00')
  expect(runs.map((run) => run.getMonth())).toEqual([10, 11, 0])
})

for (const viewport of viewports) {
  test(`mass payouts page ${viewport.name}: the hero scene and both blocks fit, no horizontal scroll`, async ({ page }) => {
    await open(page, viewport.width, viewport.height)
    for (const name of ['mass-payouts__hero__media', 'mass-payouts__batch', 'mass-payouts__routing']) {
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
  await expect(page.locator('h1')).toHaveText(massPayouts.hero.title.join(' '))
  const order = await page.locator('main > section').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-el')))
  expect(order).toEqual(['mass-payouts__hero', 'logos', 'mass-payouts__batch', 'mass-payouts__routing', 'industries', 'faq', 'cta'])
  await expect(el(page, 'cta__title')).toHaveText(massPayouts.cta.title!)
  await expect(page.locator('[data-el="faq__list"] > li')).toHaveCount(massPayouts.faq.items!.length)
  await expect(page.locator('[data-el="industries__list"] > li')).toHaveCount(massPayouts.industries.items!.length)
  await expect(page).toHaveTitle(massPayouts.meta.title)
  await expect(el(page, 'mass-payouts__batch-title')).toHaveText(batchContent.title)
  await expect(el(page, 'mass-payouts__routing-title')).toHaveText(routingContent.title)
  await expect(el(page, 'mass-payouts__hero__cta-secondary')).toHaveAttribute('href', '#how-it-works')
  await expect(page.locator('#how-it-works')).toHaveAttribute('data-el', 'mass-payouts__batch')
})

test('hero: the slider sets the number of recipients, the total, the countries and the counter', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'mass-payouts__hero__media')
  // Without motion the crowd stands paid.
  await expect(el(page, 'mass-payouts__hero-scene-slider-value')).toHaveText('1,000')
  await expect(el(page, 'mass-payouts__hero-scene-counter')).toHaveText('Paid 1,000 of 1,000')
  await expect(el(page, 'mass-payouts__hero-scene-total')).toHaveText('Total 50,000.00 USDT · 1,000 recipients · 9 countries')
  for (const [position, count] of heroCounts.entries()) {
    await el(page, 'mass-payouts__hero-scene-slider').fill(String(position))
    const { total, countries } = heroNumbers(count)
    await expect(el(page, 'mass-payouts__hero-scene-total')).toHaveText(`Total ${usdt(total)} · ${count.toLocaleString('en-US')} recipients · ${countries} countries`)
    await expect(el(page, 'mass-payouts__hero-scene-counter')).toHaveText(`Paid ${count.toLocaleString('en-US')} of ${count.toLocaleString('en-US')}`)
  }
  await expect(el(page, 'mass-payouts__hero-scene-pay')).toHaveText('Pay again')
})

test('hero: the slider sets the number of heads (3 / 6 / 9 / 12 round the big one)', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'mass-payouts__hero__media')
  for (const [position, heads] of [3, 6, 9, 12].entries()) {
    await el(page, 'mass-payouts__hero-scene-slider').fill(String(position))
    await expect(el(page, 'mass-payouts__hero-scene-illustration')).toHaveAttribute('data-heads', String(heads))
  }
})

test('the picture of the hero is drawn: the canvas is not empty', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'mass-payouts__hero__media')
  await page.waitForTimeout(400)
  const painted = await el(page, 'mass-payouts__hero-scene-canvas').evaluate((canvas: HTMLCanvasElement) => {
    const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data
    let colored = 0
    for (let index = 3; index < data.length; index += 4) if (data[index] > 0) colored++
    return colored
  })
  expect(painted).toBeGreaterThan(3000)
})

test('batch, CSV: the sample fills the table, one row fails until it is fixed, then the batch is ready; Start over comes back', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'mass-payouts__batch-illustration')
  await el(page, 'mass-payouts__batch-sample').click()
  await expect(el(page, 'mass-payouts__batch-file')).toHaveText('payouts.csv · 10 rows')
  await expect(page.locator('[data-el^="mass-payouts__batch-row-"]')).toHaveCount(10)
  await expect(el(page, 'mass-payouts__batch-check-r1')).toContainText('IBAN missing')
  await expect(el(page, 'mass-payouts__batch-summary')).toHaveText('9 of 10 ready · 1 needs a fix')
  await el(page, 'mass-payouts__batch-fix').click()
  await expect(el(page, 'mass-payouts__batch-check-r1')).toContainText('IBAN added')
  await expect(el(page, 'mass-payouts__batch-summary')).toHaveText('Batch ready: 10 recipients · 9 countries')
  await expect(el(page, 'mass-payouts__batch-summary-total')).toHaveText('Total 10,000.00 USDT')
  await el(page, 'mass-payouts__batch-reset').click()
  await expect(el(page, 'mass-payouts__batch-drop')).toBeVisible()
})

test('batch, CSV: a dropped CSV file is taken (with a note that an example batch is shown), another file is refused', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'mass-payouts__batch-illustration')
  const wrong = await page.evaluateHandle(() => {
    const transfer = new DataTransfer()
    transfer.items.add(new File(['x'], 'notes.txt', { type: 'text/plain' }))
    return transfer
  })
  await el(page, 'mass-payouts__batch-drop').dispatchEvent('drop', { dataTransfer: wrong })
  await expect(el(page, 'mass-payouts__batch-drop-wrong')).toBeVisible()
  const right = await page.evaluateHandle(() => {
    const transfer = new DataTransfer()
    transfer.items.add(new File(['name,country,amount'], 'payouts.csv', { type: 'text/csv' }))
    return transfer
  })
  await el(page, 'mass-payouts__batch-drop').dispatchEvent('drop', { dataTransfer: right })
  await expect(el(page, 'mass-payouts__batch-file-note')).toHaveText('We show an example batch, not your file.')
  await expect(page.locator('[data-el^="mass-payouts__batch-row-"]')).toHaveCount(10)
})

test('batch, API: the request is sent and the same batch comes back checked', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'mass-payouts__batch-illustration')
  await el(page, 'mass-payouts__batch-source-api').click()
  await expect(el(page, 'mass-payouts__batch-hint-api')).toBeVisible()
  await el(page, 'mass-payouts__batch-send').click()
  await expect(el(page, 'mass-payouts__batch-api-log')).toContainText('POST /v1/payout-batches')
  await expect(el(page, 'mass-payouts__batch-api-log')).toContainText('10 recipients · 9 countries · 10,000.00 USDT')
  await expect(el(page, 'mass-payouts__batch-summary')).toHaveText('Batch ready: 10 recipients · 9 countries')
  await expect(el(page, 'mass-payouts__batch-send')).toHaveText('Send again')
})

test('batch, Schedule: saving shows the next run (the 1st of the next month at 09:00) and the runs after it', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'mass-payouts__batch-illustration')
  await el(page, 'mass-payouts__batch-source-schedule').click()
  await expect(el(page, 'mass-payouts__batch-schedule-repeat')).toHaveText('Every month on the 1st')
  await expect(el(page, 'mass-payouts__batch-schedule-batch')).toHaveText('10 recipients · 10,000.00 USDT')
  await el(page, 'mass-payouts__batch-schedule-save').click()
  await expect(el(page, 'mass-payouts__batch-schedule-next')).toHaveText(runLabel(nextRuns(new Date())[0]))
  await expect(el(page, 'mass-payouts__batch-schedule-save')).toHaveText('Schedule saved')
  await expect(el(page, 'mass-payouts__batch-schedule-upcoming')).toContainText('Next runs')
})

test('routing: the lanes carry the example batch; a recipient moves to another lane by the menu and the lanes are counted again; Reset choices', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'mass-payouts__routing-illustration')
  await expect(el(page, 'mass-payouts__routing-lane-count-bank')).toHaveText('6 recipients · 5,700.00 USDT')
  await expect(el(page, 'mass-payouts__routing-lane-count-crypto')).toHaveText('2 recipients · 2,400.00 USDT')
  await expect(el(page, 'mass-payouts__routing-lane-count-card')).toHaveText('2 recipients · 1,900.00 USDT')
  await el(page, 'mass-payouts__routing-chip-r2').getByLabel('Move Lucas Almeida to').selectOption('card')
  await expect(el(page, 'mass-payouts__routing-lane-count-bank')).toHaveText('5 recipients · 4,800.00 USDT')
  await expect(el(page, 'mass-payouts__routing-lane-count-card')).toHaveText('3 recipients · 2,800.00 USDT')
  await expect(el(page, 'mass-payouts__routing-chip-r2')).toHaveAttribute('data-lane', 'card')
  await expect(el(page, 'mass-payouts__routing-hint')).toHaveText('Moved. Drag more, or pay.')
  await el(page, 'mass-payouts__routing-reset-choices').click()
  await expect(el(page, 'mass-payouts__routing-lane-count-bank')).toHaveText('6 recipients · 5,700.00 USDT')
})

test('routing: every recipient card has a round photo', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'mass-payouts__routing-illustration')
  await expect(page.locator('[data-el^="mass-payouts__routing-photo-"]')).toHaveCount(10)
})

test('routing: Pay makes every payment, one failed once and was retried; Start over comes back', async ({ page }) => {
  await open(page, 1440, 900)
  await toBlock(page, 'mass-payouts__routing-illustration')
  await el(page, 'mass-payouts__routing-chip-r5').getByLabel('Move Sofia Reyes to').selectOption('crypto')
  await el(page, 'mass-payouts__routing-pay').click()
  await expect(el(page, 'mass-payouts__routing-result-title')).toHaveText('Paid 10 · Retried 1')
  await expect(el(page, 'mass-payouts__routing-result-text')).toHaveText('10,000.00 USDT paid out in 9 countries.')
  await expect(el(page, 'mass-payouts__routing-status-r3')).toHaveText('Paid after a retry')
  // There is no report to download: the result is the end of it.
  await expect(page.locator('[data-el="mass-payouts__routing-report"]')).toHaveCount(0)
  await el(page, 'mass-payouts__routing-reset').click()
  await expect(el(page, 'mass-payouts__routing-pay')).toBeVisible()
})

test('the home page card of Mass Payouts leads here', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('a[href="/mass-payouts"]').first()).toHaveAttribute('href', '/mass-payouts')
})

// The scenes at work: the appearance animations are ON here.
test.describe('with motion', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('hero: it pays once by itself when it is seen, then the slider and "Pay again" work', async ({ page }) => {
    await open(page, 1440, 900)
    await toBlock(page, 'mass-payouts__hero__media')
    await expect(el(page, 'mass-payouts__hero-scene-status')).toHaveText('Sending to 1,000 recipients…', { timeout: 5000 })
    await expect(el(page, 'mass-payouts__hero-scene-counter')).toHaveText('Paid 1,000 of 1,000', { timeout: 12_000 })
    await expect(el(page, 'mass-payouts__hero-scene-status')).toHaveText('One click paid 1,000 recipients.')
    await el(page, 'mass-payouts__hero-scene-slider').fill('0')
    await expect(el(page, 'mass-payouts__hero-scene-counter')).toHaveText('Paid 0 of 10')
    await expect(el(page, 'mass-payouts__hero-scene-pay')).toHaveText('Pay everyone')
    await el(page, 'mass-payouts__hero-scene-pay').click()
    await expect(el(page, 'mass-payouts__hero-scene-pay')).toHaveText('Paying…')
    await expect(el(page, 'mass-payouts__hero-scene-counter')).toHaveText('Paid 10 of 10', { timeout: 8000 })
  })

  test('hero: about fourteen seconds after everything is paid the scene goes back to the start by itself', async ({ page }) => {
    test.setTimeout(70_000)
    await open(page, 1440, 900)
    await toBlock(page, 'mass-payouts__hero__media')
    await expect(el(page, 'mass-payouts__hero-scene-counter')).toHaveText('Paid 1,000 of 1,000', { timeout: 14_000 })
    await expect(el(page, 'mass-payouts__hero-scene-counter')).toHaveText('Paid 0 of 1,000', { timeout: 20_000 })
    await expect(el(page, 'mass-payouts__hero-scene-pay')).toHaveText('Pay everyone')
    await expect(el(page, 'mass-payouts__hero-scene-status')).toHaveText('Choose how many recipients, then pay them all.')
  })

  test('routing: the recipients sort themselves into the lanes, the lanes pay with a failure and a retry, and a recipient can be dragged to another lane', async ({ page }) => {
    test.setTimeout(90_000)
    await open(page, 1440, 900)
    await toBlock(page, 'mass-payouts__routing-illustration')
    // The hint of the scene (two cards are carried to another lane and back) plays first; the visitor waits for it to end.
    await expect(el(page, 'mass-payouts__routing-illustration').locator('[data-demo]')).toHaveAttribute('data-demo', 'done', { timeout: 30_000 })
    await expect(el(page, 'mass-payouts__routing-lane-count-bank')).toHaveText('6 recipients · 5,700.00 USDT')
    await page.waitForTimeout(800)
    // Drag Lucas Almeida to the Card lane.
    const chip = (await el(page, 'mass-payouts__routing-chip-r2').boundingBox())!
    const card = (await el(page, 'mass-payouts__routing-lane-card').boundingBox())!
    await page.mouse.move(chip.x + 40, chip.y + chip.height / 2)
    await page.mouse.down()
    await page.mouse.move(card.x + card.width / 2, card.y + card.height / 2, { steps: 14 })
    await page.mouse.up()
    await expect(el(page, 'mass-payouts__routing-chip-r2')).toHaveAttribute('data-lane', 'card')
    await expect(el(page, 'mass-payouts__routing-lane-count-card')).toHaveText('3 recipients · 2,800.00 USDT')
    // Pay: Priya Nair fails once, is retried, and is paid.
    await el(page, 'mass-payouts__routing-pay').click()
    await expect(el(page, 'mass-payouts__routing-chip-r3')).toHaveAttribute('data-status', 'failed', { timeout: 6000 })
    await expect(el(page, 'mass-payouts__routing-chip-r3')).toHaveAttribute('data-status', 'retrying', { timeout: 4000 })
    await expect(el(page, 'mass-payouts__routing-result-title')).toHaveText('Paid 10 · Retried 1', { timeout: 10_000 })
  })

  test('routing: two cards are carried to another lane and back by themselves; a touch stops it and leaves the lanes as they were; a picked card is white and the next one rises', async ({ page }) => {
    test.setTimeout(60_000)
    await open(page, 1440, 900)
    await toBlock(page, 'mass-payouts__routing-illustration')
    const scene = el(page, 'mass-payouts__routing-illustration').locator('[data-demo]')
    await expect(scene).toHaveAttribute('data-demo', 'running', { timeout: 8000 })
    // A card is picked up (white, with a shadow) ...
    await expect(page.locator('[data-lifted="true"]')).toHaveCount(1, { timeout: 4000 })
    // ... and put down in another lane: the lanes are counted again.
    await expect(el(page, 'mass-payouts__routing-lane-count-crypto')).toHaveText('3 recipients · 3,300.00 USDT', { timeout: 4000 })
    // A touch stops the show and puts everything back.
    await el(page, 'mass-payouts__routing-legend').click()
    await expect(scene).toHaveAttribute('data-demo', 'done')
    await expect(el(page, 'mass-payouts__routing-lane-count-crypto')).toHaveText('2 recipients · 2,400.00 USDT')
    await expect(page.locator('[data-lifted="true"]')).toHaveCount(0)
  })

  test('routing: a card that is held is white with a shadow, and the next card of its lane rises into its place', async ({ page }) => {
    test.setTimeout(60_000)
    await open(page, 1440, 900)
    await toBlock(page, 'mass-payouts__routing-illustration')
    await expect(el(page, 'mass-payouts__routing-illustration').locator('[data-demo]')).toHaveAttribute('data-demo', 'done', { timeout: 30_000 })
    const next = el(page, 'mass-payouts__routing-chip-r3')
    const before = (await next.boundingBox())!
    const chip = (await el(page, 'mass-payouts__routing-chip-r2').boundingBox())!
    await page.mouse.move(chip.x + 40, chip.y + chip.height / 2)
    await page.mouse.down()
    await page.mouse.move(chip.x + 60, chip.y + chip.height / 2 + 30, { steps: 6 })
    await expect(el(page, 'mass-payouts__routing-chip-r2')).toHaveAttribute('data-lifted', 'true')
    await expect.poll(async () => (await next.boundingBox())!.y, { timeout: 3000 }).toBeLessThan(before.y - 40)
    await page.mouse.up()
    await expect.poll(async () => Math.abs((await next.boundingBox())!.y - before.y), { timeout: 3000 }).toBeLessThan(2)
  })

  test('reduced motion: the hero stands paid and the lanes stand sorted, nothing moves by itself', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await open(page, 1440, 900)
    await toBlock(page, 'mass-payouts__hero__media')
    await expect(el(page, 'mass-payouts__hero-scene-counter')).toHaveText('Paid 1,000 of 1,000')
    await toBlock(page, 'mass-payouts__routing-illustration')
    await expect(el(page, 'mass-payouts__routing-lane-count-bank')).toHaveText('6 recipients · 5,700.00 USDT')
  })
})
