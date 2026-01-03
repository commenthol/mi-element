import { MiElement, ContextProvider } from 'mi-element'
import { I18n } from './i18n.js'

/** @typedef {import('./types.js').I18nOptions} I18nOptions */
/** @typedef {import('./types.js').IntlContext} IntlContext */

export const INTL_CONTEXT = 'mi-intl'

const requestAnimationFrameP = () =>
  new Promise((resolve) => requestAnimationFrame(resolve))

export class MiIntlProvider extends MiElement {
  static get properties() {
    return {
      /** translation version */
      version: { initial: '' },
      /** pre-selected language */
      lng: { initial: '' },
      /** default namespace */
      defaultNs: { initial: 'translations' },
      /** used namespaces, comma separated */
      ns: { type: Array, initial: 'translations' },
      /** supported languages, comma separated */
      supportedLngs: { type: Array, initial: '' },
      /** path for loading resources */
      localesPath: { initial: '/locales/{lng}/{ns}.json?v={version}' },
      /** use translation label */
      useLabel: { type: Boolean, initial: false },
      /** debugging support */
      debug: { type: Boolean, initial: false },
      /** loading state */
      loading: { type: Boolean, attribute: false }
    }
  }

  static template = '<slot></slot>'

  /**
   * @param {I18nOptions} options
   */
  set options(options) {
    this.i18n = new I18n(options)
    this.changeLanguage(options?.lng).catch(console.error)
  }

  /**
   * @protected
   * @returns {IntlContext}
   */
  _contextValue() {
    const { t, lng, getLanguages } = this.i18n ?? {
      t: () => '',
      lng: '',
      getLanguages: () => []
    }
    return {
      t,
      lng,
      getLanguages,
      changeLanguage: this.changeLanguage.bind(this),
      loading: this.loading ?? false
    }
  }

  /**
   * @param {string} [lng]
   * @returns {Promise<void>}
   */
  async changeLanguage(lng) {
    this.loading = true
    await this.i18n?.changeLanguage(lng).finally(() => {
      this.requestUpdate()
    })
    // need to wait two animations frames until all updates have been propagated
    await requestAnimationFrameP()
    await requestAnimationFrameP()
    this.loading = false
  }

  render() {
    const {
      version,
      lng,
      defaultNs,
      localesPath,
      useLabel,
      debug,
      supportedLngs,
      ns
    } = this
    this.i18n = new I18n({
      version,
      lng,
      defaultNs,
      localesPath,
      useLabel,
      debug,
      supportedLngs,
      ns
    })

    this.provider = new ContextProvider(
      this,
      INTL_CONTEXT,
      this._contextValue()
    )
    // set initial language
    this.changeLanguage(this.lng).catch(console.error)
  }

  update() {
    // updates signal and notifies all subscribers
    this.provider?.set(this._contextValue())
  }
}
