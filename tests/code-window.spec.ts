import { expect, test, type Page } from '@playwright/test'
import { codeScripts } from '../src/components/blocks/Global/codeWindow/codeScripts'
import { buildCycle, frameAt, typing } from '../src/components/blocks/Global/codeWindow/typingCycle'

const cycle = buildCycle(codeScripts)
const lengthOf = (index: number) => cycle.scripts[index].text.length

test('code window: the cycle types, holds, erases, then moves to the next request and loops', () => {
  expect(frameAt(cycle, 0)).toMatchObject({ index: 0, chars: 0 })

  const typed = typing.lead + (cycle.scripts[0].times.at(-1) ?? 0)
  expect(frameAt(cycle, typed - 1).chars).toBeLessThan(lengthOf(0))
  expect(frameAt(cycle, typed + 100)).toMatchObject({ index: 0, chars: lengthOf(0) })
  expect(frameAt(cycle, typed + typing.hold + typing.erase / 2).chars).toBeLessThan(lengthOf(0))

  // The tab switches when the first request is erased, the second starts from nothing.
  expect(frameAt(cycle, cycle.durations[0] + 10)).toMatchObject({ index: 1, chars: 0 })
  expect(frameAt(cycle, cycle.total + 10)).toMatchObject({ index: 0, chars: 0 })
})

test('code window: the characters appear one after another, never backwards while typing', () => {
  let last = 0
  for (let time = 0; time < typing.lead + (cycle.scripts[0].times.at(-1) ?? 0); time += 7) {
    const { chars } = frameAt(cycle, time)
    expect(chars).toBeGreaterThanOrEqual(last)
    last = chars
  }
})

const open = async (page: Page, width: number, height: number) => {
  await page.setViewportSize({ width, height })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => {
    const section = document.querySelector('[data-el="global"]') as HTMLElement
    const top = section.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, top + 0.97 * (section.offsetHeight - window.innerHeight))
  })
  await page.waitForTimeout(1500)
}

test('code window: without motion the first request is shown finished (the test flag switches the motion off)', async ({ page }) => {
  await open(page, 1440, 900)
  const code = page.locator('[data-el="global__code"]')
  await expect(code).toBeVisible()
  await expect(code.locator('[data-el="global__code-body"]')).toContainText('POST /v1/payments')
  await expect(code.locator('[data-el="global__code-body"]')).toContainText('status: "pending"')
  await expect(code).toHaveAttribute('aria-hidden', 'true')
})

test('code window: it stays above the title, fully opaque, and the title still fits the screen', async ({ page }) => {
  await open(page, 1440, 900)
  const code = await page.locator('[data-el="global__code"]').boundingBox()
  const title = await page.locator('[data-el="global__title"]').boundingBox()
  expect(code && title && code.y + code.height <= title.y + 1).toBe(true)
  expect(title && title.y + title.height).toBeLessThanOrEqual(900)
  await expect(page.locator('[data-el="global__code"]')).toHaveCSS('opacity', '1')
})

for (const [width, height] of [
  [393, 850],
  [768, 1000],
  [1023, 800],
  [1280, 720],
]) {
  test(`code window: hidden on ${width}x${height} (phone, tablet, low screen)`, async ({ page }) => {
    await open(page, width, height)
    await expect(page.locator('[data-el="global__code"]')).toBeHidden()
  })
}

test('code window: shown from 1024 px on a screen at least 800 px high', async ({ page }) => {
  await open(page, 1024, 800)
  await expect(page.locator('[data-el="global__code"]')).toBeVisible()
})

// The motion is switched on again here (the other tests run with the appearance off).
test.describe('code window with motion', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('code window: it moves a little away from the mouse and comes back, and it types', async ({ page }) => {
    await open(page, 1440, 900)
    await page.waitForTimeout(1500)
    const code = page.locator('[data-el="global__code"]')
    const body = code.locator('[data-el="global__code-body"]')

    // It types: the text changes between two looks (the typing of the first request takes about five seconds).
    const first = await body.innerText()
    await page.waitForTimeout(700)
    expect(await body.innerText()).not.toBe(first)

    const offset = () => code.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).e)

    await page.mouse.move(0, 450)
    await page.waitForTimeout(1500)
    const left = await offset()
    await page.mouse.move(1439, 450)
    await page.waitForTimeout(1500)
    const right = await offset()
    expect(left).toBeGreaterThan(10)
    expect(right).toBeLessThan(-10)
  })
})
