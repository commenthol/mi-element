import { describe, it, expect } from 'vitest'
import { Signal } from '../src/index.js'

const { createSignal, effect } = Signal

describe('signal', () => {
  it('shall create a signal', () => {
    const signal = createSignal()
    expect(signal.get()).toBe(undefined)
  })

  it('shall create a signal from a signal', () => {
    const signal = createSignal()
    const signal2 = createSignal(signal)
    expect(signal2).toBe(signal)
  })

  it('shall subscribe to changes', async () => {
    const signal = createSignal(0)
    const p = Promise.withResolvers()
    effect(() => {
      if (signal.get() !== 0) p.resolve(signal.get())
    })
    setTimeout(() => {
      signal.set('foo')
    }, 25)
    const actual = await p.promise
    expect(actual).toBe(signal.get())
  })

  it('shall notify only if value changes', async () => {
    const signal = createSignal('foo')
    const p = Promise.withResolvers()
    const events = []
    effect(() => {
      events.push(signal.get())
      if (events.length >= 2) {
        p.resolve()
      }
    })
    setTimeout(() => {
      signal.set('bar')
      signal.set('wat')
    })
    await p.promise
    expect(events).toEqual(['foo', 'bar', 'wat'])
  })

  it('shall subscribe and unsubscribe', async () => {
    const signal = createSignal('foo')
    const p = Promise.withResolvers()
    const events = []
    const unsubscribe = effect(() => {
      events.push(signal.get())
      if (events.length == 2) p.resolve()
    })
    signal.set('bar')
    await p.promise
    unsubscribe()
    signal.set('wat')
    expect(events).toEqual(['foo', 'bar'])
  })

  it('shall set a custom comparison function', () => {
    const equals = (_value, nextValue) => ![1, 4].includes(nextValue)
    const signal = createSignal(0, { equals })
    const events = []
    effect(() => events.push(signal.get()))
    signal.set(1)
    signal.set(2)
    signal.set(3)
    signal.set(4)
    expect(events).toEqual([0, 1, 4])
  })

  it('shall create a computed signal', async () => {
    const firstName = createSignal('Joe')
    const lastName = createSignal('Doe')
    const name = new Signal.Computed(
      () => `${firstName.get()} ${lastName.get()}`
    )
    const events = []
    effect(() => {
      events.push(name.get())
    })
    firstName.set('Alice')
    lastName.set('Wonderland')
    expect(events).toEqual(['Joe Doe', 'Alice Doe', 'Alice Wonderland'])
  })
})
