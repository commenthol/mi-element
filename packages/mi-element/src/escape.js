const escMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
}

/**
 * escape HTML and prevent double escaping of '&'
 * @param {string} string - which requires escaping
 * @returns {string} escaped string
 * @example
 * escapeHTML('<h1>"One" & 'Two' &amp; Works</h1>')
 * //> &lt;h1&gt;&quot;One&quot; &amp; &#39;Two&#39; &amp; Works&lt;/h1&gt;
 */
export const escHtml = (string) =>
  ('' + string).replace(/&amp;/g, '&').replace(/[&<>'"]/g, (tag) => escMap[tag])

/**
 * escape HTML attribute
 * @param {string} string
 * @returns {string} escaped string
 * @example
 * escapeAttr("One's")
 * //> &quot;One&#39;s&quot;
 */
export const escAttr = (string) =>
  ('' + string).replace(/['"]/g, (tag) => escMap[tag])

/**
 * template literal to HTML escape all values preventing XSS
 * @param {string[]} strings
 * @param  {...any} vars
 * @returns {string}
 */
export const esc = (strings, ...vars) =>
  strings.map((string, i) => string + escHtml(vars[i] ?? '')).join('')
