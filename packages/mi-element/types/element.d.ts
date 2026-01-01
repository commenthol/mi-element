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
    /**
     * Default options used when calling `attachShadow`. Used in
     * `connectedCallback()`.
     * If override is `null`, no shadow-root will be attached.
     * @type {{mode: string}|null}
     */
    static get shadowRootInit(): {
        mode: string;
    } | null;
    /**
     * defines template for render().
     * @type {String|HTMLTemplateElement}
     */
    static template: string | HTMLTemplateElement;
    /**
     * used to define observedAttributes and booleanAttributes during registration
     * @returns {Record<string, {attribute?: boolean, type?:String|Number|Boolean|Array|Object, initial?: any}>} attribute name to isBoolean map
     */
    static get properties(): Record<string, {
        attribute?: boolean;
        type?: string | number | boolean | any[] | any;
        initial?: any;
    }>;
    /**
     * @returns {string[]}
     */
    static observedAttributes: any[];
    /**
     * @returns {string} css styles
     */
    static styles: string;
    /**
     * Whether to use global styles instead of scoped styles.
     * @returns {boolean}
     */
    static get useGlobalStyles(): boolean;
    /**
     * Define createSignal function for properties.
     * Signal values are set with the .value property
     * @returns {import('mi-signal').createSignal|null} createSignal function
     */
    static createSignal: typeof createSignal;
    /** all properties are signals! */
    _props: {};
    /**
     * creates the element's renderRoot, sets up styling
     * @category lifecycle
     */
    connectedCallback(): void;
    renderRoot: any;
    /**
     * unsubscribe from all events and disconnect controllers
     */
    disconnectedCallback(): void;
    /**
     * @param {string} name change attribute
     * @param {any} _oldValue
     * @param {any} newValue new value
     */
    attributeChangedCallback(name: string, _oldValue: any, newValue: any): void;
    /**
     * @param {Record<string, any>} [changedProps]
     */
    requestUpdate(changedProps?: Record<string, any>): void;
    /**
     * adds a template to renderRoot
     * @param {HTMLTemplateElement} template
     */
    addTemplate(template: HTMLTemplateElement): void;
    /**
     * initial rendering
     */
    render(): void;
    /**
     * called every time the components needs a render update
     * @param {Record<string, any>} [_changedProps] previous values of changed
     * properties (attributes)
     */
    update(_changedProps?: Record<string, any>): void;
    /**
     * Adds listener function for eventName. listener is removed before component
     * disconnects
     * @param {string} eventName
     * @param {EventListenerOrEventListenerObject} listener
     * @param {Node|Document|Window} [node=this]
     */
    on(eventName: string, listener: EventListenerOrEventListenerObject, node?: Node | Document | Window): void;
    /**
     * Adds one-time listener function for eventName. The next time eventName is
     * triggered, this listener is removed and then invoked.
     * @param {string} eventName
     * @param {EventListenerOrEventListenerObject} listener
     * @param {Node|Document|Window} node
     */
    once(eventName: string, listener: EventListenerOrEventListenerObject, node?: Node | Document | Window): void;
    /**
     * Unsubscribe a listener function for disposal on disconnectedCallback()
     * @param {...function} listeners
     */
    dispose(...listeners: Function[]): void;
    /**
     * adds a connected controller
     * @param {HostController} controller
     */
    addController(controller: HostController): void;
    /**
     * removes a connected controller
     * @param {HostController} controller
     */
    removeController(controller: HostController): void;
    /**
     * properties or attributes
     */
    [index: PropertyKey]: any;
    refsBySelector(selectors: any): {} | Record<string, Node>;
    #private;
}
export function define(tagName: string, elementClass: typeof MiElement, options?: {
    usedCssPrefix?: string;
    cssPrefix?: string;
    styles?: string;
}): void;
export function convertType(value: string, type: typeof Boolean | typeof Number | typeof String | typeof Array | typeof Object): any;
/**
 * controller
 */
export type HostController = {
    /**
     * is called when host element is added to
     * the DOM, usually with connectedCallback()
     */
    hostConnected: () => void;
    /**
     * is called when host element is
     * removed from the DOM, usually with disconnectedCallback()
     */
    hostDisconnected: () => void;
};
import { createSignal } from 'mi-signal';
