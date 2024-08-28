import { expect, describe, it } from 'vitest'
import { esc, escHtml, escAttr } from '../src/escape.js'

describe('escape', function () {
  it('shall escape html', () => {
    expect(escHtml('<h1>works</h1>')).toBe('&lt;h1&gt;works&lt;/h1&gt;')
  })

  it('shall escape html attributes', () => {
    expect(escAttr(`'"overquoted'`)).toBe('&#39;&quot;overquoted&#39;')
  })

  it('shall escape with template literal', () => {
    expect(
      esc`<!DOCTYPE html><html>
      <head><title>${'<h1>foo</h1>'}</title></head>
      <body>${'<h1>bar</h1>'}</body>
      </html>`.replace(/>[\s]*</gm, '><')
    ).toBe(
      '<!DOCTYPE html><html><head><title>&lt;h1&gt;foo&lt;/h1&gt;</title></head><body>&lt;h1&gt;bar&lt;/h1&gt;</body></html>'
    )
  })
})
