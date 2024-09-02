import { camelToKebabCase } from './case.js';

import { createSignal } from './signal.js';

class MiElement extends HTMLElement {
  #attr={};
  #attrLc=new Map;
  #types=new Map;
  #disposers=new Set;
  #controllers=new Set;
  #changedAttr={};
  static shadowRootOptions={
    mode: 'open'
  };
  constructor() {
    super(), this.#observedAttributes(this.constructor.attributes);
  }
  #observedAttributes(attributes = {}) {
    for (const [name, value] of Object.entries(attributes)) this.#types.set(name, initialType(value)), 
    this.#attrLc.set(name.toLowerCase(), name), this.#attrLc.set(camelToKebabCase(name), name), 
    this.#attr[name] = createSignal(value), Object.defineProperty(this, name, {
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
  #getName(name) {
    return this.#attrLc.get(name) || name;
  }
  #getType(name) {
    return this.#types.get(name);
  }
  connectedCallback() {
    this.#controllers.forEach((controller => controller.hostConnected?.()));
    const {shadowRootOptions: shadowRootOptions, template: template} = this.constructor;
    this.renderRoot = shadowRootOptions ? this.shadowRoot ?? this.attachShadow(shadowRootOptions) : this, 
    this.addTemplate(template), this.render(), this.requestUpdate();
  }
  disconnectedCallback() {
    this.#disposers.forEach((remover => remover())), this.#controllers.forEach((controller => controller.hostDisconnected?.()));
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
    'Boolean' === type ? !0 === newValue || '' === newValue ? super.setAttribute(name, '') : super.removeAttribute(name) : [ 'String', 'Number' ].includes(type) || !0 === newValue ? super.setAttribute(name, newValue) : (this.#changedAttr[attr] = this[attr], 
    this[attr] = newValue, this.requestUpdate());
  }
  shouldUpdate(_changedAttributes) {
    return !0;
  }
  requestUpdate() {
    this.isConnected && requestAnimationFrame((() => {
      this.shouldUpdate(this.#changedAttr) && this.update(this.#changedAttr), this.#changedAttr = {};
    }));
  }
  addTemplate(template) {
    template instanceof HTMLTemplateElement && this.renderRoot.appendChild(template.content.cloneNode(!0));
  }
  render() {}
  update(_changedAttributes) {}
  on(eventName, listener, node = this) {
    node.addEventListener(eventName, listener), this.#disposers.add((() => node.removeEventListener(eventName, listener)));
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
  element.observedAttributes = (element.observedAttributes || Object.keys(element.attributes || [])).map((attr => attr.toLowerCase())), 
  renderTemplate(element), window.customElements.define(name, element, options);
}, renderTemplate = element => {
  if ('string' != typeof element.template) return;
  const el = document.createElement('template');
  el.innerHTML = element.template, element.template = el;
}, initialType = value => toString.call(value).slice(8, -1), convertType = (any, type) => {
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
