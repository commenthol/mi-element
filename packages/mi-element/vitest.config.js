import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    coverage: {
      provider: 'istanbul'
    },
    browser: {
      enabled: true,
      // https://playwright.dev
      provider: playwright(),
      instances: [
        { browser: 'firefox' }, 
        // { browser: 'chromium' }
      ],
    }
  }
})
