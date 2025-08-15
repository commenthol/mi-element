import { expect, describe, it } from 'vitest'
import { unsafeHtml, html, escHtml } from '../src/escape.js'

describe('escape', function () {
  it('shall escape html', () => {
    expect(escHtml('<h1>works</h1>')).toBe('&lt;h1&gt;works&lt;/h1&gt;')
  })

  it('shall escape html attributes', () => {
    expect(escHtml(`'"overquoted'`)).toBe('&#39;&quot;overquoted&#39;')
  })

  it('shall escape with template literal', () => {
    expect(
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
        .replace(/[\s]+/gm, ' ')
    ).toBe(
      '<!DOCTYPE html><html><head><title>&lt;h1&gt;foo&lt;/h1&gt;</title></head><body> &lt;h1&gt;bar&lt;/h1&gt; </body></html>'
    )
  })

  it('shall not escape unsafeHtml', () => {
    const unsafe = `<h1>${'<unsafe />'}</h1>`
    expect(
      html`<body>
        ${unsafeHtml(unsafe)}
        <div>${'<escape />'}</div>
      </body>`.replace(/>[\s]*</gm, '><')
    ).toBe('<body><h1><unsafe /></h1><div>&lt;escape /&gt;</div></body>')
  })

  it('shall not re-escape escaped html', () => {
    const safe = html`<h1>${'<unsafe />'}</h1>`
    expect(
      html`<body>
        ${safe}
        <div>${'<escape />'}</div>
      </body>`.replace(/>[\s]*</gm, '><')
    ).toBe('<body><h1>&lt;unsafe /&gt;</h1><div>&lt;escape /&gt;</div></body>')
  })
})
