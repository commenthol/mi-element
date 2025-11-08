import { MiElement, ContextProvider } from 'mi-element';

import { I18n } from './i18n.js';

const INTL_CONTEXT = 'mi-intl', requestAnimationFrameP = () => new Promise(resolve => requestAnimationFrame(resolve));

class MiIntlProvider extends MiElement {
  version='';
  lng='';
  defaultNs='';
  ns='';
  supportedLngs='';
  localesPath='';
  useLabel=!1;
  debug=!1;
  static get attributes() {
    return {
      version: '',
      lng: String,
      defaultNs: 'translations',
      ns: 'translations',
      supportedLngs: '',
      localesPath: '/locales/{lng}/{ns}.json?v={version}',
      useLabel: Boolean,
      debug: !1
    };
  }
  static get properties() {
    return {
      loading: !1
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
    const supportedLngs = this.supportedLngs.split(','), ns = this.ns.split(',');
    this.i18n = new I18n({
      ...this,
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
