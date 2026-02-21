import { describe, it, assert, beforeEach } from 'vitest'
import {
  unsafeHtml,
  html,
  escHtml,
  globalRenderCache,
  renderAttrs,
  render
} from '../src/html.js'
import { define, MiElement } from '../src/element.js'

const nap = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms))

describe('html', function () {
  beforeEach(() => {
    globalRenderCache.clear()
  })

  it('shall escape html', () => {
    assert.equal(escHtml('<h1>works</h1>'), '&lt;h1&gt;works&lt;/h1&gt;')
  })

  it('shall escape html attributes', () => {
    assert.equal(
      escHtml(`<a class="&"">'"overquoted'</a>`).toString(),
      '&lt;a class=&quot;&amp;&quot;&quot;&gt;&#39;&quot;overquoted&#39;&lt;/a&gt;'
    )
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
      '<table><tr><td>&lt;a1&gt;</td><td>&#39;a2&#39;</td></tr><tr><td>&quot;b1&quot;</td><td>&amp;b2</td></tr></table>'
    )
  })
})

describe('renderAttrs', function () {
  it('shall set boolean property to true', async () => {
    const el = document.createElement('div')
    el.innerHTML = html`<input ?disabled="${true}" />`
    renderAttrs(el.firstChild)
    await nap()
    assert.equal(el.innerHTML, '<input disabled="">')
  })

  it('shall set boolean property to false', async () => {
    const el = document.createElement('div')
    el.innerHTML = html`<input ?disabled="${false}" />`
    renderAttrs(el.firstChild)
    await nap()
    assert.equal(el.innerHTML, '<input>')
  })

  it('shall set string as direct property', async () => {
    const el = document.createElement('div')
    el.innerHTML = html`<input .value=${'test'} />`
    renderAttrs(el.firstChild)
    await nap()
    assert.equal(el.innerHTML, '<input>')
    assert.equal(el.firstChild.value, 'test')
  })

  it('shall set object as direct property', async () => {
    const data = { a: 1, b: '2' }
    const el = document.createElement('div')
    el.innerHTML = html`<div .data=${data}></div>`
    renderAttrs(el.firstChild)
    await nap()
    assert.equal(el.innerHTML, '<div></div>')
    assert.equal(el.firstChild.data, data)
  })

  it('shall set function as direct property', async () => {
    const fn = () => 'hello'
    const el = document.createElement('div')
    el.innerHTML = html`<div .data=${fn}></div>`
    renderAttrs(el.firstChild)
    await nap()
    assert.equal(el.innerHTML, '<div></div>')
    assert.equal(el.firstChild.data(), 'hello')
  })

  it('shall set event listener', async () => {
    let result
    const fn = (e) => {
      result = 'hello ' + e.type
    }
    const el = document.createElement('div')
    el.innerHTML = html`<button @click=${fn}>Click</button>`
    renderAttrs(el.firstChild)
    await nap()
    assert.equal(el.innerHTML, '<button>Click</button>')
    el.firstChild.dispatchEvent(new Event('click'))
    assert.equal(result, 'hello click')
    assert.equal(globalRenderCache.size, 0)
  })

  it('shall set event listener from handlers', async () => {
    let result
    const handlers = {
      fn: (e) => {
        result = 'hello ' + e.type
      }
    }
    const el = document.createElement('div')
    el.innerHTML = html`<button @click="fn">Click</button>`
    renderAttrs(el.firstChild, handlers)
    await nap()
    assert.equal(el.innerHTML, '<button>Click</button>')
    el.firstChild.dispatchEvent(new Event('click'))
    assert.equal(result, 'hello click')
    assert.equal(globalRenderCache.size, 0)
  })

  it('shall collect refs', async () => {
    const el = document.createElement('div')
    el.innerHTML = html`<section ref="main">
      <div ref="content">Hello</div>
    </section>`
    const refs = renderAttrs(el.firstChild)
    await nap()
    assert.equal(
      el.innerHTML,
      '<section>\n' + '      <div>Hello</div>\n    </section>'
    )
    assert.equal(
      refs.main.outerHTML,
      '<section>\n      <div>Hello</div>\n    </section>'
    )
    assert.equal(refs.content.outerHTML, '<div>Hello</div>')
  })

  it('shall spread properties from object', async () => {
    const obj = { value: 'spread value', disabled: true }
    const el = document.createElement('div')
    el.innerHTML = html`<input ...=${obj} />`
    renderAttrs(el.firstChild)
    await nap()
    assert.equal(el.innerHTML, '<input disabled="">')
    assert.equal(el.firstChild.value, 'spread value')
    assert.equal(el.firstChild.disabled, true)
  })

  it('shall not process custom elements', async () => {
    class MyElement extends HTMLElement {
      connectedCallback() {
        this.innerHTML = `<input ref="inside" ?hidden="${false}" value="${this.value}" />`
      }
    }
    customElements.define('test-inside-element', MyElement)

    const el = document.createElement('div')
    document.body.appendChild(el)
    el.innerHTML = html`<test-inside-element
      ?hidden=${true}
      .value=${'test'}
      ref="custom"
    ></test-inside-element>`
    const refs = renderAttrs(el)
    await nap()
    // console.log('%j', el.innerHTML)
    assert.deepEqual(Object.keys(refs), ['custom', 'inside'])
    assert.equal(
      el.innerHTML,
      '<test-inside-element hidden=""><input ref="inside" ?hidden="false" value="undefined"></test-inside-element>'
    )
  })
})

describe('render', function () {
  it('shall render template and collect refs', async () => {
    let formData
    const template = html`
      <section ref="main">
        <div ref="content">Login</div>
        <form
          @submit=${(ev) => {
            ev.preventDefault()
            formData = new FormData(ev.target)
          }}
        >
          <input type="text" name="username" value="me" />
          <input type="password" name="password" value="foo" />
          <input type="checkbox" name="remember" ?checked=${false} />
          <input type="text" ?disabled=${true} value="disabled" />
          <button ref="submit" type="submit">Submit</button>
        </form>
      </section>
    `
    document.body.innerHTML = null
    const refs = render(document.body, template)
    refs.submit.click()
    assert.equal(
      document.body.innerHTML.replace(/>[\s]*</gm, '><').trim(),
      '<section><div>Login</div><form><input type="text" name="username" value="me"><input type="password" name="password" value="foo"><input type="checkbox" name="remember"><input type="text" value="disabled" disabled=""><button type="submit">Submit</button></form></section>'
    )
    assert.equal(formData.get('username'), 'me')
    assert.equal(formData.get('password'), 'foo')
    assert.equal(formData.get('remember'), null)
  })

  it('shall get refs from nested custom elements', async () => {
    class TestOpenMode extends MiElement {
      render() {
        this.renderRoot.innerHTML = html`<div ref="insideOpen">
          <slot></slot>
        </div>`
      }
    }

    class TestNoMode extends MiElement {
      static get shadowRootInit() {
        return null
      }
      render() {
        this.renderRoot.innerHTML = html`<div ref="insideNo">
          Inside<slot></slot>
        </div>`
      }
    }

    define('test-open-mode', TestOpenMode)
    define('test-no-mode', TestNoMode)

    const el = document.createElement('div')
    document.body.appendChild(el)

    const template = html`
      <test-open-mode ref="open">
        <div ref="divInsideOpen">Inside Open</div>
      </test-open-mode>
      <test-no-mode ref="no">
        <!-- no slot support, so this will not be rendered -->
        <div ref="divInsideNo">Inside No</div>
      </test-no-mode>
    `

    const refs = render(el, template)
    assert.deepEqual(Object.keys(refs), [
      'open',
      'divInsideOpen',
      'no',
      'insideNo'
    ])
  })
})
