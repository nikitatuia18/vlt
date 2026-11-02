import { expect, test } from '@playwright/test'

// The theme toggle must work on the product pages: the dark scene of Industries holds the theme only while it is on the screen.
for (const path of ['/ramp', '/invoicing', '/mass-payouts', '/crypto-processing']) {
  test(`theme toggle works on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(path)
    const root = page.locator('html')
    const toggle = page.locator('[data-el="header__theme-toggle"]')
    await expect(root).not.toHaveAttribute('data-theme', 'dark')
    await expect(toggle).toBeEnabled()
    await toggle.click()
    await expect(root).toHaveAttribute('data-theme', 'dark')
    await toggle.click()
    await expect(root).not.toHaveAttribute('data-theme', 'dark')
  })
}
