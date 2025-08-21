// SPDX-License-Identifier: MIT
// from https://www.npmjs.com/package/preact-icu src/I18n.js

import { cached } from 'intl-messageformat-tiny'
import { cookieParse, cookieSerialize } from './cookie.js'

/** @typedef {import('./types.js').I18nOptions} I18nOptions */
/** @typedef {{ok: boolean, status: number, lng: string, ns: string}} LoadResponse */

const format = cached()

const isBrowser = globalThis?.navigator?.language && globalThis?.document

const TRANSLATIONS = 'translations'

const defaultOptions = {
  supportedLngs: [],
  version: '',
  ns: [TRANSLATIONS],
  defaultNs: TRANSLATIONS,
  localesPath: '/locales/{lng}/{ns}.json?v={version}',
  useLabel: false,
  debug: false,
  cookie: {
    name: 'lc',
    path: '/'
  }
}

let log = {
  debug: (..._args) => {},
  error: (..._args) => {}
}

/**
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
const uniq = (arr) => [...new Set(arr.filter(Boolean))]

/**
 * @param {string} [lng]
 * @returns {string}
 */
const mainLng = (lng) => (lng || '').split('-', 1)[0]

/**
 * @param {string} lng
 * @param {string[]} supportedLngs
 * @param {string[]} [browserLngs]
 * @returns {string[]} matching variants (if any)
 */
export const reduceSupportedLangs = (lng, supportedLngs, browserLngs = []) => {
  const langs = uniq(
    [lng, ...browserLngs].filter(Boolean).reduce((curr, nextLng) => {
      // @ts-expect-error
      curr.push(nextLng, mainLng(nextLng))
      return curr
    }, [])
  )
  // languages are in order of user preference
  return langs.reduce((curr, nextLng) => {
    if (supportedLngs.includes(nextLng)) {
      curr.push(nextLng)
    }
    return curr
  }, [])
}

export class I18n {
  /**
   * @param {I18nOptions} options
   */
  constructor(options) {
    const {
      supportedLngs,
      lng,
      defaultNs,
      fallbackLng = supportedLngs[0],
      resources = {},
      debug,
      ...opts
    } = { ...defaultOptions, ...options }
    if (!supportedLngs?.length) {
      throw new Error('no supportedLngs')
    }
    this.options = opts
    /** default namespace */
    this.defaultNs = defaultNs
    /** fallback language */
    this.fallbackLng = fallbackLng
    /** selected language for translation, must be part of supportedLngs */
    this.lng = lng || this.fallbackLng
    /** supported languages with translations */
    this.supportedLngs = supportedLngs
    /** user assigned language with variant */
    this.userLng = lng
    /** available resources (if any) */
    this.resources = resources
    if (debug) {
      // @ts-expect-error
      log = opts.log || console
    }
    this.t = this.t.bind(this)
    this.getLanguages = this.getLanguages.bind(this)
    this._setLanguage()
  }

  /**
   * translation function
   * @param {string} label
   * @param {object} values
   * @returns {string}
   */
  t(label, values = {}) {
    const { lng: language, fallbackLng, defaultNs } = this
    const { lng = language, ns = defaultNs, ...msgValues } = values
    const message =
      this.resources[lng]?.[ns]?.[label] ||
      this.resources[fallbackLng]?.[ns]?.[label] ||
      (this.options.useLabel ? label : '')
    return format(message, msgValues, lng)
  }

  /**
   * get the user selected (cookie) or browser language
   * @returns {string}
   */
  getUserLanguage() {
    if (!isBrowser) {
      return this.fallbackLng
    }
    const [cookieLng, browserLng] = this._getSettings()
    log.debug(
      'getUserLanguage: cookieLng:%s browserLng:%s',
      cookieLng,
      browserLng
    )
    return cookieLng || browserLng
  }

  /**
   * reset user selected language by deleting language cookie
   */
  resetUserLanguage() {
    if (!isBrowser) return
    const { name, ...opts } = this.options.cookie
    log.debug('reset cookie')
    // @ts-expect-error
    document.cookie = cookieSerialize(name, '', { ...opts, expires: 0 })
    this._setLanguage()
  }

  /**
   * @protected
   * @returns {[cookieLng:string, browserLng:string]}
   */
  _getSettings() {
    const { name } = this.options.cookie
    // @ts-expect-error
    const cookieLng = cookieParse(document.cookie)[name]
    const browserLng = globalThis?.navigator?.language
    console.log(document.cookie, cookieLng, browserLng)
    return [cookieLng, browserLng]
  }

  /**
   * @protected
   * set language cookie using cookie options
   */
  _setCookie() {
    if (!isBrowser) return
    const [cookieLng, browserLng] = this._getSettings()
    const { userLng: language = '' } = this
    if (cookieLng === language) {
      return
    }
    let expires
    let value = language
    if ([browserLng, mainLng(browserLng)].includes(language)) {
      expires = 0
      value = ''
    }
    const { name, ...opts } = this.options.cookie
    log.debug('_setCookie: %s:%s', expires === 0 ? 'reset' : 'set', language)
    // @ts-expect-error
    document.cookie = cookieSerialize(name, value, { ...opts, expires })
  }

  /**
   * @protected
   * @param {string} [lng]
   * @returns {string[]}
   */
  _setLanguage(lng) {
    const _lng = lng || this.getUserLanguage()
    const { supportedLngs } = this
    const browserLngs = globalThis?.navigator?.languages || []
    // @ts-expect-error
    const variants = reduceSupportedLangs(_lng, supportedLngs, browserLngs)

    if (!variants.length) {
      this.userLng = this.lng = this.fallbackLng
      const [main] = this.lng.split('-')
      variants.push(...uniq([this.lng, main]))
    } else {
      this.userLng = _lng
      this.lng = variants[0]
    }

    this._setCookie()
    return variants
  }

  /**
   * get all supported languages
   * @returns {string[]}
   */
  getLanguages() {
    return this.supportedLngs
  }

  /**
   * changes the language
   * @param {string} [lng]
   * @return {Promise<void>}
   */
  async changeLanguage(lng) {
    const variants = this._setLanguage(lng)
    log.debug('changeLanguage: lng:%s variants:%s', lng, variants)
    await this.loadLanguages(variants)

    let loadedLng = this.fallbackLng
    for (const variant of variants) {
      if (this.resources[variant]?.[this.defaultNs]) {
        loadedLng = variant
        break
      }
    }
    log.debug('changeLanguage: loadedLng:%s', loadedLng)
    const mainLoadedLng = mainLng(loadedLng)
    if (mainLng(lng || variants[0]) !== mainLoadedLng) {
      // find first matching lng with same mainLng
      const matchLng = variants.find(
        (variant) => mainLng(variant) === mainLoadedLng
      )
      this._setLanguage(matchLng || loadedLng)
    }
    this._setCookie()
  }

  /**
   * @param {string} ns
   * @return {Promise<void>}
   */
  async changeNamespace(ns) {
    this.defaultNs = ns
    await this.loadLanguages([this.lng, this.fallbackLng])
  }

  /**
   * @param {string[]} lngs
   * @param {string[]} [ns]
   * @return {Promise<(LoadResponse|undefined|void)[]>}
   */
  async loadLanguages(lngs = [], ns = []) {
    const _lngs = uniq(lngs)
    const _ns = uniq([...ns, this.defaultNs])
    if (!_lngs.length || !_ns.length) {
      log.error("can't load without languages or namespaces")
      return []
    }
    const loaders = []
    for (const lng of _lngs) {
      for (const ns of _ns) {
        if (!this.resources[lng]?.[ns]) {
          loaders.push(this._load({ lng, ns }).catch((err) => log.error(err)))
        }
      }
    }
    const result = await Promise.all(loaders)
    return result
  }

  /**
   * @protected
   * @param {{
   *  lng: string
   *  ns: string
   * }} param0
   * @return {Promise<undefined|LoadResponse>}
   */
  async _load({ lng, ns }) {
    const { version } = this.options
    const url = format(this.options.localesPath, { lng, ns, version })
    const res = await fetch(url).catch((err) => log.error(err))
    this.resources[lng] = this.resources[lng] || {}
    const { ok = false, status = -1 } = res || {}
    if (ok && res) {
      log.debug('_load: lng=%s ns=%s', lng, ns)
      const labels = await res.json()
      this.resources[lng][ns] = labels
    } else {
      log.error('_load: error loading url=%s', url)
    }
    return { ok, status, lng, ns }
  }
}
