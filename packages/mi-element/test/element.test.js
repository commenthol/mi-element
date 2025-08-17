import { assert, describe, it, beforeEach } from 'vitest'
import { define, MiElement, refsBySelector, html } from '../src/index.js'
import { nap } from './helpers.js'

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
      assert.strictEqual(
        toString.call(MiTest.template),
        '[object HTMLTemplateElement]'
      )
    })

    it('shall transform template from string', () => {
      const tag = 'mi-test-template-str'
      class MiTest extends MiElement {
        static shadowRootOptions = null
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
        static shadowRootOptions = null
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
        static shadowRootOptions = null
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
        static shadowRootOptions = null
      }
      define(tag, MiTest)
      assert.throws(() => {
        const el = document.createElement(tag)
        el.addTemplate('huu')
      }, 'template is not a HTMLTemplateElement')
    })
  })

  describe('attributes', () => {
    const attributes = {
      empty: '',
      string: 'hi',
      true: true,
      false: false,
      undef: undefined,
      zero: 0,
      number: 1,
      array: [1, 2, 'hi'],
      obj: { one: 1, two: '2' },
      function: () => 1,
      camelCase: '',
      undefString: String,
      undefNumber: Number,
      undefBoolean: Boolean
    }
    const isExcludedAttribute = (name) =>
      [Boolean, Number, String].includes(attributes[name])

    let previousAttrs = null

    class MiTest extends MiElement {
      static get attributes() {
        return attributes
      }

      static template = `<pre></pre>`

      render() {
        previousAttrs = null
        this.refs = refsBySelector(this.renderRoot, { pre: 'pre' })
      }

      update(changedAttributes) {
        this.refs.pre.textContent = JSON.stringify(this, null, 2)
        previousAttrs = { ...previousAttrs, ...changedAttributes }
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

    it('shall assign default attributes', async () => {
      const collect = Object.keys(attributes).reduce((acc, name) => {
        acc[name] = el[name]
        return acc
      }, {})
      assert.deepStrictEqual(collect, {
        ...attributes,
        undefBoolean: undefined,
        undefNumber: undefined,
        undefString: undefined
      })
      await nap()
    })

    it('shall set and get attributes', async () => {
      for (const [name, value] of Object.entries(attributes)) {
        if (isExcludedAttribute(name)) continue
        el.setAttribute(name, value)
      }

      const collectAttrs = Object.keys(attributes).reduce((acc, name) => {
        if (!isExcludedAttribute(name)) {
          acc[name] = el.getAttribute(name)
        }
        return acc
      }, {})

      // console.log(el)
      // console.log(collectAttrs)

      // Take care if using setAttribute() as attribute names are case
      // insensitive "camelCase becomes "camelcase" and only strings and numbers
      // can be passed correctly. Booleans and objects as well as functions are
      // just stringified, which is not what we intent. Such MiElement hides
      // these values from being set as attribute.
      // `null` means that no attribute was set on the node
      assert.deepStrictEqual(collectAttrs, {
        array: null,
        empty: '',
        false: null,
        function: null,
        number: '1',
        obj: null,
        string: 'hi',
        true: '',
        undef: null,
        zero: '0',
        camelCase: ''
      })

      const collectProps = Object.keys(attributes).reduce((acc, name) => {
        acc[name] = el[name]
        return acc
      }, {})

      // console.log(collectProps)
      assert.deepStrictEqual(collectProps, {
        array: [1, 2, 'hi'],
        camelCase: '',
        empty: '',
        false: false,
        function: attributes.function,
        number: 1,
        obj: {
          one: 1,
          two: '2'
        },
        string: 'hi',
        true: true,
        undef: undefined,
        zero: 0,
        undefBoolean: undefined,
        undefNumber: undefined,
        undefString: undefined
      })

      await nap()
    })

    it('shall set and get boolean attributes', async () => {
      document.body.innerHTML = null
      const div = document.createElement('div')
      div.innerHTML = `<mi-test-attributes false="" true="false"></mi-test-attributes>`
      el = div.querySelector('mi-test-attributes')
      document.body.appendChild(el)
      await nap(100)
      assert.strictEqual(el.true, false)
      assert.strictEqual(el.false, true)
      // attribute true gets removed!
      assert.strictEqual(el.getAttribute('true'), null)
      assert.strictEqual(el.getAttribute('false'), '')
      await nap()
    })

    it('shall resolve camelCased attributes', async () => {
      const camels = '🐪🐫'
      el.setAttribute('camelcase', camels)
      assert.strictEqual(el.camelCase, camels)
      assert.strictEqual(el.getAttribute('camelcase'), camels)
      assert.strictEqual(el.getAttribute('camelCase'), camels)
      await nap()
    })

    it('shall pass previous attributes on render()', async () => {
      await nap()
      el.setAttribute('camelcase', '🐫')
      el.setAttribute('cantset', '❌')
      el.number = 42
      await nap()
      assert.deepStrictEqual(previousAttrs, {
        camelCase: '',
        number: 1
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
        }, 25)
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
})
