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
  '>': '&gt;'
}

let esc = (string) => {
  return string.replace(/&amp;/g, '&').replace(/[&<>]/g, (tag) => escMap[tag])
}

if (typeof document !== 'undefined') {
  // in browser environment, use DOM to escape
  esc = (string) => {
    const div = document.createElement('div')
    div.textContent = string
    return div.innerHTML
  }
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
  string instanceof UnsafeHtml ? string : unsafeHtml(esc('' + string))

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
        Array.isArray(val) ? val.map(escHtml).join('') : escHtml(val)
      )
    )
  )
