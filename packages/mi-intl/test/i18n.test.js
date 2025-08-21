import { describe, it, beforeAll, beforeEach, assert } from 'vitest'
import { I18n } from '../src/index.js'

const nap = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

describe('I18n', () => {
  const supportedLngs = ['en', 'es', 'fr']
  const defaultOptions = {
    supportedLngs,
    version: '1.0.0',
    ns: ['translations'],
    defaultNs: 'translations',
    localesPath: '/example/{lng}.json?v={version}',
    useLabel: false,
    debug: true,
    cookie: {
      name: 'lc',
      path: '/'
    }
  }

  beforeAll(() => {
    Object.defineProperty(navigator, 'language', {
      value: 'en-US',
      configurable: true
    })
  })

  beforeEach(() => {
    document.body.innerHTML = null
  })

  describe('constructor', () => {
    it('should throw an error if no supportedLngs are provided', () => {
      assert.throws(() => new I18n({}), 'no supportedLngs')
    })

    it('should initialize with default options', () => {
      const i18n = new I18n(defaultOptions)
      assert.equal(i18n.lng, 'en')
      assert.equal(i18n.fallbackLng, 'en')
      assert.deepEqual(i18n.supportedLngs, supportedLngs)
    })

    it('should initialize with custom options', () => {
      const customOptions = {
        ...defaultOptions,
        fallbackLng: 'fr'
      }
      const i18n = new I18n(customOptions)
      assert.equal(i18n.fallbackLng, 'fr')
    })
  })

  describe('t method', () => {
    it('should return the translation for a given label', () => {
      const resources = {
        en: {
          translations: {
            hello: 'Hello'
          }
        }
      }
      const i18n = new I18n({ ...defaultOptions, resources })
      assert.equal(i18n.t('hello'), 'Hello')
    })

    it('should return the label if translation is not found and useLabel is true', () => {
      const i18n = new I18n({ ...defaultOptions, useLabel: true })
      assert.equal(i18n.t('missing'), 'missing')
    })

    it('should return an empty string if translation is not found and useLabel is false', () => {
      const i18n = new I18n(defaultOptions)
      assert.equal(i18n.t('missing'), '')
    })

    it('should use fallback language if translation is not found in current language', () => {
      const resources = {
        en: {
          translations: {
            hello: 'Hello'
          }
        },
        es: {
          translations: {
            // No hello translation in Spanish
          }
        }
      }
      const i18n = new I18n({ ...defaultOptions, lng: 'es', resources })
      assert.equal(i18n.t('hello'), 'Hello')
    })
  })

  describe('getUserLanguage method', () => {
    it('should return the fallback language if not in browser environment', async () => {
      document.cookie = 'lc=; Max-Age=0'
      await nap()
      const i18n = new I18n(defaultOptions)
      const actual = i18n.getUserLanguage()
      assert.equal(actual, 'en-US')
    })

    it('should return the cookie language if available', async () => {
      document.cookie = 'lc=es'
      Object.defineProperty(navigator, 'language', {
        value: 'en-US',
        configurable: true
      })
      await nap()
      const i18n = new I18n(defaultOptions)
      const actual = i18n.getUserLanguage()
      assert.equal(actual, 'es')
    })

    it('should return the browser language if cookie is not available', async () => {
      document.cookie = 'lc=; Max-Age=0'
      Object.defineProperty(navigator, 'language', {
        value: 'fr',
        configurable: true
      })
      await nap()
      const i18n = new I18n(defaultOptions)
      assert.equal(i18n.getUserLanguage(), 'fr')
    })
  })

  describe('resetUserLanguage method', () => {
    it('should reset the language cookie', () => {
      document.cookie = 'lc=es'
      const i18n = new I18n(defaultOptions)
      i18n.resetUserLanguage()
      assert.equal(document.cookie, '')
    })
  })

  describe('changeLanguage method', () => {
    beforeEach(async () => {
      document.cookie = 'lc=; Max-Age=0'
      await nap()
    })

    it('should change the language and load resources', async () => {
      const i18n = new I18n(defaultOptions)
      await i18n.changeLanguage('es')
      assert.equal(i18n.lng, 'es')
    })

    it('should use fallback language if the requested language is not supported', async () => {
      const i18n = new I18n(defaultOptions)
      await i18n.changeLanguage('de')
      assert.equal(i18n.lng, 'en')
    })
  })

  describe('changeNamespace method', () => {
    it('should change the namespace and load resources', async () => {
      const i18n = new I18n(defaultOptions)
      await i18n.changeNamespace('newNs')
      assert.equal(i18n.defaultNs, 'newNs')
    })
  })

  describe('loadLanguages method', () => {
    it('should load resources for given languages and namespaces', async () => {
      const i18n = new I18n(defaultOptions)
      const result = await i18n.loadLanguages(['en'], ['translations'])
      assert.isArray(result)
    })

    it('should return an empty array if no languages or namespaces are provided', async () => {
      const i18n = new I18n(defaultOptions)
      const result = await i18n.loadLanguages([], [])
      assert.deepEqual(result, [])
    })
  })
})
