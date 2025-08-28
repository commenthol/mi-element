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
    : unsafeHtml(
        ('' + string)
          .replace(/&amp;/g, '&')
          .replace(/[&<>'"]/g, (tag) => escMap[tag])
      )

/**
 * template literal to HTML escape all values preventing XSS;
 * arrays will be escaped and joined
 * @param {string[]} strings
 * @param  {...any} values
 * @returns {string}
 * @example
 * const data = ['<foo', 'bar>']
 * const list = esc`<ul>${data.map(item => esc`<li>${item}</li>`)}</ul>`
 * // '<ul><li>&lt;foo</li><li>bar&gt;</li></ul>'
 */
export const esc = (strings, ...values) =>
  unsafeHtml(
    String.raw(
      { raw: strings },
      ...values.map((val) =>
        Array.isArray(val) ? val.map(escHtml).join('') : escHtml(val)
      )
    )
  )
