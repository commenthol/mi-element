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
export function refsBySelector(container: Element, selectors: Record<string, string>): Record<string, Node> | {};
