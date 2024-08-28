import { describe, it, beforeEach, expect } from 'vitest'
import {
  ContextProvider,
  ContextConsumer,
  define,
  MiElement,
  refsById
} from '../src/index.js'
import { nap } from './helpers.js'

describe('context', () => {
  class MiTestContextProvider extends MiElement {
    static get attributes() {
      return {
        context: 'counter',
        value: 0
      }
    }

    render() {
      this.renderRoot.innerHTML = '<slot></slot>'
      this.provider = new ContextProvider(
        this,
        this.context,
        this._providerValue()
      )
    }

    increment = () => {
      this.value++
    }

    _providerValue() {
      // create a new object on every change
      return { value: this.value, increment: this.increment }
    }

    update() {
      this.provider.value = this._providerValue()
    }
  }

  define('mi-test-context-provider', MiTestContextProvider)

  class MiTestContextConsumer extends MiElement {
    static get attributes() {
      return {
        context: 'counter'
      }
    }

    static shadowRootOptions = null

    static template = '<span id>0</span>'

    render() {
      this.consumer = new ContextConsumer(this, this.context, {
        subscribe: true
      })
      this.refs = refsById(this.renderRoot)
      this.addEventListener('click', () => {
        this.consumer.value.increment()
      })
    }

    update() {
      this.refs.span.textContent = this.consumer.value?.value || 0
    }
  }

  define('mi-test-context-consumer', MiTestContextConsumer)

  const getCounters = (el) =>
    Array.from(el.querySelectorAll('mi-test-context-consumer')).map(
      (n) => n.textContent.trim()
    )

  const clickEvent = () =>
    new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    })

  beforeEach(() => {
    document.body.innerHTML = null
  })

  it('shall increment both consumers', async () => {
    const el = document.createElement('div')
    el.innerHTML = `
    <mi-test-context-provider>
      <div>
        <mi-test-context-consumer id="first">
        </mi-test-context-consumer>
      </div>
      <div>
        <mi-test-context-consumer id="second">
        </mi-test-context-consumer>
      <div>
    </mi-test-context-provider>
    `
    document.body.appendChild(el)
    expect(getCounters(el)).toEqual(['0', '0'])
    await nap()
    const $first = el.querySelector('#first')
    $first.dispatchEvent(clickEvent())
    await nap(300)
    expect(getCounters(el)).toEqual(['1', '1'])
    const $second = el.querySelector('#second')
    $second.dispatchEvent(clickEvent())
    await nap(300)
    expect(getCounters(el)).toEqual(['2', '2'])
    await nap()
  })

  it('shall increment consumers by each provider', async () => {
    const el = document.createElement('div')
    el.innerHTML = `
    <mi-test-context-provider>
      <div>
        <mi-test-context-consumer id="first">
        </mi-test-context-consumer>
      </div>
      <mi-test-context-provider value="3">
      <div>
        <mi-test-context-consumer id="second">
        </mi-test-context-consumer>
      <div>
      </mi-test-context-provider>
    </mi-test-context-provider>
    `
    document.body.appendChild(el)
    expect(getCounters(el)).toEqual(['0', '0'])
    // after mount initial value is propagated
    await nap()
    expect(getCounters(el)).toEqual(['0', '3'])
    // click on #first consumer
    const $first = el.querySelector('#first')
    $first.dispatchEvent(clickEvent())
    await nap(300)
    expect(getCounters(el)).toEqual(['1', '3'])
    // click on #second consumer
    const $second = el.querySelector('#second')
    $second.dispatchEvent(clickEvent())
    await nap(300)
    expect(getCounters(el)).toEqual(['1', '4'])
    await nap()
  })

  it('shall increment consumers by different context', async () => {
    const el = document.createElement('div')
    el.innerHTML = `
    <mi-test-context-provider context="second" value="3">
      <mi-test-context-provider>
        <div>
          <mi-test-context-consumer id="first">
          </mi-test-context-consumer>
        </div>
        <div>
          <mi-test-context-consumer id="second" context="second">
          </mi-test-context-consumer>
        <div>
      </mi-test-context-provider>
    </mi-test-context-provider>
    `
    document.body.appendChild(el)
    expect(getCounters(el)).toEqual(['0', '0'])
    // after mount initial value is propagated
    await nap()
    expect(getCounters(el)).toEqual(['0', '3'])
    // click on #first consumer
    const $first = el.querySelector('#first')
    $first.dispatchEvent(clickEvent())
    await nap(300)
    expect(getCounters(el)).toEqual(['1', '3'])
    // click on #second consumer
    const $second = el.querySelector('#second')
    $second.dispatchEvent(clickEvent())
    await nap(300)
    expect(getCounters(el)).toEqual(['1', '4'])
    await nap()
  })
})
