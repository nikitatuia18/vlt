import { expect, test } from '@playwright/test'

// Widths: mobile (design 393), tablet (derived), desktop breakpoint, wide desktop, Figma canvas.
const viewports = [
  { name: 'mobile-393', width: 393, height: 800 },
  { name: 'tablet-768', width: 768, height: 800 },
  { name: 'tablet-1024', width: 1024, height: 800 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 800 },
  { name: 'desktop-2560', width: 2560, height: 800 },
]

for (const viewport of viewports) {
  test(`header screenshot ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const header = page.locator('[data-el="header"]')
    await expect(header).toBeVisible()
    await header.screenshot({ path: `tests/artifacts/header-${viewport.name}.png` })

    // The page must never scroll sideways.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBe(0)
  })
}

test('desktop: full menu and both CTAs, no burger; height matches the design (76 + 1 px border)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 })
  await page.goto('/')
  await expect(page.locator('[data-el="header__menu"]')).toBeVisible()
  await expect(page.locator('[data-el="header__cta-primary"]')).toBeVisible()
  await expect(page.locator('[data-el="header__cta-secondary"]')).toBeVisible()
  await expect(page.locator('[data-el="header__theme-toggle"]').first()).toBeVisible()
  await expect(page.locator('[data-el="header__menu-toggle"]')).toBeHidden()
  const box = await page.locator('[data-el="header"]').boundingBox()
  expect(box?.height).toBeCloseTo(77, 0)
})

test('mobile: burger opens and closes the dropdown (button, Escape, link)', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 800 })
  await page.goto('/')
  const toggle = page.locator('[data-el="header__menu-toggle"]')
  const panel = page.locator('[data-el="header__menu-panel"]')
  await expect(page.locator('[data-el="header__menu"]')).toBeHidden()
  await expect(panel).toBeHidden()

  await toggle.click()
  await expect(panel).toBeVisible()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await page.screenshot({ path: 'tests/artifacts/header-mobile-393-open.png' })

  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(toggle).toBeFocused()

  await toggle.click()
  await panel.getByRole('link', { name: 'FAQ' }).click()
  await expect(panel).toBeHidden()
})

for (const viewport of [{ width: 393, height: 800 }, { width: 768, height: 900 }, { width: 1024, height: 700 }]) {
  test(`the open menu fills the screen under the bar and holds the page still at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await page.mouse.move(viewport.width / 2, viewport.height - 40)
    await page.mouse.wheel(0, 300)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100)

    // Scrolling up brings the bar back (it hides while scrolling down), then the menu opens.
    await page.waitForTimeout(1500)
    await page.mouse.wheel(0, -100)
    await expect(page.locator('[data-el="header"]')).toHaveAttribute('data-hidden', 'false')
    await page.locator('[data-el="header__menu-toggle"]').click()
    const panel = page.locator('[data-el="header__menu-panel"]')
    await expect(panel).toBeVisible()
    await page.waitForTimeout(300)

    const header = (await page.locator('[data-el="header"]').boundingBox())!
    const box = (await panel.boundingBox())!
    expect(box.y).toBeCloseTo(header.y + header.height - 1, 0)
    expect(box.y + box.height).toBeCloseTo(viewport.height, 0)
    await page.screenshot({ path: `tests/artifacts/header-menu-full-${viewport.width}.png` })

    // The wheel over the page, the wheel over the menu and the keys do not move the page.
    const before = await page.evaluate(() => window.scrollY)
    await page.mouse.wheel(0, 500)
    await page.mouse.move(viewport.width / 2, 120)
    await page.mouse.wheel(0, 500)
    await page.keyboard.press('PageDown')
    await page.waitForTimeout(700)
    expect(await page.evaluate(() => window.scrollY)).toBe(before)

    // Closed: the page scrolls again.
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await page.mouse.wheel(0, 400)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 100)
  })
}

test('the burger turns into a cross and back (the bars move, they are not swapped)', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 800 })
  await page.goto('/')
  const toggle = page.locator('[data-el="header__menu-toggle"]')
  // Angle of the first bar and the opacity of the middle one.
  const state = () =>
    page.locator('[data-el="menu-toggle-icon"] line').evaluateAll((bars) => {
      const angle = (bar: Element) => {
        const matrix = new DOMMatrix(getComputedStyle(bar).transform)
        return Math.round((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI)
      }
      return { top: angle(bars[0]), middle: Number(getComputedStyle(bars[1]).opacity), bottom: angle(bars[2]) }
    })
  await expect.poll(state).toEqual({ top: 0, middle: 1, bottom: 0 })
  await toggle.click()
  await expect.poll(state).toEqual({ top: 45, middle: 0, bottom: -45 })
  await toggle.click()
  await expect.poll(state).toEqual({ top: 0, middle: 1, bottom: 0 })
})

test('tablet: primary CTA in the bar, dropdown keeps the rest', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 800 })
  await page.goto('/')
  await expect(page.locator('[data-el="header__cta-primary"]')).toBeVisible()
  await expect(page.locator('[data-el="header__cta-secondary"]')).toBeHidden()
  await page.locator('[data-el="header__menu-toggle"]').click()
  await expect(page.locator('[data-el="header__menu-panel"]')).toBeVisible()
  await page.screenshot({ path: 'tests/artifacts/header-tablet-768-open.png' })
})

test('dropdown closes when the window grows to desktop', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 800 })
  await page.goto('/')
  await page.locator('[data-el="header__menu-toggle"]').click()
  await expect(page.locator('[data-el="header__menu-panel"]')).toBeVisible()
  const toggle = page.locator('[data-el="header__menu-toggle"]')
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await page.setViewportSize({ width: 1440, height: 800 })
  // The state must be reset, not just hidden by CSS: otherwise the dropdown pops open again on shrink.
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await page.setViewportSize({ width: 768, height: 800 })
  await expect(page.locator('[data-el="header__menu-panel"]')).toBeHidden()
})

test('theme toggle switches the Dark Theme tokens on and off', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 })
  await page.goto('/')
  const toggle = page.locator('[data-el="header"] [data-el="header__theme-toggle"]')
  const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor)

  expect(await background()).toBe('rgb(251, 251, 251)') // surface/page, Light
  await toggle.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  expect(await background()).toBe('rgb(14, 14, 14)') // surface/page, Dark = neutral/950
  const headerBackground = await page.evaluate(() => getComputedStyle(document.querySelector('[data-el="header"]')!).backgroundColor)
  expect(headerBackground).toBe('rgb(24, 24, 24)') // surface/subtle, Dark = neutral/900
  // The pointer stays over the toggle after the click, which would show its hover color: move it away.
  await page.mouse.move(700, 600)
  // Buttons animate their colors (transition-colors): wait until they settle before taking the screenshot.
  await expect(toggle).toHaveCSS('background-color', 'rgb(24, 24, 24)')
  await page.locator('[data-el="header"]').screenshot({ path: 'tests/artifacts/header-desktop-1440-dark.png' })

  await toggle.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  expect(await background()).toBe('rgb(251, 251, 251)')
})

test('tablet and mobile: theme toggle and secondary CTA are not in the bar', async ({ page }) => {
  for (const width of [393, 768]) {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/')
    // The bar is the first child of <header>; the dropdown has its own toggle but is closed.
    await expect(page.locator('[data-el="header__container"] [data-el="header__theme-toggle"]')).toBeHidden()
    await expect(page.locator('[data-el="header__container"] [data-el="header__cta-secondary"]')).toBeHidden()
  }
})

test('the selected menu item is filled like a hovered one: grey in Light, lighter than the bar in Dark', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 })
  await page.goto('/')
  const fill = (id: string) => page.locator(`[data-el="header__menu-item-${id}"]`).evaluate((el) => getComputedStyle(el).backgroundColor)
  // The menu follows the blocks of the page: scrolled to the Features block, "Products" is the selected item.
  await page.locator('[data-el="features"]').evaluate((el) => el.scrollIntoView({ block: 'center' }))
  const current = page.locator('[data-el="header__menu-item-products"]')
  await expect(current).toHaveAttribute('aria-current', 'true')
  await page.mouse.move(700, 600)
  await expect(page.locator('[data-el="header__menu-item-industries"]')).not.toHaveAttribute('aria-current', 'true')
  // The fill fades in (a color transition), so it is awaited rather than read at once.
  await expect(current).toHaveCSS('background-color', 'rgb(243, 243, 243)') // surface/hover, Light = neutral/100 (#f3f3f3)
  expect(await fill('industries')).toBe('rgba(0, 0, 0, 0)') // the others have no fill until hovered
  // The same color as the fill of a hovered item.
  await page.locator('[data-el="header__menu-item-industries"]').hover()
  await expect(page.locator('[data-el="header__menu-item-industries"]')).toHaveCSS('background-color', 'rgb(243, 243, 243)')

  await page.locator('[data-el="header__theme-toggle"]').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  // The click may have moved the page (the bar was hidden, the toggle was scrolled into view): put the Features block back on the line.
  await page.locator('[data-el="features"]').evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await expect(current).toHaveAttribute('aria-current', 'true')
  await page.mouse.move(700, 600)
  await expect(current).toHaveCSS('background-color', 'rgb(38, 38, 38)') // surface/hover, Dark = neutral/800
  await page.locator('[data-el="header"]').screenshot({ path: 'tests/artifacts/header-desktop-1440-dark.png' })
})

test('the Header is one reusable component: the page chooses the current item (UI Kit shows two of them)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/ui-kit')
  const headers = page.locator('[data-el="ui-kit__header"] [data-el="header"]')
  await expect(headers).toHaveCount(2)
  await expect(headers.nth(0).locator('[data-el="header__menu"] [aria-current="true"]')).toHaveText('Products')
  await expect(headers.nth(1).locator('[data-el="header__menu"] [aria-current="true"]')).toHaveText('Industries')
  // In the UI Kit they are not pinned: they stay in the flow.
  expect(await headers.nth(0).evaluate((el) => getComputedStyle(el).position)).toBe('relative')
})
test.describe('Products dropdown (desktop)', () => {
  const panel = '[data-el="header__products-menu"]'
  const trigger = '[data-el="header__menu-item-products"]'

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
  })

  test('opens on hover with six products: four links, two marked Soon without a link; closes when the pointer leaves', async ({ page }) => {
    await expect(page.locator(panel)).toBeHidden()
    await page.hover(trigger)
    await expect(page.locator(panel)).toBeVisible()
    await expect(page.locator(trigger)).toHaveAttribute('aria-expanded', 'true')

    const links = page.locator(`${panel} a`)
    await expect(links).toHaveCount(4)
    expect(await links.evaluateAll((items) => items.map((item) => new URL((item as HTMLAnchorElement).href).pathname.replace(/\/$/, '')))).toEqual([
      '/crypto-processing',
      '/ramp',
      '/invoicing',
      '/mass-payouts',
    ])
    await expect(page.locator(`${panel} li`)).toHaveCount(6)
    for (const id of ['banking', 'wallet']) {
      const item = page.locator(`[data-el="header__products-item-${id}"]`)
      await expect(item).toHaveAttribute('aria-disabled', 'true')
      await expect(item).toContainText('Soon')
    }
    await expect(page.locator(panel)).toContainText('Crypto to Cash')
    await page.screenshot({ path: 'tests/artifacts/header-products-menu-1440.png', clip: { x: 0, y: 0, width: 1440, height: 520 } })

    // The pointer may cross the gap under the bar and stay on the panel.
    await page.mouse.move(400, 130)
    await page.waitForTimeout(400)
    await expect(page.locator(panel)).toBeVisible()
    await page.mouse.move(1200, 600)
    await expect(page.locator(panel)).toBeHidden()
  })

  test('keyboard: Tab to the item opens it, Escape closes it and keeps the focus on the item; Tab goes on into the products', async ({ page }) => {
    await page.focus(trigger)
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(page.locator(panel)).toBeVisible()
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-el="header__products-item-crypto-processing"]')).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(page.locator(panel)).toBeHidden()
    await expect(page.locator(trigger)).toBeFocused()
  })

  test('a click on a product leads to its page; a click on Products closes the panel and still glides to the block', async ({ page }) => {
    await page.hover(trigger)
    await page.click('[data-el="header__products-item-invoicing"]')
    await expect(page).toHaveURL(/\/invoicing$/)
  })

  test('there is no dropdown below the desktop width (the burger has its own menu)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 })
    await expect(page.locator(trigger)).toBeHidden()
    await expect(page.locator(panel)).toBeHidden()
  })
})
