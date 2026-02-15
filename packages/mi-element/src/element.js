import { createSignal } from 'mi-signal'
import { kebabToCamelCase, camelToKebabCase } from './case.js'
import { addGlobalStyles } from './styling.js'
import { refsBySelector } from './refs.js'
import { toNumber, toJson } from './utils.js'

/**
 * Mapping of attribute names to property names
 */
const nameMap = {
  class: 'className',
  for: 'htmlFor'
}

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
 *  // define all observed attributes and define its type,
 *  // either use String/'', Number/0, Boolean/true, Array/[], Object/{}.
 *  // Objects and Arrays are deserialized from JSON.
 *  // Attributes are accessible via `this[prop]` as camelCased properties.
 *  // camelCased attributes are converted to kebab-case automatically.
 *  // Avoid using attributes which are HTMLElement properties e.g. className
 *  static get attributes () {
 *    return { text: '', num: Number }
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
  /** all properties are signals! */
  _props = {}
  /** changed properties */
  #changedProps = {}

  #disposers = new Set()
  #controllers = new Set()
  #updateRequested = false

  /**
   * Default options used when calling `attachShadow`. Used in
   * `connectedCallback()`.
   * If override is `null`, no shadow-root will be attached.
   * @type {{mode: string}|null}
   */
  static get shadowRootInit() {
    return { mode: 'open' }
  }

  /**
   * defines template for render().
   * @type {String|HTMLTemplateElement}
   */
  static template

  /**
   * used to define observedAttributes and booleanAttributes during registration
   * @returns {Record<string, {attribute?: boolean, type?:String|Number|Boolean|Array|Object, initial?: any}>} attribute name to isBoolean map
   */
  static get properties() {
    // to be overridden
    // @ts-expect-error
    return undefined
  }
  /**
   * @returns {string[]}
   */
  static observedAttributes = []

  /**
   * @returns {string} css styles
   */
  static styles = ''
  /**
   * Whether to use global styles instead of scoped styles.
   * @returns {boolean}
   */
  static get useGlobalStyles() {
    return false
  }

  /**
   * Define createSignal function for properties.
   * Signal values are set with the .value property
   * @returns {import('mi-signal').createSignal|null} createSignal function
   */
  static createSignal = createSignal

  constructor() {
    super()
    // @ts-expect-error
    const { createSignal, properties } = this.constructor
    for (const [name, { initial }] of Object.entries(properties)) {
      // allow overwrites with setter, getters
      const descriptor = Object.getOwnPropertyDescriptor(
        this.constructor.prototype,
        name
      )
      if (createSignal) {
        this._props[name] = createSignal()
      }
      Object.defineProperty(this, name, {
        get() {
          if (descriptor?.get) {
            return descriptor.get.call(this)
          }
          return createSignal ? this._props[name].value : this._props[name]
        },
        set(value) {
          const oldValue = this[name]
          if (descriptor?.set) {
            descriptor.set.call(this, value)
          } else if (createSignal) {
            this._props[name].value = value
          } else {
            this._props[name] = value
          }
          if (oldValue !== this[name]) {
            this.requestUpdate({ [name]: value })
          }
        }
      })
      // set initial value
      this[name] = initial
    }
  }

  /**
   * creates the element's renderRoot, sets up styling
   * @category lifecycle
   */
  connectedCallback() {
    // @ts-expect-error
    const { shadowRootInit, useGlobalStyles, template, formAssociated } =
      this.constructor
    // connect all controllers
    this.#controllers.forEach((controller) => controller.hostConnected?.())
    this.renderRoot = shadowRootInit
      ? (this.shadowRoot ?? this.attachShadow(shadowRootInit))
      : this
    this.addTemplate(template)
    if (useGlobalStyles) {
      addGlobalStyles(this.renderRoot)
    }
    /**
     * handle formdata event if `handleFormdata` method is defined on the component.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/formdata_event
     * ```js
     * class MyElement extends MiElement {
     *   static formAssociated = true // required to receive formdata event
     *   handleFormdata(ev) {
     *     const { name, value } = this.refs.input
     *     ev.formData.append(name, value)
     *   }
     *   render() {
     *     this.renderRoot.innerHTML = html`<input name="${this.name}" value="${this.value}">`
     *     this.refs = { input: this.renderRoot.querySelector('input') }
     *   }
     * }
     * ```
     */
    // @ts-expect-error
    if (formAssociated && this.handleFormdata) {
      const internals = this.attachInternals()
      if (internals.form) {
        // @ts-expect-error
        this.on('formdata', (ev) => this.handleFormdata(ev), internals.form)
      }
    }
    this.render() // initial render
    this.requestUpdate() // request initial update
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
   * @param {any} _oldValue
   * @param {any} newValue new value
   */
  attributeChangedCallback(name, _oldValue, newValue) {
    const camelName = nameMap[name] ?? kebabToCamelCase(name)
    // @ts-expect-error
    const properties = this.constructor?.properties
    const { type } = properties?.[camelName] ?? {}
    const coercedValue = convertType(newValue, type)
    // set data-* attributes to dataset
    if (name.startsWith('data-')) {
      const datasetName = kebabToCamelCase(name.substring(5))
      // datasetName may be empty if attribute is just 'data-'
      if (datasetName) {
        this.dataset[datasetName] = coercedValue
      }
    }
    this[camelName] = coercedValue
  }

  /**
   * @param {Record<string, any>} [changedProps]
   */
  requestUpdate(changedProps) {
    this.#changedProps = { ...this.#changedProps, ...changedProps }
    if (this.#updateRequested || !this.renderRoot) return
    this.#updateRequested = true
    window.requestAnimationFrame(() => {
      this.#updateRequested = false
      // reset changed properties
      const changedProps = this.#changedProps
      this.#changedProps = {}
      this.update(changedProps)
    })
  }

  /**
   * adds a template to renderRoot
   * @param {HTMLTemplateElement} template
   */
  addTemplate(template) {
    if (!template) return
    if (!(template instanceof HTMLTemplateElement)) {
      throw new Error('template is not a HTMLTemplateElement')
    }
    this.renderRoot.append(template.content.cloneNode(true))
  }

  /**
   * initial rendering
   */
  render() {
    // to be overridden
  }

  /**
   * called every time the components needs a render update
   * @param {Record<string, any>} [_changedProps] previous values of changed
   * properties (attributes)
   */
  update(_changedProps) {
    // to be overridden
  }

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

  refsBySelector(selectors) {
    return refsBySelector(this.renderRoot, selectors)
  }
}

/**
 * defines a custom element adding observedAttributes from default static
 * attributes
 * NOTE: camelCased attributes on DOM elements get lowercased by the browser!
 * Prefer using static get attributes() where camelCased names are converted to
 * kebab-case automatically.
 * ```html
 * <custom-element myAttr="1">
 * <!-- is equal to -->
 * <custom-element myattr="1">
 * ```
 * @param {string} tagName custom element tag
 * @param {typeof MiElement} elementClass
 * @param {{usedCssPrefix?: string, cssPrefix?: string, styles?: string}} [options]
 */
export const define = (tagName, elementClass, options) => {
  if (customElements.get(tagName)) {
    return
  }
  const { usedCssPrefix = '', cssPrefix = '', styles } = options || {}
  if (elementClass.properties) {
    // only lowercase attribute names are observed!
    const observedAttrs = []
    for (const [name, { attribute = true }] of Object.entries(
      elementClass.properties
    )) {
      if (attribute) {
        observedAttrs.push(camelToKebabCase(name))
      }
    }
    Object.defineProperty(elementClass, 'observedAttributes', {
      get() {
        return observedAttrs
      }
    })
  } else if (elementClass.observedAttributes) {
    const properties = elementClass.observedAttributes.reduce((acc, attr) => {
      const camelName = kebabToCamelCase(attr)
      acc[camelName] = {}
      return acc
    }, {})
    Object.defineProperty(elementClass, 'properties', {
      get() {
        return properties
      }
    })
  }
  if (elementClass.styles) {
    elementClass.styles =
      styles ||
      (usedCssPrefix === cssPrefix
        ? elementClass.styles
        : elementClass.styles.replaceAll(`--${usedCssPrefix}-`, cssPrefix))
  }
  renderTemplate(elementClass)
  window.customElements.define(tagName, elementClass)
}

// --- utils

/**
 * convert (and cache) the static template to HTMLTemplateElement
 * @param {typeof MiElement} element
 */
const renderTemplate = (element) => {
  if (!element.template || element.template instanceof HTMLTemplateElement) {
    return
  }
  const el = document.createElement('template')
  el.innerHTML = element.template || ''
  element.template = el
}

/**
 * convert a attribute string value to typed value
 * @param {string} value
 * @param {typeof Boolean|typeof Number|typeof String|typeof Array|typeof Object} type
 * @returns {any}
 */
export const convertType = (value, type) => {
  if (type === Boolean) {
    // false: removeAttribute -> null, true: setAttribute -> ''
    return value !== null
  }
  if (type === Number) {
    return toNumber(value)
  }
  if (type === Array) {
    return toJson(value) ?? value.split(',').map((v) => v.trim())
  }
  if (type === Object) {
    return toJson(value)
  }
  return value
}
