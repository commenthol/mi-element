import { camelToKebabCase } from './case.js'

/**
 * conditionally joining classNames
 * @param  {...any} args
 * @returns {string}
 */
export const classNames = (...args) => {
  const classList = []
  args.forEach((arg) => {
    if (!arg) return
    if (typeof arg === 'string') {
      classList.push(arg)
    } else if (Array.isArray(arg)) {
      classList.push(classNames(...arg))
    } else if (typeof arg === 'object') {
      Object.entries(arg).forEach(([key, value]) => {
        if (value) {
          classList.push(key)
        }
      })
    }
  })
  return classList.join(' ')
}

/**
 * Construct style from camelCased map.
 * @param {{[name: string]: string | number | undefined | null}} map
 * @param {object} [options]
 * @param {string} [options.unit] cssUnit for number values; default='px'
 * @returns {string}
 */
export const styleMap = (map, options) => {
  const { unit = 'px' } = options || {}
  const acc = []
  for (const [name, value] of Object.entries(map ?? {})) {
    if (value === null || value === undefined) continue
    const _unit = Number.isFinite(value) ? unit : ''
    acc.push(`${camelToKebabCase(name)}:${value}${_unit}`)
  }
  return acc.join(';')
}

// ----

let globalSheets = null
/**
 * obtain and cache global stylesheets
 * @returns {CSSStyleSheet[]}
 */
function getGlobalStyleSheets() {
  if (globalSheets === null) {
    globalSheets = Array.from(document.styleSheets).map(({ cssRules }) => {
      const sheet = new CSSStyleSheet()
      const css = Array.from(cssRules)
        .map((rule) => rule.cssText)
        .join(' ')
      sheet.replaceSync(css)
      return sheet
    })
  }
  return globalSheets
}

/**
 * apply global style sheets to shadowRoot
 * @param {ShadowRoot} renderRoot
 * @example
 * class MyComponent extends MiElement {
 *  render() {
 *    addGlobalStyles(this.renderRoot)
 *  }
 * }
 */
export function addGlobalStyles(renderRoot) {
  renderRoot.adoptedStyleSheets.push(...getGlobalStyleSheets())
}

/**
 * Helper literal to show css styles in JS e.g. with
 * https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html
 */
export const css = (strings, ...values) =>
  String.raw({ raw: strings }, ...values)
