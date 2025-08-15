import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    coverage: {
      provider: 'istanbul'
    },
    browser: {
      enabled: true,
      name: 'firefox',
      provider: 'playwright',
      // https://playwright.dev
      providerOptions: {}
    }
  }
})
