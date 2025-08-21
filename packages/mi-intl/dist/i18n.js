import { cached } from 'intl-messageformat-tiny';

import { cookieSerialize, cookieParse } from './cookie.js';

const format = cached(), isBrowser = globalThis?.navigator?.language && globalThis?.document, defaultOptions = {
  supportedLngs: [],
  version: '',
  ns: [ "translations" ],
  defaultNs: "translations",
  localesPath: '/locales/{lng}/{ns}.json?v={version}',
  useLabel: !1,
  debug: !1,
  cookie: {
    name: 'lc',
    path: '/'
  }
};

let log = {
  debug: (..._args) => {},
  error: (..._args) => {}
};

const uniq = arr => [ ...new Set(arr.filter(Boolean)) ], mainLng = lng => (lng || '').split('-', 1)[0], reduceSupportedLangs = (lng, supportedLngs, browserLngs = []) => uniq([ lng, ...browserLngs ].filter(Boolean).reduce((curr, nextLng) => (curr.push(nextLng, mainLng(nextLng)), 
curr), [])).reduce((curr, nextLng) => (supportedLngs.includes(nextLng) && curr.push(nextLng), 
curr), []);

class I18n {
  constructor(options) {
    const {supportedLngs: supportedLngs, lng: lng, defaultNs: defaultNs, fallbackLng: fallbackLng = supportedLngs[0], resources: resources = {}, debug: debug, ...opts} = {
      ...defaultOptions,
      ...options
    };
    if (!supportedLngs?.length) throw new Error('no supportedLngs');
    this.options = opts, this.defaultNs = defaultNs, this.fallbackLng = fallbackLng, 
    this.lng = lng || this.fallbackLng, this.supportedLngs = supportedLngs, this.userLng = lng, 
    this.resources = resources, debug && (log = opts.log || console), this.t = this.t.bind(this), 
    this.getLanguages = this.getLanguages.bind(this), this._setLanguage();
  }
  t(label, values = {}) {
    const {lng: language, fallbackLng: fallbackLng, defaultNs: defaultNs} = this, {lng: lng = language, ns: ns = defaultNs, ...msgValues} = values, message = this.resources[lng]?.[ns]?.[label] || this.resources[fallbackLng]?.[ns]?.[label] || (this.options.useLabel ? label : '');
    return format(message, msgValues, lng);
  }
  getUserLanguage() {
    if (!isBrowser) return this.fallbackLng;
    const [cookieLng, browserLng] = this._getSettings();
    return log.debug('getUserLanguage: cookieLng:%s browserLng:%s', cookieLng, browserLng), 
    cookieLng || browserLng;
  }
  resetUserLanguage() {
    if (!isBrowser) return;
    const {name: name, ...opts} = this.options.cookie;
    log.debug('reset cookie'), document.cookie = cookieSerialize(name, '', {
      ...opts,
      expires: 0
    }), this._setLanguage();
  }
  _getSettings() {
    const {name: name} = this.options.cookie, cookieLng = cookieParse(document.cookie)[name], browserLng = globalThis?.navigator?.language;
    return console.log(document.cookie, cookieLng, browserLng), [ cookieLng, browserLng ];
  }
  _setCookie() {
    if (!isBrowser) return;
    const [cookieLng, browserLng] = this._getSettings(), {userLng: language = ""} = this;
    if (cookieLng === language) return;
    let expires, value = language;
    [ browserLng, mainLng(browserLng) ].includes(language) && (expires = 0, value = '');
    const {name: name, ...opts} = this.options.cookie;
    log.debug('_setCookie: %s:%s', 0 === expires ? 'reset' : 'set', language), document.cookie = cookieSerialize(name, value, {
      ...opts,
      expires: expires
    });
  }
  _setLanguage(lng) {
    const _lng = lng || this.getUserLanguage(), {supportedLngs: supportedLngs} = this, browserLngs = globalThis?.navigator?.languages || [], variants = reduceSupportedLangs(_lng, supportedLngs, browserLngs);
    if (variants.length) this.userLng = _lng, this.lng = variants[0]; else {
      this.userLng = this.lng = this.fallbackLng;
      const [main] = this.lng.split('-');
      variants.push(...uniq([ this.lng, main ]));
    }
    return this._setCookie(), variants;
  }
  getLanguages() {
    return this.supportedLngs;
  }
  async changeLanguage(lng) {
    const variants = this._setLanguage(lng);
    log.debug('changeLanguage: lng:%s variants:%s', lng, variants), await this.loadLanguages(variants);
    let loadedLng = this.fallbackLng;
    for (const variant of variants) if (this.resources[variant]?.[this.defaultNs]) {
      loadedLng = variant;
      break;
    }
    log.debug('changeLanguage: loadedLng:%s', loadedLng);
    const mainLoadedLng = mainLng(loadedLng);
    if (mainLng(lng || variants[0]) !== mainLoadedLng) {
      const matchLng = variants.find(variant => mainLng(variant) === mainLoadedLng);
      this._setLanguage(matchLng || loadedLng);
    }
    this._setCookie();
  }
  async changeNamespace(ns) {
    this.defaultNs = ns, await this.loadLanguages([ this.lng, this.fallbackLng ]);
  }
  async loadLanguages(lngs = [], ns = []) {
    const _lngs = uniq(lngs), _ns = uniq([ ...ns, this.defaultNs ]);
    if (!_lngs.length || !_ns.length) return log.error("can't load without languages or namespaces"), 
    [];
    const loaders = [];
    for (const lng of _lngs) for (const ns of _ns) this.resources[lng]?.[ns] || loaders.push(this._load({
      lng: lng,
      ns: ns
    }).catch(err => log.error(err)));
    return await Promise.all(loaders);
  }
  async _load({lng: lng, ns: ns}) {
    const {version: version} = this.options, url = format(this.options.localesPath, {
      lng: lng,
      ns: ns,
      version: version
    }), res = await fetch(url).catch(err => log.error(err));
    this.resources[lng] = this.resources[lng] || {};
    const {ok: ok = !1, status: status = -1} = res || {};
    if (ok && res) {
      log.debug('_load: lng=%s ns=%s', lng, ns);
      const labels = await res.json();
      this.resources[lng][ns] = labels;
    } else log.error('_load: error loading url=%s', url);
    return {
      ok: ok,
      status: status,
      lng: lng,
      ns: ns
    };
  }
}

export { I18n, reduceSupportedLangs };
