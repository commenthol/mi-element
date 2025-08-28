import { describe, it, assert } from 'vitest'
import { unsafeHtml, esc as html, escHtml } from '../src/escape.js'

describe('escape', function () {
  it('shall escape html', () => {
    assert.equal(escHtml('<h1>works</h1>'), '&lt;h1&gt;works&lt;/h1&gt;')
  })

  it('shall escape html attributes', () => {
    assert.equal(escHtml(`'"overquoted'`), '&#39;&quot;overquoted&#39;')
  })

  it('shall escape with template literal', () => {
    assert(
      html`<!DOCTYPE html>
        <html>
          <head>
            <title>${'<h1>foo</h1>'}</title>
          </head>
          <body>
            ${'<h1>bar</h1>'}
          </body>
        </html>`
        .replace(/>[\s]*</gm, '><')
        .replace(/[\s]+/gm, ' '),
      '<!DOCTYPE html><html><head><title>&lt;h1&gt;foo&lt;/h1&gt;</title></head><body> &lt;h1&gt;bar&lt;/h1&gt; </body></html>'
    )
  })

  it('shall not escape unsafeHtml', () => {
    const unsafe = `<h1>${'<unsafe />'}</h1>`
    assert.equal(
      html`<body>
        ${unsafeHtml(unsafe)}
        <div>${'<escape />'}</div>
      </body>`.replace(/>[\s]*</gm, '><'),
      '<body><h1><unsafe /></h1><div>&lt;escape /&gt;</div></body>'
    )
  })

  it('shall not re-escape escaped html', () => {
    const safe = html`<h1>${'<unsafe />'}</h1>`
    assert.equal(
      html`<body>
        ${safe}
        <div>${'<escape />'}</div>
      </body>`.replace(/>[\s]*</gm, '><'),
      '<body><h1>&lt;unsafe /&gt;</h1><div>&lt;escape /&gt;</div></body>'
    )
  })

  it('shall join an array', () => {
    const table = [
      ['<a1>', "'a2'"],
      ['"b1"', '&b2']
    ]
    assert.equal(
      html`
        <table>
          ${table.map(
            (row) => html`
              <tr>
                ${row.map((cell) => html`<td>${cell}</td>`)}
              </tr>
            `
          )}
        </table>
      `
        .replace(/>[\s]*</gm, '><')
        .trim(),
      '<table><tr>' +
        '<td>&lt;a1&gt;</td>' +
        '<td>&#39;a2&#39;</td>' +
        '</tr><tr>' +
        '<td>&quot;b1&quot;</td>' +
        '<td>&amp;b2</td>' +
        '</tr></table>'
    )
  })
})
