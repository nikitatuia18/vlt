import { defineConfig } from '@playwright/test'

// The appearance animations (docs/reveal.motion.md) are switched off for all tests by this flag: the tests measure
// positions and opacity, which would move while an element is appearing. tests/reveal.spec.ts switches them back on.
const revealOff = {
  cookies: [],
  origins: [{ origin: 'http://localhost:5173', localStorage: [{ name: 'velant-reveal', value: 'off' }] }],
}

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:5173', storageState: revealOff },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
})
