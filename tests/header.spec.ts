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
  await panel.getByRole('link', { name: 'Pricing' }).click()
  await expect(panel).toBeHidden()
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
