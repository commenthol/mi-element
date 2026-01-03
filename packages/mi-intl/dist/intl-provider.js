import { MiElement, ContextProvider } from 'mi-element';

import { I18n } from './i18n.js';

const INTL_CONTEXT = 'mi-intl', requestAnimationFrameP = () => new Promise(resolve => requestAnimationFrame(resolve));

class MiIntlProvider extends MiElement {
  static get properties() {
    return {
      version: {
        initial: ''
      },
      lng: {
        initial: ''
      },
      defaultNs: {
        initial: 'translations'
      },
      ns: {
        type: Array,
        initial: 'translations'
      },
      supportedLngs: {
        type: Array,
        initial: ''
      },
      localesPath: {
        initial: '/locales/{lng}/{ns}.json?v={version}'
      },
      useLabel: {
        type: Boolean,
        initial: !1
      },
      debug: {
        type: Boolean,
        initial: !1
      },
      loading: {
        type: Boolean,
        attribute: !1
      }
    };
  }
  static template='<slot></slot>';
  set options(options) {
    this.i18n = new I18n(options), this.changeLanguage(options?.lng).catch(console.error);
  }
  _contextValue() {
    const {t: t, lng: lng, getLanguages: getLanguages} = this.i18n ?? {
      t: () => '',
      lng: '',
      getLanguages: () => []
    };
    return {
      t: t,
      lng: lng,
      getLanguages: getLanguages,
      changeLanguage: this.changeLanguage.bind(this),
      loading: this.loading ?? !1
    };
  }
  async changeLanguage(lng) {
    this.loading = !0, await (this.i18n?.changeLanguage(lng).finally(() => {
      this.requestUpdate();
    })), await requestAnimationFrameP(), await requestAnimationFrameP(), this.loading = !1;
  }
  render() {
    const {version: version, lng: lng, defaultNs: defaultNs, localesPath: localesPath, useLabel: useLabel, debug: debug, supportedLngs: supportedLngs, ns: ns} = this;
    this.i18n = new I18n({
      version: version,
      lng: lng,
      defaultNs: defaultNs,
      localesPath: localesPath,
      useLabel: useLabel,
      debug: debug,
      supportedLngs: supportedLngs,
      ns: ns
    }), this.provider = new ContextProvider(this, "mi-intl", this._contextValue()), 
    this.changeLanguage(this.lng).catch(console.error);
  }
  update() {
    this.provider?.set(this._contextValue());
  }
}

export { INTL_CONTEXT, MiIntlProvider };
