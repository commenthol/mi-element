import { camelToKebabCase } from './case.js';

import { createSignal } from 'mi-signal';

class MiElement extends HTMLElement {
  #attr={};
  #attrLc=new Map;
  #types=new Map;
  #disposers=new Set;
  #controllers=new Set;
  #changedAttr={};
  #dedupe=!1;
  static shadowRootOptions={
    mode: 'open'
  };
  static template;
  static get attributes() {
    return {};
  }
  static get properties() {
    return {};
  }
  constructor() {
    super(), this.#observedAttributes(this.constructor.attributes), this.#observedProperties(this.constructor.properties);
  }
  #observe(name, initialValue) {
    this.#attr[name] = createSignal(initialValue), Object.defineProperty(this, name, {
      enumerable: !0,
      get() {
        return this.#attr[name].get();
      },
      set(newValue) {
        const oldValue = this.#attr[name].get();
        oldValue !== newValue && (this.#attr[name].set(newValue), this.#changedAttr[name] = oldValue, 
        this.requestUpdate());
      }
    });
  }
  #observedAttributes(attributes = {}) {
    for (const [name, value] of Object.entries(attributes)) {
      const initial = initialValueType(value);
      this.#types.set(name, initial.type), this.#attrLc.set(name.toLowerCase(), name), 
      this.#attrLc.set(camelToKebabCase(name), name), this.#observe(name, initial.value);
    }
  }
  #observedProperties(properties = {}) {
    for (const [name, value] of Object.entries(properties)) this.#attrLc.has(name) || name in this.#attr || this.#observe(name, value);
  }
  #getName(name) {
    return this.#attrLc.get(name) || name;
  }
  #getType(name) {
    return this.#types.get(name);
  }
  connectedCallback() {
    this.#controllers.forEach(controller => controller.hostConnected?.());
    const {shadowRootOptions: shadowRootOptions, template: template} = this.constructor;
    this.renderRoot = shadowRootOptions ? this.shadowRoot ?? this.attachShadow(shadowRootOptions) : this, 
    this.addTemplate(template), this.render(), this.requestUpdate();
  }
  disconnectedCallback() {
    this.#disposers.forEach(remover => remover()), this.#controllers.forEach(controller => controller.hostDisconnected?.());
  }
  attributeChangedCallback(name, oldValue, newValue) {
    const attr = this.#getName(name), type = this.#getType(attr);
    this.#changedAttr[attr] = this[attr], this[attr] = convertType(newValue, type), 
    'Boolean' === type && 'false' === newValue && this.removeAttribute(name), this.requestUpdate();
  }
  setAttribute(name, newValue) {
    const attr = this.#getName(name);
    if (!(attr in this.#attr)) return;
    const type = this.#getType(attr);
    'Boolean' === type ? !0 === newValue || '' === newValue ? super.setAttribute(name, '') : super.removeAttribute(name) : [ 'String', 'Number' ].includes(type ?? '') || !0 === newValue ? super.setAttribute(name, newValue) : (this.#changedAttr[attr] = this[attr], 
    this[attr] = newValue, this.requestUpdate());
  }
  shouldUpdate(_changedAttributes) {
    return !0;
  }
  requestUpdate() {
    !this.#dedupe && this.isConnected && (this.#dedupe = !0, requestAnimationFrame(() => {
      this.#dedupe = !1;
      const _changedAttributes = this.#changedAttr;
      this.#changedAttr = {}, this.shouldUpdate(_changedAttributes) && this.update(_changedAttributes);
    }));
  }
  addTemplate(template) {
    if (template) {
      if (!(template instanceof HTMLTemplateElement)) throw new Error('template is not a HTMLTemplateElement');
      this.renderRoot.append(template.content.cloneNode(!0));
    }
  }
  render() {}
  update(_changedAttributes) {}
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
}

const define = (name, element, options) => {
  element.observedAttributes = (element.observedAttributes || Object.keys(element.attributes || [])).map(attr => attr.toLowerCase()), 
  renderTemplate(element), window.customElements.define(name, element, options);
}, renderTemplate = element => {
  if (element.template instanceof HTMLTemplateElement) return;
  const el = document.createElement('template');
  el.innerHTML = element.template, element.template = el;
}, initialValueType = value => {
  switch (value) {
   case Boolean:
    return {
      value: void 0,
      type: 'Boolean'
    };

   case Number:
    return {
      value: void 0,
      type: 'Number'
    };

   case String:
    return {
      value: void 0,
      type: 'String'
    };

   default:
    return {
      value: value,
      type: toString.call(value).slice(8, -1)
    };
  }
}, convertType = (any, type) => {
  switch (type) {
   case 'Number':
    return (any => {
      const n = Number(any);
      return isNaN(n) ? any : n;
    })(any);

   case 'Boolean':
    return 'false' !== any && ('' === any || !!any);
  }
  return any;
};

export { MiElement, convertType, define };
