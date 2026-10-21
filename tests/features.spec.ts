import { expect, test, type Page } from '@playwright/test'

const viewports = [
  { name: 'mobile-393', width: 393, height: 900 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 900 },
  { name: 'desktop-1280', width: 1280, height: 900 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-2560', width: 2560, height: 1000 },
]

const section = (page: Page) => page.locator('[data-el="features"]')
const card = (page: Page, id: string) => page.locator(`[data-el="features__card-${id}"]`)
const box = async (page: Page, selector: string) => (await page.locator(selector).boundingBox())!

for (const viewport of viewports) {
  test(`features screenshot ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await expect(section(page)).toBeVisible()
    await section(page).screenshot({ path: `tests/artifacts/features-${viewport.name}.png` })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBe(0)
  })
}

test('texts of the design: header and the six cards', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-el="features__eyebrow"]')).toHaveText('Accept. Move. Hold. Pay out.')
  await expect(page.getByRole('heading', { level: 2, name: 'Everything you need to move money.' })).toBeVisible()
  const cards: [string, string, string][] = [
    ['crypto', 'Crypto Processing', 'Accept, convert, and settle crypto payments via a single integration.'],
    ['invoicing', 'Invoicing', 'Issue invoices in local currency and accept payments in crypto.'],
    ['ramp', 'Crypto on- and off-ramp', 'Convert seamlessly between fiat and crypto with rates from 0.5%.'],
    ['payouts', 'Mass Payouts', 'Automate global payouts to teams and partners in a single workflow.'],
    ['banking', 'Banking', 'Dedicated IBANs and corporate accounts in Tier-1 banks.'],
    ['wallet', 'Wallet', 'Secure custody and digital asset management for your platform.'],
  ]
  for (const [id, title, description] of cards) {
    await expect(page.locator(`[data-el="features__card-${id}-title"]`)).toHaveText(title)
    await expect(page.locator(`[data-el="features__card-${id}-desc"]`)).toHaveText(description)
  }
})

test('desktop frame (2560): column 1440, cards and gaps as in the design, section 1661 px', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1000 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const container = await box(page, '[data-el="features__container"]')
  expect(container.width).toBeCloseTo(1440, 0)

  // Header: eyebrow 40 + gap 24 + title 144 (two lines of 72).
  expect((await box(page, '[data-el="features__eyebrow"]')).height).toBeCloseTo(40, 0)
  expect((await box(page, '[data-el="features__title"]')).height).toBeCloseTo(144, 0)
  const header = await box(page, '[data-el="features__header"]')
  expect(header.height).toBeCloseTo(208, 0)

  // Grid: 3 columns of (1360 - 48) / 3 = 437.33 with 24 px gaps.
  const column = (1360 - 48) / 3
  const crypto = await box(page, '[data-el="features__card-crypto"]')
  const invoicing = await box(page, '[data-el="features__card-invoicing"]')
  const ramp = await box(page, '[data-el="features__card-ramp"]')
  const payouts = await box(page, '[data-el="features__card-payouts"]')
  expect(crypto.width).toBeCloseTo(2 * column + 24, 0)
  expect(invoicing.width).toBeCloseTo(column, 0)
  expect(ramp.width).toBeCloseTo(column, 0)
  for (const cardBox of [crypto, invoicing, ramp, payouts]) expect(cardBox.height).toBeCloseTo(550, 0)
  expect(invoicing.x - (crypto.x + crypto.width)).toBeCloseTo(24, 0)
  expect(ramp.y - (crypto.y + crypto.height)).toBeCloseTo(24, 0)
  expect(payouts.x - (ramp.x + ramp.width)).toBeCloseTo(24, 0)

  // 48 px between the header and the grid; 140 px padding; the "coming soon" column is 550 high with two cards.
  const grid = await box(page, '[data-el="features__grid"]')
  expect(grid.y - (header.y + header.height)).toBeCloseTo(48, 0)
  expect(header.y - container.y).toBeCloseTo(140, 0)
  const banking = await box(page, '[data-el="features__card-banking"]')
  const wallet = await box(page, '[data-el="features__card-wallet"]')
  expect(banking.height).toBeCloseTo(263, 0)
  expect(wallet.height).toBeCloseTo(263, 0)
  expect(wallet.y - (banking.y + banking.height)).toBeCloseTo(24, 0)
  expect(banking.x).toBeCloseTo(payouts.x + payouts.width + 24, 0)

  // Whole section: 140 + 208 + 48 + 1124 + 140 + 1 px border.
  const whole = await section(page).boundingBox()
  // 1 px more than in the design: the line on top of the block (border of the section)
  expect(whole!.height - 1).toBeCloseTo(1661, 0)
})

test('cards: radius 40, white and grey fills, 40 px padding on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const style = (id: string) =>
    card(page, id).evaluate((el) => {
      const cs = getComputedStyle(el)
      return { radius: cs.borderTopLeftRadius, background: cs.backgroundColor, padding: cs.paddingLeft }
    })
  for (const id of ['crypto', 'invoicing', 'ramp', 'payouts']) {
    expect(await style(id)).toEqual({ radius: '40px', background: 'rgb(255, 255, 255)', padding: '40px' })
  }
  for (const id of ['banking', 'wallet']) {
    expect(await style(id)).toEqual({ radius: '40px', background: 'rgb(243, 243, 243)', padding: '40px' })
  }
})

test('round "Learn more" links: 48 px circles with an accessible name; coming-soon cards have a badge instead', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  for (const [id, title] of [['crypto', 'Crypto Processing'], ['invoicing', 'Invoicing'], ['ramp', 'Crypto on- and off-ramp'], ['payouts', 'Mass Payouts']]) {
    const link = page.locator(`[data-el="features__card-${id}-cta"]`)
    await expect(link).toHaveAttribute('aria-label', `Learn more: ${title}`)
    await expect(link).toHaveAttribute('href', /^#/)
    const linkBox = (await link.boundingBox())!
    expect(linkBox.width).toBeCloseTo(48, 0)
    expect(linkBox.height).toBeCloseTo(48, 0)
    // Bottom-left of the card, 40 px from its edges.
    const cardBox = (await card(page, id).boundingBox())!
    expect(linkBox.x - cardBox.x).toBeCloseTo(40, 0)
    expect(cardBox.y + cardBox.height - (linkBox.y + linkBox.height)).toBeCloseTo(40, 0)
  }
  for (const id of ['banking', 'wallet']) {
    await expect(card(page, id).locator('a')).toHaveCount(0)
    await expect(page.locator(`[data-el="features__card-${id}-badge"]`)).toHaveText('Coming soon')
  }
})

test('the four white cards have their animated picture (details: tests/features-illustrations.spec.ts); the grey ones have none', async ({ page }) => {
  await page.goto('/')
  await expect(section(page).locator('[data-el$="-illustration"]')).toHaveCount(4)
  for (const id of ['crypto', 'invoicing', 'ramp', 'payouts']) await expect(card(page, id).locator(`[data-el="features__${id}-illustration"]`)).toHaveCount(1)
  for (const id of ['banking', 'wallet']) await expect(card(page, id).locator('[data-el$="-illustration"]')).toHaveCount(0)
  // the crypto card: the dot grid and the tesseract, two canvases
  await expect(card(page, 'crypto').locator('canvas')).toHaveCount(2)
})

test('crypto card: the dot grid fills the card, is clipped by its radius and reacts to the pointer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const dots = page.locator('[data-el="features__crypto-illustration"] canvas:not([data-el="features__tesseract"])')
  await dots.scrollIntoViewIfNeeded()
  const cardBox = (await card(page, 'crypto').boundingBox())!
  const canvasBox = (await dots.boundingBox())!
  expect(canvasBox.width).toBeCloseTo(cardBox.width, 0)
  expect(canvasBox.height).toBeCloseTo(cardBox.height, 0)
  const alphaAtFirstDot = () =>
    dots.evaluate((element) => (element as HTMLCanvasElement).getContext('2d')!.getImageData(20, 20, 1, 1).data[3])
  await expect.poll(alphaAtFirstDot).toBeGreaterThan(100)
  // The pointer 40 px to the right of the first dot pushes it away.
  await page.mouse.move(canvasBox.x + 60, canvasBox.y + 20)
  await expect.poll(alphaAtFirstDot).toBeLessThan(10)
})

test('responsive grid: 3 columns on desktop, 2 on tablet (crypto spans both), 1 on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 })
  await page.goto('/')
  const crypto = await box(page, '[data-el="features__card-crypto"]')
  const invoicing = await box(page, '[data-el="features__card-invoicing"]')
  const ramp = await box(page, '[data-el="features__card-ramp"]')
  const grid = await box(page, '[data-el="features__grid"]')
  expect(crypto.width).toBeCloseTo(grid.width, 0) // spans both columns
  expect(invoicing.y).toBeCloseTo(ramp.y, 0) // same row
  expect(invoicing.width).toBeCloseTo((grid.width - 24) / 2, 0)

  await page.setViewportSize({ width: 393, height: 900 })
  await page.goto('/')
  const mobileGrid = await box(page, '[data-el="features__grid"]')
  expect(mobileGrid.width).toBeCloseTo(361, 0)
  for (const id of ['crypto', 'invoicing', 'ramp', 'payouts']) {
    const cardBox = await box(page, `[data-el="features__card-${id}"]`)
    expect(cardBox.x).toBeCloseTo(mobileGrid.x, 0)
    expect(cardBox.width).toBeCloseTo(361, 0)
  }
})

test('corner dots sit exactly on the corners: centered on the bottom border line and on the column lines', async ({ page }) => {
  for (const width of [1440, 2560]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')
    const container = await box(page, '[data-el="features__container"]')
    const whole = (await section(page).boundingBox())!
    const left = await box(page, '[data-el="features__deco-corner-bl"]')
    const right = await box(page, '[data-el="features__deco-corner-br"]')
    for (const dot of [left, right]) {
      expect(dot.width).toBeCloseTo(5, 1)
      expect(dot.height).toBeCloseTo(5, 1) // not a line-high box: it used to be 24 px high with the dot on its baseline
      // Vertical: the middle of the dot is on the 1 px border line at the bottom of the section.
      expect(dot.y + dot.height / 2).toBeCloseTo(whole.y + whole.height - 0.5, 0)
    }
    // Horizontal: on the 1 px column lines (the inner pixel of the left and right edges of the column).
    expect(left.x + left.width / 2).toBeCloseTo(container.x + 0.5, 0)
    expect(right.x + right.width / 2).toBeCloseTo(container.x + container.width - 0.5, 0)
  }
})

test('the section follows the logos strip', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const logos = await box(page, '[data-el="logos"]')
  const features = await section(page).boundingBox()
  expect(features!.y).toBeCloseTo(logos.y + logos.height, 0)
})

test('dark theme: dark cards and grey cards from the Dark Theme tokens', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.locator('[data-el="header"] [data-el="header__theme-toggle"]').click()
  await page.mouse.move(700, 100)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(card(page, 'crypto')).toHaveCSS('background-color', 'rgb(24, 24, 24)') // surface-subtle, Dark
  await expect(card(page, 'banking')).toHaveCSS('background-color', 'rgb(38, 38, 38)') // surface-hover, Dark
  await section(page).scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await section(page).screenshot({ path: 'tests/artifacts/features-desktop-1440-dark.png' })
})
