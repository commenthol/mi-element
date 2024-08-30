import { createSignal } from './signal.js'

/**
 * @typedef {import('./signal.js').Signal} Signal
 */

/**
 * @typedef {object} HostController controller
 * @property {() => void} hostConnected is called when host element is added to
 * the DOM, usually with connectedCallback()
 * @property {() => void} hostDisconnected is called when host element is
 * removed from the DOM, usually with disconnectedCallback()
 */

/**
 * class extening HTMLElement to enable deferred rendering on attribute changes
 * either via `setAttribute(name, value)` or `this[name] = value`.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
 * @example
 * ```js
 * class Example extends MiElement {
 *  // define all observed attributes with its default value.
 *  // attributes are accessible via `this[prop]`
 *  // avoid using attributes which are HTMLElement properties e.g. className
 *  static get attributes () {
 *    return { text: 'Hi' }
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
  #attr = {}
  #attrLc = new Map()
  #types = new Map()
  #disposers = new Set()
  #controllers = new Set()
  #changedAttr = {}
  // signals allow for finer control of updates
  #signals = {}

  /**
   * Default options used when calling `attachShadow`. Used in
   * `connectedCallback()`.
   * If override is `null`, no shadow-root will be attached.
   */
  static shadowRootOptions = { mode: 'open' }

  constructor() {
    super()
    // @ts-expect-error
    this.#attr = { ...this.constructor.attributes }
    this.#observedAttributes()
  }

  /**
   * @returns {Record<string, Signal>|{}}
   */
  get signals() {
    return this.#signals
  }

  /**
   * requests update on component when property changes
   */
  #observedAttributes() {
    for (const [name, value] of Object.entries(this.#attr)) {
      this.#signals[name] = createSignal(value)
      this.#types.set(name, initialType(value))
      this.#attrLc.set(name.toLowerCase(), name)
      Object.defineProperty(this, name, {
        enumerable: true,
        get() {
          return this.#attr[name]
        },
        set(newValue) {
          console.debug('%s.%s =', this.nodeName, name, newValue)
          const oldValue = this.#attr[name]
          if (oldValue === newValue) return
          this.#attr[name] =
            this.#signals[name].value =
            this.#changedAttr[name] =
              newValue
          this.requestUpdate()
        }
      })
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
   * @param {any} _oldValue
   * @param {any} newValue new value
   */
  attributeChangedCallback(name, _oldValue, newValue) {
    const attr = this.#getName(name)
    const type = this.#getType(attr)
    const _newValue = convertType(newValue, type)
    this[attr] = this.#changedAttr[attr] = _newValue
    // correct initial setting of `trueish="false"` otherwise there's no chance
    // to overwrite a trueish value. The case `falsish="true"` is covered.
    if (type === 'Boolean' && newValue === 'false') {
      this.removeAttribute(name)
    }
    console.debug(
      '%s.attributeChangedCallback("%s",',
      this.nodeName,
      name,
      _oldValue,
      newValue
    )
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
    this[attr] = this.#changedAttr[attr] = newValue
    console.debug('%s.setAttribute("%s",', this.nodeName, name, newValue)

    // only set string values in these cases
    if (type === 'Boolean') {
      if (newValue === true || newValue === '') {
        super.setAttribute(name, '')
      } else {
        super.removeAttribute(name)
      }
    } else if (['String', 'Number'].includes(type) || newValue === true) {
      super.setAttribute(name, newValue)
    } else {
      this.requestUpdate()
    }
  }

  /**
   * request rendering
   */
  requestUpdate() {
    if (!this.isConnected) return
    requestAnimationFrame(() => {
      if (this.shouldUpdate(this.#changedAttr)) {
        this.update(this.#changedAttr)
      }
      // reset changed attributes
      this.#changedAttr = {}
    })
  }

  /**
   * adds a template to renderRoot
   * @param {HTMLTemplateElement} template
   */
  addTemplate(template) {
    if (!(template instanceof HTMLTemplateElement)) {
      console.debug('template is not a HTMLTemplateElement')
      return
    }
    this.renderRoot.appendChild(template.content.cloneNode(true))
  }

  /**
   * initial rendering
   */
  render() {}

  /**
   * controls if component shall be updated
   * @param {Record<string,any>} _changedAttributes changed attributes
   * @returns {boolean}
   */
  shouldUpdate(_changedAttributes) {
    return true
  }

  /**
   * called every time the components needs a render update
   * @param {Record<string,any>} _changedAttributes changed attributes
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

const renderTemplate = (element) => {
  if (typeof element.template !== 'string') {
    return
  }
  const el = document.createElement('template')
  el.innerHTML = element.template
  element.template = el
}

const initialType = (value) => toString.call(value).slice(8, -1)

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
