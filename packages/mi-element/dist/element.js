import { createSignal } from 'mi-signal';

import { kebabToCamelCase, camelToKebabCase } from './case.js';

import { addGlobalStyles } from './styling.js';

import { refsBySelector } from './refs.js';

import { toNumber, toJson } from './utils.js';

const nameMap = {
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
    this.#controllers.forEach(controller => controller.hostConnected?.());
    const {shadowRootInit: shadowRootInit, useGlobalStyles: useGlobalStyles, template: template} = this.constructor;
    this.renderRoot = shadowRootInit ? this.shadowRoot ?? this.attachShadow(shadowRootInit) : this, 
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
}, convertType = (value, type) => type === Boolean ? null !== value : type === Number ? toNumber(value) : type === Array ? toJson(value) ?? value.split(',').map(v => v.trim()) : type === Object ? toJson(value) : value;

export { MiElement, convertType, define };
