import { describe, it, expect } from 'vitest'
import { createSignal, isSignalLike } from '../src/index.js'
import { nap } from './helpers.js'

describe('signal', () => {
  it('shall create a signal', () => {
    const signal = createSignal()
    expect(signal.value).toBe(undefined)
  })

  it('isSignalLike is true', () => {
    const signal = createSignal()
    expect(isSignalLike(signal)).toBe(true)
  })

  it('shall subscribe to changes', async () => {
    const signal = createSignal()
    const p = Promise.withResolvers()
    signal.subscribe((value) => {
      p.resolve(value)
    })
    setTimeout(() => {
      signal.value = 'foo'
    }, 25)
    const actual = await p.promise
    expect(actual).toBe(signal.value)
  })

  it('shall notify only if value changes', async () => {
    const signal = createSignal('foo')
    const p = Promise.withResolvers()
    const events = []
    signal.subscribe((value) => {
      events.push(value)
      p.resolve(value)
    })
    setTimeout(() => {
      signal.value = 'foo'
      signal.value = 'bar'
    })
    const actual = await p.promise
    expect(actual).toBe(signal.value)
    expect(events).toEqual(['bar'])
  })

  it('shall subscribe and unsubscribe', async () => {
    const signal = createSignal()
    const p = Promise.withResolvers()
    const events = []
    const unsubscribe = signal.subscribe((value) => {
      events.push(value)
      p.resolve(value)
    })
    signal.value = 'foo'
    const actual = await p.promise
    expect(actual).toBe(signal.value)
    unsubscribe()
    signal.value = 'bar'
    await nap(10)
    expect(events).toEqual(['foo'])
  })

  it('shall subscribe and notify', async () => {
    const signal = createSignal('foo')
    const p = Promise.withResolvers()
    signal.subscribe((value) => {
      p.resolve(value)
    })
    setTimeout(() => {
      signal.notify()
    }, 25)
    const actual = await p.promise
    expect(actual).toBe(signal.value)
  })
})
