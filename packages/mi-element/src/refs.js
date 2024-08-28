/**
 * Helper function to find `id` attributes in `container`s node tree.
 * id names are camelCased, e.g. 'list-container' becomes 'listContainer'
 * @param {Element} container root element
 * @returns {Record<string, Node>|{}} record of found references
 * @example
 * el.innerHTML = `<p id>unnamed <span id="named">and named</span> reference</p>`
 * references = refs(el)
 * //> references = { p: <p>, named: <span> }
 */
export function refsById(container) {
  const nodes = container.querySelectorAll?.('[id]') || []
  const found = {}
  for (const node of nodes) {
    const name = kebabToCamelCase(
      node.getAttribute('id') || node.nodeName.toLowerCase()
    )
    found[name] = node
  }
  return found
}

/**
 * convert kebab-case to lowerCamelCase
 * @param {string} str
 * @returns {string}
 */
export const kebabToCamelCase = (str = '') =>
  str.toLowerCase().replace(/[-_]\w/g, (m) => m[1].toUpperCase())

/**
 * Helper function to gather references by a map of selectors
 * @param {Element} container root element
 * @param {Record<string, string>} selectors
 * @returns {Record<string, Node>|{}}
 * @example
 * el.innerHTML = `<p>some <span>and other</span> reference</p>`
 * references = refs(el, { p: 'p', named: 'p > span' })
 * //> references = { p: <p>, named: <span> }
 */
export function refsBySelector(container, selectors) {
  const found = {}
  for (const [name, selector] of Object.entries(selectors)) {
    found[name] = container.querySelector?.(selector)
  }
  return found
}
