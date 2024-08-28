import { describe, it, expect } from 'vitest'
import { Store, subscribeToStore } from '../src/index.js'

describe('store', () => {
  const actions = {
    increment:
      (by = 1) =>
      (state) =>
        state + by
  }

  describe('Store', () => {
    it('shall fail if action is not a function', () => {
      try {
        const actions = {
          increment: (by) => by
        }
        new Store(actions, 0)
        throw new Error()
      } catch (err) {
        expect(err.message).toBe(
          'action "increment" must be a function of type `() => (state) => state`'
        )
      }
    })

    it('shall fail if action overwrites', () => {
      try {
        const actions = {
          notify:
            (by = 1) =>
            (state) =>
              state + by
        }
        new Store(actions, 0)
        throw new Error()
      } catch (err) {
        expect(err.message).toBe('action "notify" is already defined')
      }
    })

    it('shall create a store with action', () => {
      const initialValue = 7
      const store = new Store(actions, initialValue)
      expect(store.value).toBe(7)
    })

    it('shall change store value and notify subscribers', async () => {
      const p = Promise.withResolvers()
      const store = new Store(actions, 0)
      const events = []
      const unsubscribe = store.subscribe((value) => {
        events.push(`a:${value}`)
      })
      store.subscribe((value) => {
        events.push(`b:${value}`)
        if (events.length > 5) {
          p.resolve()
        }
      })
      expect(typeof unsubscribe).toBe('function')
      setTimeout(() => {
        store.value++
        store.value++
        unsubscribe()
        store.value++
        store.value++
      })
      await p.promise
      expect(events).toEqual(['a:1', 'b:1', 'a:2', 'b:2', 'b:3', 'b:4'])
    })
  })

  describe('subscribeToStore()', () => {
    class MockPiElement {
      events = []
      disposers = []
      dispose(listener) {
        this.events.push('dispose')
        this.disposers.push(listener)
      }
      requestUpdate() {
        this.events.push('requestUpdate')
      }
      disconnectedCallback() {
        this.disposers.forEach((listener) => listener())
      }
    }

    it('element shall subscribe to store', async () => {
      const store = new Store(actions, 0)
      const element = new MockPiElement()
      subscribeToStore(element, store, 'store')
      store.increment(3)
      expect(element.store).toBe(3)
      expect(element.events).toEqual(['dispose', 'requestUpdate'])
      store.increment(3)
      expect(element.store).toBe(6)
      expect(element.events).toEqual([
        'dispose',
        'requestUpdate',
        'requestUpdate'
      ])
      element.disconnectedCallback()
      store.increment(3)
      // element won't get notified as being disconnected
      expect(element.store).toBe(6)
    })

    it('element shall fail if property does not exist', () => {
      const store = new Store(actions, 0)
      const element = new MockPiElement()
      try {
        subscribeToStore(element, store, ['stores', 'counter'])
        throw new Error()
      } catch (err) {
        expect(err.message).toBe('object expected for property "stores"')
      }
    })

    it('element shall subscribe to stores', async () => {
      const storeA = new Store(actions, 0)
      const storeB = new Store(actions, 2)
      const element = new MockPiElement()
      element.stores = {}
      subscribeToStore(element, storeA, 'stores.a')
      subscribeToStore(element, storeB, 'stores.b')
      storeA.increment(3)
      storeB.increment(2)
      expect(element.stores).toEqual({ a: 3, b: 4 })
    })
  })
})
