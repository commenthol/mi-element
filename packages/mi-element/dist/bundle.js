/*!
 * SPDX-License-Identifier: MIT
 * mi-element v0.9.6-0
 */
const context = [];

class State extends EventTarget {
  #value;
  #equals;
  constructor(value, options) {
    super();
    const {equals: equals} = options || {};
    this.#value = value, this.#equals = equals ?? ((value, nextValue) => value === nextValue);
  }
  get value() {
    return this.get();
  }
  set value(nextValue) {
    this.set(nextValue);
  }
  get() {
    const running = context[context.length - 1];
    return running && running.add(this), this.#value;
  }
  set(nextValue) {
    this.#equals(this.#value, nextValue) || (this.#value = nextValue, this.dispatchEvent(new CustomEvent('signal')));
  }
}

const createSignal = (initialValue, options) => initialValue instanceof State ? initialValue : new State(initialValue, options);

function effect(cb) {
  const running = new Set;
  context.push(running);
  try {
    cb();
  } finally {
    context.pop();
  }
  for (const dep of running) dep.addEventListener('signal', cb);
  return () => {
    for (const dep of running) dep.removeEventListener('signal', cb);
  };
}

var index = {
  State: State,
  Computed: class {
    #state;
    #unsubscribe;
    constructor(cb) {
      this.#state = new State, this.#unsubscribe = effect(() => this.#state.set(cb()));
    }
    get() {
      return this.#state.get();
    }
    unsubscribe() {
      this.#unsubscribe();
    }
  },
  createSignal: createSignal,
  effect: effect
};

class ContextProvider {
  constructor(host, context, initialValue) {
    this.host = host, this.context = context, this.state = createSignal(initialValue), 
    this.host.addController?.(this);
  }
  hostConnected() {
    this.host.addEventListener("context-request", this.onContextRequest);
  }
  hostDisconnected() {
    this.host.removeEventListener("context-request", this.onContextRequest);
  }
  set(newValue) {
    this.state.set(newValue);
  }
  get() {
    return this.state.get();
  }
  set value(newValue) {
    this.set(newValue);
  }
  get value() {
    return this.get();
  }
  onContextRequest=ev => {
    if (ev.context !== this.context) return;
    let unsubscribe;
    ev.stopPropagation(), ev.subscribe && (unsubscribe = effect(() => {
      const value = this.get();
      unsubscribe && ev.callback(value, unsubscribe);
    })), ev.callback(this.get(), unsubscribe);
  };
}

class ContextRequestEvent extends Event {
  constructor(context, callback, subscribe) {
    super("context-request", {
      bubbles: !0,
      composed: !0
    }), this.context = context, this.callback = callback, this.subscribe = subscribe;
  }
}

class ContextConsumer {
  #value;
  constructor(host, context, options) {
    const {subscribe: subscribe = !1, validate: validate = () => !0} = options || {};
    this.host = host, this.context = context, this.subscribe = !!subscribe, this.validate = validate, 
    this.unsubscribe = void 0, this.host.addController?.(this);
  }
  get() {
    return this.#value;
  }
  get value() {
    return this.#value;
  }
  hostConnected() {
    this.dispatchRequest();
  }
  hostDisconnected() {
    this.unsubscribe && (this.unsubscribe(), this.unsubscribe = void 0);
  }
  dispatchRequest() {
    this.host.dispatchEvent(new ContextRequestEvent(this.context, this._callback.bind(this), this.subscribe));
  }
  _callback(value, unsubscribe) {
    unsubscribe && (this.subscribe ? this.unsubscribe && (this.unsubscribe !== unsubscribe && this.unsubscribe(), 
    this.unsubscribe = unsubscribe) : unsubscribe()), this.validate(value) && (this.#value = value, 
    this.host.requestUpdate(value));
  }
}

const camelToKebabCase = (str = "") => str.replace(/([A-Z])/g, (_, m) => `-${m.toLowerCase()}`), kebabToCamelCase = (str = "") => str.toLowerCase().replace(/[-_]\w/g, m => m[1].toUpperCase()), classNames = (...args) => {
  const classList = [];
  return args.forEach(arg => {
    arg && ('string' == typeof arg ? classList.push(arg) : 'object' == typeof arg && Object.entries(arg).forEach(([key, value]) => {
      value && classList.push(key);
    }));
  }), classList.join(' ');
}, styleMap = (map, options) => {
  const {unit: unit = "px"} = options || {}, acc = [];
  for (const [name, value] of Object.entries(map ?? {})) {
    if (null == value) continue;
    const _unit = Number.isFinite(value) ? unit : '';
    acc.push(`${camelToKebabCase(name)}:${value}${_unit}`);
  }
  return acc.join(';');
};

let globalSheets = null;

function addGlobalStyles(renderRoot) {
  renderRoot.adoptedStyleSheets.push(...(null === globalSheets && (globalSheets = Array.from(document.styleSheets).map(({cssRules: cssRules}) => {
    const sheet = new CSSStyleSheet, css = Array.from(cssRules).map(rule => rule.cssText).join(' ');
    return sheet.replaceSync(css), sheet;
  })), globalSheets));
}

class UnsafeCss extends String {}

const unsafeCss = str => new UnsafeCss(str), escMap$1 = {
  '&': '\\26 ',
  '<': '\\3c ',
  '>': '\\3e '
}, escCss = string => string instanceof UnsafeCss ? string : unsafeCss((string => string.replace(/[&<>]/g, tag => escMap$1[tag]))('' + string)), css = (strings, ...values) => String.raw({
  raw: strings
}, ...values.map(escCss));

function refsBySelector(container, selectors) {
  const found = {};
  for (const [name, selector] of Object.entries(selectors)) found[name] = container.querySelector?.(selector);
  return found;
}

const toJson = any => {
  try {
    return JSON.parse(any);
  } catch {
    return;
  }
}, nameMap = {
  class: 'className',
  for: 'htmlFor'
};

class MiElement extends HTMLElement {
  _props={};
  #changedProps={};
  #disposers=new Set;
  #controllers=new Set;
  #updateRequested=!1;
  static get shadowRootInit() {
    return {
      mode: 'open'
    };
  }
  static template;
  static get properties() {}
  static observedAttributes=[];
  static styles='';
  static get useGlobalStyles() {
    return !1;
  }
  static createSignal=createSignal;
  constructor() {
    super();
    const {createSignal: createSignal, properties: properties} = this.constructor;
    for (const [name, {initial: initial}] of Object.entries(properties)) {
      const descriptor = Object.getOwnPropertyDescriptor(this.constructor.prototype, name);
      createSignal && (this._props[name] = createSignal()), Object.defineProperty(this, name, {
        get() {
          return descriptor?.get ? descriptor.get.call(this) : createSignal ? this._props[name].value : this._props[name];
        },
        set(value) {
          const oldValue = this[name];
          descriptor?.set ? descriptor.set.call(this, value) : createSignal ? this._props[name].value = value : this._props[name] = value, 
          oldValue !== this[name] && this.requestUpdate({
            [name]: value
          });
        }
      }), this[name] = initial;
    }
  }
  connectedCallback() {
    const {shadowRootInit: shadowRootInit, useGlobalStyles: useGlobalStyles, template: template} = this.constructor;
    this.#controllers.forEach(controller => controller.hostConnected?.()), this.renderRoot = shadowRootInit ? this.shadowRoot ?? this.attachShadow(shadowRootInit) : this, 
    this.addTemplate(template), useGlobalStyles && addGlobalStyles(this.renderRoot), 
    this.render(), this.requestUpdate();
  }
  disconnectedCallback() {
    this.#disposers.forEach(remover => remover()), this.#controllers.forEach(controller => controller.hostDisconnected?.());
  }
  attributeChangedCallback(name, _oldValue, newValue) {
    const camelName = nameMap[name] ?? kebabToCamelCase(name), properties = this.constructor?.properties, {type: type} = properties?.[camelName] ?? {}, coercedValue = convertType(newValue, type);
    if (name.startsWith('data-')) {
      const datasetName = kebabToCamelCase(name.substring(5));
      datasetName && (this.dataset[datasetName] = coercedValue);
    }
    this[camelName] = coercedValue;
  }
  requestUpdate(changedProps) {
    this.#changedProps = {
      ...this.#changedProps,
      ...changedProps
    }, !this.#updateRequested && this.renderRoot && (this.#updateRequested = !0, window.requestAnimationFrame(() => {
      this.#updateRequested = !1;
      const changedProps = this.#changedProps;
      this.#changedProps = {}, this.update(changedProps);
    }));
  }
  addTemplate(template) {
    if (template) {
      if (!(template instanceof HTMLTemplateElement)) throw new Error('template is not a HTMLTemplateElement');
      this.renderRoot.append(template.content.cloneNode(!0));
    }
  }
  render() {}
  update(_changedProps) {}
  on(eventName, listener, node = this) {
    node.addEventListener(eventName, listener), this.#disposers.add(() => node.removeEventListener(eventName, listener));
  }
  once(eventName, listener, node = this) {
    node.addEventListener(eventName, listener, {
      once: !0
    });
  }
  dispose(...listeners) {
    for (const listener of listeners) {
      if ('function' != typeof listener) throw new TypeError('listener must be a function');
      this.#disposers.add(listener);
    }
  }
  addController(controller) {
    this.#controllers.add(controller), this.isConnected && controller.hostConnected?.();
  }
  removeController(controller) {
    this.#controllers.delete(controller);
  }
  refsBySelector(selectors) {
    return refsBySelector(this.renderRoot, selectors);
  }
}

const define = (tagName, elementClass, options) => {
  if (customElements.get(tagName)) return;
  const {usedCssPrefix: usedCssPrefix = "", cssPrefix: cssPrefix = "", styles: styles} = options || {};
  if (elementClass.properties) {
    const observedAttrs = [];
    for (const [name, {attribute: attribute = !0}] of Object.entries(elementClass.properties)) attribute && observedAttrs.push(camelToKebabCase(name));
    Object.defineProperty(elementClass, 'observedAttributes', {
      get: () => observedAttrs
    });
  } else if (elementClass.observedAttributes) {
    const properties = elementClass.observedAttributes.reduce((acc, attr) => (acc[kebabToCamelCase(attr)] = {}, 
    acc), {});
    Object.defineProperty(elementClass, 'properties', {
      get: () => properties
    });
  }
  elementClass.styles && (elementClass.styles = styles || (usedCssPrefix === cssPrefix ? elementClass.styles : elementClass.styles.replaceAll(`--${usedCssPrefix}-`, cssPrefix))), 
  renderTemplate(elementClass), window.customElements.define(tagName, elementClass);
}, renderTemplate = element => {
  if (!element.template || element.template instanceof HTMLTemplateElement) return;
  const el = document.createElement('template');
  el.innerHTML = element.template || '', element.template = el;
}, convertType = (value, type) => type === Boolean ? null !== value : type === Number ? (any => {
  const n = Number(any);
  return isNaN(n) ? 0 : n;
})(value) : type === Array ? toJson(value) ?? value.split(',').map(v => v.trim()) : type === Object ? toJson(value) : value, globalRenderCache = new class {
  cnt=0;
  cache=new Map;
  last=0;
  get size() {
    return this.cache.size;
  }
  _inc() {
    return this.cnt = 268435455 & ++this.cnt, this.cnt;
  }
  clear() {
    this.cnt = 0, this.cache.clear();
  }
  set(value) {
    const now = Date.now();
    this.last < now && this.cache.clear(), this.last = now + 5e3;
    const key = '__rc:' + this._inc().toString(36);
    return this.cache.set(key, value), key;
  }
  get(key) {
    const value = this.cache.get(key);
    return this.cache.delete(key), value;
  }
};

class UnsafeHtml extends String {}

const unsafeHtml = str => new UnsafeHtml(str), escMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}, escRe = /[&<>"']/g, esc = string => string.replace(escRe, tag => escMap[tag]), escHtml = string => string instanceof UnsafeHtml ? string : unsafeHtml(esc('' + string)), escValue = any => {
  if (any instanceof UnsafeHtml) return any;
  const t = typeof any;
  if ("object" === t || "function" === t) {
    const key = globalRenderCache.set(any);
    return unsafeHtml(key);
  }
  return unsafeHtml(esc('' + any));
}, html = (strings, ...values) => unsafeHtml(String.raw({
  raw: strings
}, ...values.map(val => Array.isArray(val) ? val.map(escValue).join('') : escValue(val))));

function render(node, template, handlers = {}) {
  const refs = {};
  node.innerHTML = template.toString();
  for (let i = 0, l = node.children.length; i < l; i++) renderAttrs(node.children[i], handlers, refs);
  return refs;
}

const REF = 'ref', REF_Q = '[ref]';

function renderAttrs(node, handlers = {}, refs = {}) {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const rmAttrs = [], attrs = node.attributes;
    for (let i = 0, l = attrs.length; i < l; i++) {
      const attr = attrs[i], attrName = attr.name, code = attrName.charCodeAt(0), name = attrName.slice(1);
      let rm = 0;
      if (63 === code) toJson(attr.value) ? node.setAttribute(name, '') : node.removeAttribute(name), 
      rm = 1; else if ('...' === attr.name) {
        const obj = globalRenderCache.get(attr.value);
        if (obj && "object" == typeof obj) for (const [k, v] of Object.entries(obj)) node[k] = v;
        rm = 1;
      } else if (46 === code) node[name] = globalRenderCache.get(attr.value) ?? attr.value, 
      rm = 1; else if (64 === code) {
        const handlerName = attr.value, fn = globalRenderCache.get(handlerName);
        fn ? node.addEventListener(name, fn) : "function" == typeof handlers[handlerName] && node.addEventListener(name, handlers[handlerName]), 
        rm = 1;
      } else attr.name === REF && (refs[attr.value] = node, rm = 1);
      rm && rmAttrs.push(attr.name);
    }
    for (let i = 0, l = rmAttrs.length; i < l; i++) node.removeAttribute(rmAttrs[i]);
  }
  if (customElements.get(node.localName)) {
    const q = node.querySelectorAll(REF_Q);
    for (let el of q) {
      const refName = el.getAttribute(REF);
      refName && !refs[refName] && (refs[refName] = el);
    }
    return refs;
  }
  if (!node.children?.length) return refs;
  for (let child of Array.from(node.children)) renderAttrs(child, handlers, refs);
  return refs;
}

class Store extends State {
  constructor(actions, initialValue, options) {
    super(initialValue, options);
    for (const [action, dispatcher] of Object.entries(actions)) this[action] = data => this.set(dispatcher(data)(this.get()));
  }
}

export { ContextConsumer, ContextProvider, ContextRequestEvent, MiElement, index as Signal, Store, addGlobalStyles, classNames, convertType, css, define, escCss, escHtml, html, refsBySelector, render, renderAttrs, styleMap, unsafeCss, unsafeHtml };
