import { toJson } from './utils.js'

/**
 * A cache for rendering values to avoid keeping them in memory too long
 */
class RenderCache {
  cnt = 0
  cache = new Map()
  last = 0

  get size() {
    return this.cache.size
  }

  _inc() {
    this.cnt = ++this.cnt & 0xfffffff
    return this.cnt
  }

  clear() {
    this.cnt = 0
    this.cache.clear()
  }

  set(value) {
    const now = Date.now()
    if (this.last < now) {
      this.cache.clear()
    }
    this.last = now + 5e3
    const key = '__rc:' + this._inc().toString(36)
    this.cache.set(key, value)
    return key
  }

  get(key) {
    const value = this.cache.get(key)
    this.cache.delete(key)
    return value
  }
}

export const globalRenderCache = new RenderCache()

/**
 * A helper class to avoid double escaping of HTML strings
 */
class UnsafeHtml extends String {}

/**
 * tag a string as html for not to be escaped
 * @param {string} str
 * @returns {string}
 */
// @ts-expect-error
export const unsafeHtml = (str) => new UnsafeHtml(str)

const escMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;', // need the quotes for escaping attribute values
  "'": '&#39;'
}

const esc = (string) => string.replace(/[&<>"']/g, (tag) => escMap[tag])

/**
 * escape HTML and prevent double escaping of '&'
 * @param {string} string - which requires escaping
 * @returns {string} escaped string
 * @example
 * escapeHTML('<h1>"One" & 'Two' &amp; Works</h1>')
 * //> &lt;h1&gt;&quot;One&quot; &amp; &#39;Two&#39; &amp; Works&lt;/h1&gt;
 */
export const escHtml = (string) =>
  // @ts-expect-error
  string instanceof UnsafeHtml ? string : unsafeHtml(esc('' + string))

const OBJECT = 'object'
const FUNCTION = 'function'

/**
 * escape any value for HTML context; objects and functions are stored in the render cache
 * @param {any} any
 * @returns {string}
 */
const escValue = (any) => {
  if (any instanceof UnsafeHtml) {
    // @ts-expect-error
    return any
  }
  if ([OBJECT, FUNCTION].includes(typeof any)) {
    const key = globalRenderCache.set(any)
    return unsafeHtml(key)
  }
  return unsafeHtml(esc('' + any))
}

/**
 * template literal to HTML escape all values preventing XSS;
 * arrays will be escaped and joined
 * @param {TemplateStringsArray} strings
 * @param  {...any} values
 * @returns {string}
 * @example
 * const list = html`<ul>${['<foo', 'bar>'].map(item => html`<li>${item}</li>`)}</ul>`
 * // '<ul><li>&lt;foo</li><li>bar&gt;</li></ul>'
 */
export const html = (strings, ...values) =>
  unsafeHtml(
    String.raw(
      { raw: strings },
      ...values.map((val) =>
        Array.isArray(val) ? val.map(escValue).join('') : escValue(val)
      )
    )
  )

/**
 * render HTML template into given node with support for special attributes
 *
 * @param {Element} node to append rendered content
 * @param {string|UnsafeHtml} template HTML template string
 * @param {Record<string, Function>|HTMLElement} [handlers={}] event handlers or HTMLElement for method lookup
 * @returns {Record<string, Element>} references collected
 */
export function render(node, template, handlers = {}) {
  const refs = {}
  const div = document.createElement('div')
  div.innerHTML = template.toString()
  // don't understand why `for (let child of div.children)` does not work here
  for (let child of Array.from(div.children)) {
    // @ts-expect-error
    renderAttrs(child, handlers, refs)
    node.appendChild(child)
  }
  // @ts-expect-error
  return refs
}

const REF = 'ref'
const REF_Q = '[ref]'

/**
 * Post-processing of rendered nodes to handle special attributes:
 *
 * - `?attr=${boolean}`  -> boolean attribute
 * - `.prop=${objectOrAnyValue}` -> property binding for objects or any value
 * - `...=${object}` -> spread properties from object
 * - `@event=${(e) => {}}` -> event listener with templated inline function
 * - `@event="handlerName"` -> event listener using handler name from handlers object
 * - `ref="refName"` -> element reference collected and returned
 *
 * NOTE: For all attributes and event names always use kebab-case. For properties it will be converted to camelCase.
 * Attributes starting with `?`, `@`, or `.` are removed from DOM after processing
 *
 * @param {Element} node to append rendered content
 * @param {Record<string, Function>|HTMLElement} [handlers={}] event handlers or HTMLElement for method lookup
 * @param {Record<string, Element>} [refs={}] collected references
 * @returns {Record<string, Element>} references collected
 */
export function renderAttrs(node, handlers = {}, refs = {}) {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const rmFns = []
    for (let attr of node.attributes) {
      const startsWith = attr.name[0]
      const name = attr.name.slice(1)
      let rm = 0
      if (startsWith === '?') {
        // boolean attributes
        if (toJson(attr.value)) {
          node.setAttribute(name, '')
        } else {
          node.removeAttribute(name)
        }
        rm = 1
      } else if (attr.name === '...') {
        // spread attribute
        const obj = globalRenderCache.get(attr.value)
        if (obj && typeof obj === OBJECT) {
          for (const [k, v] of Object.entries(obj)) {
            node[k] = v
          }
        }
        rm = 1
      } else if (startsWith === '.') {
        // property binding
        node[name] = globalRenderCache.get(attr.value) ?? attr.value
        rm = 1
      } else if (startsWith === '@') {
        // event listener
        const handlerName = attr.value
        const fn = globalRenderCache.get(handlerName)
        if (fn) {
          node.addEventListener(name, (e) => fn(e))
        } else if (typeof handlers[handlerName] === FUNCTION) {
          node.addEventListener(name, (e) => handlers[handlerName](e))
        }
        rm = 1
      } else if (attr.name === REF) {
        // element reference - remove as well to prevent collection by other processors
        const refName = attr.value
        refs[refName] = node
        rm = 1
      }
      if (rm) {
        rmFns.push([node, attr.name])
      }
    }
    // @ts-expect-error
    rmFns.forEach(([node, name]) => node.removeAttribute(name))
  }
  // early abort if custom element but resolve slotted refs
  if (customElements.get(node.localName)) {
    const q = node.querySelectorAll(REF_Q)
    for (let el of q) {
      const refName = el.getAttribute(REF)
      if (refName && !refs[refName]) {
        refs[refName] = el
      }
    }
    return refs
  }
  // early abort if no children
  if (!node.children?.length) {
    return refs
  }
  for (let child of Array.from(node.children)) {
    renderAttrs(child, handlers, refs)
  }
  return refs
}
