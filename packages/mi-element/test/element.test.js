import { expect, describe, it, beforeEach } from 'vitest'
import { define, MiElement, refsBySelector } from '../src/index.js'
import { nap } from './helpers.js'

describe('MiElement', () => {
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
      camelCase: ''
    }

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
        console.debug('update', previousAttrs)
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
      expect(collect).toStrictEqual(attributes)
      await nap()
    })

    it('shall set and get attributes', async () => {
      for (const [name, value] of Object.entries(attributes)) {
        el.setAttribute(name, value)
      }

      const collectAttrs = Object.keys(attributes).reduce((acc, name) => {
        acc[name] = el.getAttribute(name)
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
      expect(collectAttrs).toStrictEqual({
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
      expect(collectProps).toStrictEqual({
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
        zero: 0
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
      expect(el.true).toBe(false)
      expect(el.false).toBe(true)
      // attribute true gets removed!
      expect(el.getAttribute('true')).toEqual(null)
      expect(el.getAttribute('false')).toEqual('')
      await nap()
    })

    it('shall resolve camelCased attributes', async () => {
      const camels = '🐪🐫'
      el.setAttribute('camelcase', camels)
      expect(el.camelCase).toBe(camels)
      expect(el.getAttribute('camelcase')).toBe(camels)
      expect(el.getAttribute('camelCase')).toBe(camels)
      await nap()
    })

    it('shall pass previous attributes on render()', async () => {
      await nap()
      el.setAttribute('camelcase', '🐫')
      el.setAttribute('cantset', '❌')
      el.number = 42
      await nap()
      expect(previousAttrs).toStrictEqual({
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
      expect(events).toStrictEqual([
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
      expect(events).toEqual(['my-on', 'my-once', 'my-on'])
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
      expect(events).toEqual([])
      // call disconnectedCallback
      document.body.innerHTML = null
      await nap()
      expect(events).toEqual(['disposed'])
      await nap()
    })

    it('shall fail if listener is not a function', async () => {
      try {
        el.dispose('boo')
        throw new Error()
      } catch (err) {
        expect(err.message).toBe('listener must be a function')
      }
    })
  })
})
