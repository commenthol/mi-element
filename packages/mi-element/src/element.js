import { camelToKebabCase } from './case.js'
import { createSignal } from 'mi-signal'

/**
 * @typedef {object} HostController controller
 * @property {() => void} hostConnected is called when host element is added to
 * the DOM, usually with connectedCallback()
 * @property {() => void} hostDisconnected is called when host element is
 * removed from the DOM, usually with disconnectedCallback()
 */

/**
 * class extending HTMLElement to enable deferred rendering on attribute changes
 * either via `setAttribute(name, value)` or `this[name] = value`.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
 * @example
 * ```js
 * class Example extends MiElement {
 *  // define all observed attributes with its default initial value.
 *  // for yet to defined numbers, boolean or strings use `Number`, `Boolean`, `String`
 *  // attributes are accessible via `this[prop]`
 *  // avoid using attributes which are HTMLElement properties e.g. className
 *  static get attributes () {
 *    return { text: 'Hi', num: Number }
 *  }
 *  render() {
 *    this.renderRoot.innerHTML = `<div></div>`
 *    this.refs = {
 *      div: this.renderRoot.querySelector('div')
 *    }
 *  }
 *  // render method called every time an attribute changes
 *  update() {
 *    this.refs.div.textContent = this.text
 *  }
 * }
 * // create a custom element with the `define` function (see below)
 * define('x-example', Example)
 * // create a DOM node and re-render via attribute or property changes
 * const elem = document.createElement('x-example')
 * elem.setAttribute('text', 'set attribute')
 * // or if change is triggered by property
 * elem.text = 'set property'
 * ```
 */
export class MiElement extends HTMLElement {
  /** all attributes are signals! */
  #attr = {}
  /**
   * lower-cased or kebab-case attribute names;
   * Map<lower-cased and kebab-cased attr name, camelCased attr name as string>
   * @type {Map<string, string>}
   */
  #attrLc = new Map()
  /**
   * initial types (from `static get attributes() { return {} }`)
   * Map<camelCased attribute name, type as string>
   * @type {Map<string,string>}
   */
  #types = new Map()
  #disposers = new Set()
  #controllers = new Set()
  #changedAttr = {}
  #dedupe = false

  /**
   * Default options used when calling `attachShadow`. Used in
   * `connectedCallback()`.
   * If override is `null`, no shadow-root will be attached.
   * @type {{mode: string}|null}
   */
  static shadowRootOptions = { mode: 'open' }

  /**
   * defines template for render().
   * @type {String|HTMLTemplateElement}
   */
  static template

  /**
   * observable attributes
   * @returns {Record<PropertyKey, unknown>|{}}
   */
  static get attributes() {
    return {}
  }
  /**
   * observable properties
   * @returns {Record<PropertyKey, unknown>|{}}
   */
  static get properties() {
    return {}
  }

  constructor() {
    super()
    // @ts-expect-error
    this.#observedAttributes(this.constructor.attributes)
    // @ts-expect-error
    this.#observedProperties(this.constructor.properties)
  }

  #observe(name, initialValue) {
    this.#attr[name] = createSignal(initialValue)
    Object.defineProperty(this, name, {
      enumerable: true,
      get() {
        return this.#attr[name].get()
      },
      set(newValue) {
        const oldValue = this.#attr[name].get()
        if (oldValue === newValue) return
        this.#attr[name].set(newValue)
        this.#changedAttr[name] = oldValue
        this.requestUpdate()
      }
    })
  }

  /**
   * requests update on component when property changes
   * @param {Record<string, any>} [attributes]
   */
  #observedAttributes(attributes = {}) {
    for (const [name, value] of Object.entries(attributes)) {
      const initial = initialValueType(value)
      this.#types.set(name, initial.type)
      this.#attrLc.set(name.toLowerCase(), name)
      this.#attrLc.set(camelToKebabCase(name), name)
      this.#observe(name, initial.value)
    }
  }

  /**
   * define (direct) properties
   * @param {Record<string, any>} [properties]
   */
  #observedProperties(properties = {}) {
    for (const [name, value] of Object.entries(properties)) {
      if (this.#attrLc.has(name) || name in this.#attr) {
        continue
      }
      this.#observe(name, value)
    }
  }

  /**
   * return camelCased value instead of possible lowercased
   * @param {string} name
   * @returns
   */
  #getName(name) {
    return this.#attrLc.get(name) || name
  }

  #getType(name) {
    return this.#types.get(name)
  }

  /**
   * creates the element's renderRoot, sets up styling
   * @category lifecycle
   */
  connectedCallback() {
    this.#controllers.forEach((controller) => controller.hostConnected?.())
    // create render root
    // @ts-expect-error
    const { shadowRootOptions, template } = this.constructor
    this.renderRoot = shadowRootOptions
      ? (this.shadowRoot ?? this.attachShadow(shadowRootOptions))
      : this
    this.addTemplate(template)
    // trigger initial rendering such that children can be added via JS
    this.render()
    // and update
    this.requestUpdate()
  }

  /**
   * unsubscribe from all events and disconnect controllers
   */
  disconnectedCallback() {
    // unsubscribe from all subscriptions
    this.#disposers.forEach((remover) => remover())
    // disconnect all controllers
    this.#controllers.forEach((controller) => controller.hostDisconnected?.())
  }

  /**
   * @param {string} name change attribute
   * @param {any} oldValue
   * @param {any} newValue new value
   */
  attributeChangedCallback(name, oldValue, newValue) {
    const attr = this.#getName(name)
    const type = this.#getType(attr)
    this.#changedAttr[attr] = this[attr]
    this[attr] = convertType(newValue, type)
    // correct initial setting of `trueish="false"` otherwise there's no chance
    // to overwrite a trueish value. The case `falsish="true"` is covered.
    if (type === 'Boolean' && newValue === 'false') {
      this.removeAttribute(name)
    }
    this.requestUpdate()
  }

  /**
   * Set string and number attributes on element only. Set all other values as
   * properties to avoid type conversion to and from string
   * @param {string} name
   * @param {any} newValue
   */
  setAttribute(name, newValue) {
    const attr = this.#getName(name)
    // only allow to change observedAttributes
    if (!(attr in this.#attr)) {
      return
    }
    const type = this.#getType(attr)

    // only set string values in these cases
    if (type === 'Boolean') {
      if (newValue === true || newValue === '') {
        super.setAttribute(name, '')
      } else {
        super.removeAttribute(name)
      }
    } else if (['String', 'Number'].includes(type ?? '') || newValue === true) {
      super.setAttribute(name, newValue)
    } else {
      this.#changedAttr[attr] = this[attr]
      this[attr] = newValue
      this.requestUpdate()
    }
  }

  /**
   * controls if component shall be updated
   * @param {Record<string,any>} [_changedAttributes] previous values of changed attributes
   * @returns {boolean}
   */
  shouldUpdate(_changedAttributes) {
    return true
  }

  /**
   * request rendering
   */
  requestUpdate() {
    if (this.#dedupe || !this.isConnected) return
    this.#dedupe = true
    requestAnimationFrame(() => {
      this.#dedupe = false
      // reset changed attributes
      const _changedAttributes = this.#changedAttr
      this.#changedAttr = {}
      if (this.shouldUpdate(_changedAttributes)) {
        this.update(_changedAttributes)
      }
    })
  }

  /**
   * adds a template to renderRoot
   * @param {HTMLTemplateElement} template
   */
  addTemplate(template) {
    if (!(template instanceof HTMLTemplateElement)) {
      throw new Error('template is not a HTMLTemplateElement')
    }
    this.renderRoot.append(template.content.cloneNode(true))
  }

  /**
   * initial rendering
   */
  render() {}

  /**
   * called every time the components needs a render update
   * @param {Record<string,any>} [_changedAttributes] previous values of changed
   * attributes
   */
  update(_changedAttributes) {}

  /**
   * Adds listener function for eventName. listener is removed before component
   * disconnects
   * @param {string} eventName
   * @param {EventListenerOrEventListenerObject} listener
   * @param {Node|Document|Window} [node=this]
   */
  on(eventName, listener, node = this) {
    node.addEventListener(eventName, listener)
    this.#disposers.add(() => node.removeEventListener(eventName, listener))
  }

  /**
   * Adds one-time listener function for eventName. The next time eventName is
   * triggered, this listener is removed and then invoked.
   * @param {string} eventName
   * @param {EventListenerOrEventListenerObject} listener
   * @param {Node|Document|Window} node
   */
  once(eventName, listener, node = this) {
    node.addEventListener(eventName, listener, { once: true })
  }

  /**
   * Unsubscribe a listener function for disposal on disconnectedCallback()
   * @param {...function} listeners
   */
  dispose(...listeners) {
    for (const listener of listeners) {
      if (typeof listener !== 'function') {
        throw new TypeError('listener must be a function')
      }
      this.#disposers.add(listener)
    }
  }

  /**
   * adds a connected controller
   * @param {HostController} controller
   */
  addController(controller) {
    this.#controllers.add(controller)
    if (this.isConnected) {
      // if already connected call hostConnected() immediately
      /* istanbul ignore next */
      controller.hostConnected?.()
    }
  }

  /**
   * removes a connected controller
   * @param {HostController} controller
   */
  /* istanbul ignore next 3 */
  removeController(controller) {
    this.#controllers.delete(controller)
  }
}

/**
 * defines a custom element adding observedAttributes from default static
 * attributes
 * NOTE: camelCased attributes get lowercased!
 * ```html
 * <custom-element myAttr="1">
 * <!-- is equal to -->
 * <custom-element myattr="1">
 * ```
 * @param {string} name custom element tag
 * @param {typeof MiElement} element
 * @param {object} [options]
 */
export const define = (name, element, options) => {
  // @ts-expect-error
  element.observedAttributes = // @ts-expect-error
    (element.observedAttributes || Object.keys(element.attributes || [])).map(
      (attr) => attr.toLowerCase()
    )
  renderTemplate(element)
  window.customElements.define(name, element, options)
}

// --- utils

/**
 * convert (and cache) the static template to HTMLTemplateElement
 * @param {typeof MiElement} element
 */
const renderTemplate = (element) => {
  if (element.template instanceof HTMLTemplateElement) {
    return
  }
  const el = document.createElement('template')
  el.innerHTML = element.template
  element.template = el
}

const initialValueType = (value) => {
  switch (value) {
    case Boolean:
      return { value: undefined, type: 'Boolean' }
    case Number:
      return { value: undefined, type: 'Number' }
    case String:
      return { value: undefined, type: 'String' }
    default:
      return { value, type: toString.call(value).slice(8, -1) }
  }
}

const toNumber = (any) => {
  const n = Number(any)
  return isNaN(n) ? any : n
}

export const convertType = (any, type) => {
  // setAttribute prevents passing Object or Array type. no further conversion required
  switch (type) {
    case 'Number':
      return toNumber(any)
    case 'Boolean':
      // boolean values are set via setAttribute as empty string
      if (any === 'false') {
        return false
      }
      return any === '' || !!any
  }
  return any
}
