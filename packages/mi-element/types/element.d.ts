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
  /**
   * Default options used when calling `attachShadow`. Used in
   * `connectedCallback()`.
   * If override is `null`, no shadow-root will be attached.
   */
  static shadowRootOptions: {
    mode: string
  }
  __attr: {}
  __attrLc: Map<any, any>
  __types: Map<any, any>
  __disposers: Set<any>
  __controllers: Set<any>
  __changedAttr: {}
  /**
   * requests update on component when property changes
   */
  __observedAttributes(): void
  /**
   * return camelCased value instead of possible lowercased
   * @param {string} name
   * @returns
   */
  __getName(name: string): any
  __getType(name: any): any
  /**
   * creates the element's renderRoot, sets up styling
   * @category lifecycle
   */
  connectedCallback(): void
  renderRoot: any
  /**
   * unsubscribe from all events and disconnect controllers
   */
  disconnectedCallback(): void
  /**
   * @param {string} name change attribute
   * @param {any} _oldValue
   * @param {any} newValue new value
   */
  attributeChangedCallback(name: string, _oldValue: any, newValue: any): void
  /**
   * Set string and number attributes on element only. Set all other values as
   * properties to avoid type conversion to and from string
   * @param {string} name
   * @param {any} newValue
   */
  setAttribute(name: string, newValue: any): void
  /**
   * request rendering
   */
  requestUpdate(): void
  /**
   * initial rendering
   */
  render(): void
  /**
   * controls if component shall be updated
   * @param {Record<string,any>} _changedAttributes changed attributes
   * @returns {boolean}
   */
  shouldUpdate(_changedAttributes: Record<string, any>): boolean
  /**
   * called every time the components needs a render update
   * @param {Record<string,any>} _changedAttributes changed attributes
   */
  update(_changedAttributes: Record<string, any>): void
  /**
   * Adds listener function for eventName. listener is removed before component
   * disconnects
   * @param {string} eventName
   * @param {EventListenerOrEventListenerObject} listener
   * @param {Node|Document|Window} [node=this]
   */
  on(
    eventName: string,
    listener: EventListenerOrEventListenerObject,
    node?: Node | Document | Window | undefined
  ): void
  /**
   * Adds one-time listener function for eventName. The next time eventName is
   * triggered, this listener is removed and then invoked.
   * @param {string} eventName
   * @param {EventListenerOrEventListenerObject} listener
   * @param {Node|Document|Window} node
   */
  once(
    eventName: string,
    listener: EventListenerOrEventListenerObject,
    node?: Node | Document | Window
  ): void
  /**
   * Unsubscribe a listener function for disposal on disconnectedCallback()
   * @param {function} listener
   */
  dispose(listener: Function): void
  /**
   * adds a connected controller
   * @param {HostController} controller
   */
  addController(controller: HostController): void
  /**
   * removes a connected controller
   * @param {HostController} controller
   */
  removeController(controller: HostController): void
}
export function define(
  name: string,
  element: typeof MiElement,
  options?: object
): void
export function convertType(any: any, type: any): any
/**
 * controller
 */
export type HostController = {
  /**
   * is called when host element is added to
   * the DOM, usually with connectedCallback()
   */
  hostConnected: () => void
  /**
   * is called when host element is
   * removed from the DOM, usually with disconnectedCallback()
   */
  hostDisconnected: () => void
}
