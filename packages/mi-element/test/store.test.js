import { describe, it, expect } from 'vitest'
import { Store, Signal } from '../src/index.js'

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
          get:
            (by = 1) =>
            (state) =>
              state + by
        }
        new Store(actions, 0)
        throw new Error()
      } catch (err) {
        expect(err.message).toBe('action "get" is already defined')
      }
    })

    it('shall create a store with action', () => {
      const initialValue = 7
      const store = new Store(actions, initialValue)
      expect(store.get()).toBe(7)
    })

    it('shall change store value and notify subscribers', async () => {
      const p = Promise.withResolvers()
      const store = new Store(actions, 0)
      const events = []
      const unsubscribe = Signal.effect(() => {
        events.push(`a:${store.get()}`)
      })
      Signal.effect(() => {
        events.push(`b:${store.get()}`)
        if (events.length > 5) {
          p.resolve()
        }
      })
      expect(typeof unsubscribe).toBe('function')
      setTimeout(() => {
        store.increment()
        store.increment()
        unsubscribe()
        store.increment()
        store.increment()
        // p.reject(new Error())
      }, 10)
      await p.promise
      expect(events).toEqual([
        'a:0',
        'b:0',
        'a:1',
        'b:1',
        'a:2',
        'b:2',
        'b:3',
        'b:4'
      ])
    })
  })
})
