import { toJson } from './utils.js'

/**
 * A cache for rendering values to avoid keeping them in memory too long
 */
class RenderCache {
  cnt = 0
  map = new Map()
  cache = new WeakMap()

  _inc() {
    this.cnt = ++this.cnt & 0xfffffff
    return this.cnt
  }

  clear() {
    this.cnt = 0
    this.map.clear()
  }

  set(value) {
    const key = '__rc:' + this._inc().toString(36)
    const ref = {}
    this.map.set(key, ref)
    this.cache.set(ref, value)
    return key
  }

  get(key) {
    const ref = this.map.get(key)
    this.map.delete(key)
    return this.cache.get(ref)
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
  if (['object', 'function'].includes(typeof any)) {
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
 * Post-processing of rendered nodes to handle special attributes:
 *
 * - `?attr=${boolean}`  -> boolean attribute
 * - `.prop=${objectOrAnyValue}` -> property binding for objects or any value
 * - `@event=${(e) => {}}` -> event listener with templated inline function
 * - `@event="handlerName"` -> event listener using handler name from handlers object
 * - `ref="refName"` -> element reference collected and returned
 *
 * NOTE: For all attributes and event names always use kebab-case. For properties it will be converted to camelCase.
 * Attributes starting with `?`, `@`, or `.` are removed from DOM after processing
 *
 * @param {Element} node
 * @param {Record<string, Function>|HTMLElement} [handlers={}] event handlers or HTMLElement for method lookup
 * @returns {Record<string, Element>} references collected
 */
export function renderAttrs(node, handlers = {}) {
  const refs = {}
  if (node.nodeType === Node.ELEMENT_NODE) {
    for (let attr of node.attributes) {
      const startsWith = attr.name[0]
      const name = attr.name.slice(1)
      if (startsWith === '?') {
        // boolean attributes
        if (toJson(attr.value)) {
          node.setAttribute(name, '')
        } else {
          node.removeAttribute(name)
        }
      } else if (startsWith === '.') {
        // property binding
        node[name] = globalRenderCache.get(attr.value) ?? attr.value
        console.log('property attr', name, attr.value, node[name])
      } else if (startsWith === '@') {
        // event listener
        const handlerName = attr.value
        const fn = globalRenderCache.get(handlerName)
        if (fn) {
          node.addEventListener(name, (e) => fn(e))
        } else if (typeof handlers[handlerName] === 'function') {
          node.addEventListener(name, (e) => handlers[handlerName](e))
        }
      } else if (attr.name === 'ref') {
        // element reference
        const refName = attr.value
        refs[refName] = node
      }
      if (/[?.@]/.test(startsWith)) {
        requestAnimationFrame(() => {
          node.removeAttribute(attr.name)
        })
      }
    }
  }
  if (node.children.length === 0) {
    // @ts-expect-error
    return refs
  }
  for (let child of node.children) {
    Object.assign(refs, renderAttrs(child, handlers))
  }
  // @ts-expect-error
  return refs
}
