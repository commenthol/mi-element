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
  // @ts-expect-error
  string instanceof UnsafeHtml
    ? string
    : ('' + string)
        .replace(/&amp;/g, '&')
        .replace(/[&<>'"]/g, (tag) => escMap[tag])

/**
 * template literal to HTML escape all values preventing XSS
 * @param {string[]} strings
 * @param  {...any} vars
 * @returns {string}
 */
export const html = (strings, ...vars) =>
  unsafeHtml(String.raw({ raw: strings }, ...vars.map(escHtml)))
