import { assert, describe, it, beforeEach } from 'vitest'
import { define, MiElement, html, Signal } from '../src/index.js'
import { nap } from './helpers.js'

const { createSignal, effect } = Signal

describe('MiElement', () => {
  describe('template', () => {
    beforeEach(() => {
      document.body.innerHTML = null
    })

    it('no template', () => {
      const tag = 'mi-test-template-no'
      class MiTest extends MiElement {
        static shadowRootOptions = null
      }
      assert.strictEqual(toString.call(MiTest.template), '[object Undefined]')
      define(tag, MiTest)
      const el = document.createElement(tag)
      document.body.appendChild(el)
      // mutates the template to HTMLTemplateElement
      assert.strictEqual(toString.call(MiTest.template), '[object Undefined]')
    })

    it('shall transform template from string', () => {
      const tag = 'mi-test-template-str'
      class MiTest extends MiElement {
        static shadowRootInit = null
        static template = '<h1>string</h1>'
      }
      assert.strictEqual(toString.call(MiTest.template), '[object String]')
      define(tag, MiTest)
      const el = document.createElement(tag)
      document.body.appendChild(el)
      assert.strictEqual(el.innerHTML, '<h1>string</h1>')
      // mutates the template to HTMLTemplateElement
      assert.strictEqual(
        toString.call(MiTest.template),
        '[object HTMLTemplateElement]'
      )
    })

    it('shall transform template from escaped string', () => {
      const tag = 'mi-test-template-esc'
      class MiTest extends MiElement {
        static shadowRootInit = null
        static template = html`<h1>${'escaped>'}</h1>`
      }
      define(tag, MiTest)
      const el = document.createElement(tag)
      document.body.appendChild(el)
      assert.strictEqual(el.innerHTML, '<h1>escaped&gt;</h1>')
    })

    it('shall not transform template if already a HTMLTemplateElement', () => {
      const template = document.createElement('template')
      template.innerHTML = `<h1>template</h1>`
      const tag = 'mi-test-template'
      class MiTest extends MiElement {
        static shadowRootInit = null
        static template = template
      }
      define(tag, MiTest)
      const el = document.createElement(tag)
      document.body.appendChild(el)
      assert.strictEqual(el.innerHTML, '<h1>template</h1>')
    })

    it('shall throw if addTemplate is not HTMLTemplateElement', () => {
      const tag = 'mi-test-template-add-template-fail'
      class MiTest extends MiElement {
        static shadowRootInit = null
      }
      define(tag, MiTest)
      assert.throws(() => {
        const el = document.createElement(tag)
        el.addTemplate('huu')
      }, 'template is not a HTMLTemplateElement')
    })
  })

  describe('attributes', () => {
    const properties = {
      empty: {},
      string: { type: String },
      true: { type: Boolean },
      false: { type: Boolean },
      undef: {},
      zero: { type: Number },
      number: { type: Number },
      array: { type: Array },
      object: { type: Object },
      function: { attribute: false },
      camelCase: {},
      kebabCase: {}
    }
    const attributeValues = {
      empty: '',
      string: 'hi',
      true: true,
      false: false,
      undef: undefined,
      zero: 0,
      number: 1,
      array: [1, 2, 'a,b', 'c'],
      object: JSON.stringify({ one: 1, two: '2' }),
      function: () => 1,
      camelCase: 'camel',
      'kebab-case': 'kebab'
    }

    let previousAttrs = null

    class MiTest extends MiElement {
      static get properties() {
        return properties
      }

      static template = `<pre></pre>`

      render() {
        previousAttrs = null
        this.refs = this.refsBySelector({ pre: 'pre' })
      }

      update(_changedProps) {
        this.refs.pre.textContent = JSON.stringify(this, null, 2)
        previousAttrs = { ...previousAttrs, ..._changedProps }
        // console.debug('update', previousAttrs)
      }
    }

    const tag = 'mi-test-attributes'
    define(tag, MiTest)
    let el

    beforeEach(() => {
      previousAttrs = null
      document.body.innerHTML = null
      el = document.createElement(tag)
      document.body.appendChild(el)
    })

    it('shall have observable properties', () => {
      const observedAttributes = MiTest.observedAttributes
      assert.deepStrictEqual(observedAttributes.sort(), [
        'array',
        'camel-case',
        'empty',
        'false',
        'kebab-case',
        'number',
        'object',
        'string',
        'true',
        'undef',
        'zero'
      ])
    })

    it('shall set and get attributes', async () => {
      for (const [name, value] of Object.entries(attributeValues)) {
        if (properties[name]?.type === Boolean) {
          if (value) {
            el.setAttribute(name, '')
          } else {
            el.removeAttribute(name)
          }
        } else {
          el.setAttribute(name, value)
        }
      }

      await nap()

      const collectAttrs = Object.keys(attributeValues).reduce(
        (acc, name) => {
          acc[name] = el.getAttribute(name)
          return acc
        },
        {
          camelcase: el.getAttribute('camelcase')
        }
      )

      // console.log(el)
      // console.log(collectAttrs)

      // Take care if using setAttribute() as attribute names are case
      // insensitive "camelCase becomes "camelcase" and only strings and numbers
      // can be passed correctly. Booleans and objects as well as functions are
      // just stringified, which is not what we intent. `null` means that no
      // attribute was set on the node
      assert.deepStrictEqual(collectAttrs, {
        array: '1,2,a,b,c',
        camelCase: 'camel',
        camelcase: 'camel', // camelCase becomes camelcase
        empty: '',
        false: null,
        function: '() => 1',
        'kebab-case': 'kebab',
        number: '1',
        object: '{"one":1,"two":"2"}',
        string: 'hi',
        true: '',
        undef: 'undefined',
        zero: '0'
      })

      const collectProps = Object.keys(attributeValues).reduce((acc, name) => {
        acc[name] = el[name]
        return acc
      }, {})

      // console.debug(Object.entries(el._props).map(([k,v])=>[k, v.get()]))
      // console.log(collectProps)
      assert.deepStrictEqual(collectProps, {
        array: ['1', '2', 'a', 'b', 'c'],
        camelCase: undefined,
        'kebab-case': undefined,
        empty: '',
        false: undefined,
        function: undefined,
        number: 1,
        object: { one: 1, two: '2' },
        string: 'hi',
        true: true,
        undef: 'undefined',
        zero: 0
      })

      assert.deepEqual(el.getAttribute('camel-case'), null)
      assert.equal(el.camelCase, undefined)

      const newCamel = '🐫Camel'
      el.setAttribute('camel-case', newCamel)
      assert.deepEqual(el.getAttribute('camel-case'), newCamel)
      assert.equal(el.camelCase, newCamel)

      await nap()
    })

    it('shall set and get boolean attributes', async () => {
      document.body.innerHTML = null
      const div = document.createElement('div')
      div.innerHTML = `<mi-test-attributes false true></mi-test-attributes>`
      el = div.querySelector('mi-test-attributes')
      document.body.appendChild(el)
      await nap(100)
      assert.strictEqual(el.true, true)
      assert.strictEqual(el.false, true)
      // attribute false gets removed!
      el.removeAttribute('false')
      assert.strictEqual(el.getAttribute('true'), '')
      assert.strictEqual(el.getAttribute('false'), null)
      assert.strictEqual(el.true, true)
      assert.strictEqual(el.false, false)
      await nap()
    })

    it('shall resolve camelCased attributes', async () => {
      const camels = '🐪🐫'
      el.setAttribute('camel-case', camels)
      assert.strictEqual(el.camelCase, camels)
      assert.strictEqual(el.getAttribute('camel-case'), camels)
      assert.strictEqual(el.getAttribute('camelCase'), null)
      await nap()
    })

    it('shall pass previous attributes on render()', async () => {
      await nap()
      assert.deepStrictEqual(previousAttrs, {})

      el.setAttribute('camel-case', '🐫')
      el.setAttribute('camelcase', '❌')
      el.number = 42
      await nap()
      assert.deepStrictEqual(previousAttrs, {
        camelCase: '🐫',
        number: 42
      })
    })
  })

  describe('controller', () => {
    let events = []

    class Controller {
      value = 0
      constructor(host) {
        host.addController(this)
        this.host = host
      }
      hostConnected() {
        events.push('hostConnected')
        this.value++
        setTimeout(() => {
          this.change()
        }, 10)
      }
      change() {
        events.push('change')
        this.value++
        this.host.requestUpdate()
      }
      hostDisconnected() {
        events.push('hostDisconnected')
      }
    }

    class MiTestController extends MiElement {
      constructor() {
        super()
        this.controller = new Controller(this)
      }
      update() {
        events.push(this.controller.value)
      }
    }

    let el
    const tag = 'mi-test-controller'
    define(tag, MiTestController)

    beforeEach(() => {
      events = []
      document.body.innerHTML = null
      el = document.createElement(tag)
      document.body.appendChild(el)
    })

    it('shall connect controller and run its lifecycle', async () => {
      await nap(50)
      document.body.innerHTML = null
      // console.log(events)
      assert.deepStrictEqual(events, [
        'hostConnected',
        1,
        'change',
        2,
        'hostDisconnected'
      ])
      await nap()
    })
  })

  describe('events', () => {
    let events = []

    class MiTestEvents extends MiElement {
      render() {
        this.on('my-on', this._event, this)
        this.once('my-once', this._event, this)
        this.renderRoot
      }

      _event = (ev) => {
        ev.stopPropagation()
        events.push(ev.detail)
      }
    }

    let el
    const tag = 'mi-test-events'
    define(tag, MiTestEvents)

    beforeEach(() => {
      events = []
      document.body.innerHTML = null
      el = document.createElement(tag)
      document.body.appendChild(el)
    })

    it('shall add event listeners ane remove them on disconnect', async () => {
      class MyEvent extends CustomEvent {
        constructor(name) {
          super(name, { detail: name })
        }
      }

      el.dispatchEvent(new MyEvent('my-on'))
      el.dispatchEvent(new MyEvent('my-once'))
      el.dispatchEvent(new MyEvent('my-on'))
      el.dispatchEvent(new MyEvent('my-once'))
      await nap()
      document.body.innerHTML = null
      el.dispatchEvent(new MyEvent('my-on'))
      assert.deepStrictEqual(events, ['my-on', 'my-once', 'my-on'])
      await nap()
    })
  })

  describe('dispose', () => {
    class MiTestDispose extends MiElement {}

    let el
    const tag = 'mi-test-dispose'
    define(tag, MiTestDispose)

    beforeEach(() => {
      document.body.innerHTML = null
      el = document.createElement(tag)
      document.body.appendChild(el)
    })

    it('shall add event listeners ane dispose it on disconnect', async () => {
      const events = []
      el.dispose(() => {
        events.push('disposed')
      })
      assert.deepStrictEqual(events, [])
      // call disconnectedCallback
      document.body.innerHTML = null
      await nap()
      assert.deepStrictEqual(events, ['disposed'])
      await nap()
    })

    it('shall fail if listener is not a function', async () => {
      try {
        el.dispose('boo')
        throw new Error()
      } catch (err) {
        assert.strictEqual(err.message, 'listener must be a function')
      }
    })
  })

  describe('signals', () => {
    class MiTestSignals extends MiElement {
      static get properties() {
        return {
          count: { type: Number }
        }
      }

      static template = html`
        <div>${(x) => x.count}</div>
        <button>Increment</button>
      `

      static createSignal = createSignal

      static shadowRootInit = null

      constructor() {
        super()
        // set initial signal value
        this.count = 0
      }

      render() {
        this.refs = this.refsBySelector({ count: 'div', button: 'button' })
        this.refs.button.addEventListener('click', () => {
          this.count++
        })
        effect(() => {
          this.refs.count.textContent = this.count
        })
      }
    }
    let el
    const tag = 'mi-test-signals'
    define(tag, MiTestSignals)

    beforeEach(() => {
      document.body.innerHTML = null
      el = document.createElement(tag)
      document.body.appendChild(el)
    })

    it('shall use signals for properties', async () => {
      assert.strictEqual(el.count, 0)
      assert.strictEqual(el.refs.count.textContent, '0')
      el.refs.button.click()
      await nap()
      assert.strictEqual(el.count, 1)
      assert.strictEqual(el.refs.count.textContent, '1')
      el.refs.button.click()
      el.refs.button.click()
      await nap()
      assert.strictEqual(el.count, 3)
      assert.strictEqual(el.refs.count.textContent, '3')
    })
  })

  describe('form-associated', () => {
    class MiTestFormInput extends MiElement {
      #internals

      static formAssociated = true

      static get properties() {
        return {
          name: { type: String },
          value: { type: String, initial: '' }
        }
      }

      static template = `<input type="text" />`

      static shadowRootInit = null

      render() {
        this.#internals = this.attachInternals()
        this.#internals.ariaRole = 'textbox'
        this.#internals.setFormValue(this.value)
        this.refs = this.refsBySelector({ input: 'input' })
        this.refs.input.addEventListener('input', (ev) => {
          this.value = ev.target.value
          this.#internals.setFormValue(this.value)
          this.checkValidity(this.value)
        })
      }

      checkValidity(newValue) {
        if (newValue >= 2) {
          this.#internals.setValidity({})
          return
        }
        this.#internals.setValidity(
          { tooSort: true },
          'value too short',
          this.refs.input
        )
        this.#internals.reportValidity()
      }

      formResetCallback() {
        this.value = this.refs.input.value = ''
      }
    }

    const tag = 'mi-test-form-input'
    define(tag, MiTestFormInput)

    beforeEach(() => {
      document.body.innerHTML = null
    })

    it('shall submit form data with form-associated element', async () => {
      const html = `
        <form id="test-form">
          <mi-test-form-input name="username" value="john"></mi-test-form-input>
          <mi-test-form-input name="email" value="john@example.com"></mi-test-form-input>
          <button type="submit">Submit</button>
        </form>
      `
      document.body.innerHTML = html
      const form = document.getElementById('test-form')
      const input1 = form.querySelector('mi-test-form-input:nth-of-type(1)')
      const input2 = form.querySelector('mi-test-form-input:nth-of-type(2)')

      await nap()

      assert.strictEqual(input1.value, 'john')
      assert.strictEqual(input2.value, 'john@example.com')

      const formData = new FormData(form)
      assert.strictEqual(formData.get('username'), 'john')
      assert.strictEqual(formData.get('email'), 'john@example.com')
    })

    it('shall update form data on value change', async () => {
      const html = `
        <form id="test-form">
          <mi-test-form-input name="username" value="jane"></mi-test-form-input>
          <button type="submit">Submit</button>
        </form>
      `
      document.body.innerHTML = html
      const form = document.getElementById('test-form')
      const input = form.querySelector('mi-test-form-input')

      await nap()

      assert.strictEqual(input.value, 'jane')
      let formData = new FormData(form)
      assert.strictEqual(formData.get('username'), 'jane')

      // simulate user input
      input.refs.input.value = 'updated'
      input.refs.input.dispatchEvent(new Event('input'))

      await nap()

      assert.strictEqual(input.value, 'updated')
      formData = new FormData(form)
      assert.strictEqual(formData.get('username'), 'updated')
    })
  })
})
