import { Signal, isSignalLike } from './signal.js'

/**
 * @typedef {import('./element.js').MiElement} MiElement
 */
/**
 * @typedef {(state: any, data?: any) => any} Action
 */

/**
 * Store implementing [Flux](https://www.npmjs.com/package/flux) pattern based
 * on Signals
 */
export class Store extends Signal {
  /**
   * @param {Record<string, Action>} actions
   * @param {any} [initialValue]
   * @example
   * ```js
   * const actions = { increment: (by = 1) => (current) => current + by }
   * const initialValue = 1
   * const store = new Store(actions, initialValue)
   * // subscribe with a callback function
   * const unsubscribe = store.subscribe((value) => console.log(`count is ${value}`))
   * // change the store
   * store.increment(2) // increment by 2
   * //> count is 3
   * unsubscribe()
   * ```
   *
   * if `initialValue` is an object, the object's reference must be changed
   * using the spread operator, in order to notify on state changes, e.g.
   * ```js
   * const initialValue = { count: 0, other: 'foo' }
   * const actions = {
   *  increment: (by = 1) => (state) => ({...state, count: state.count + by})
   * }
   * ```
   */
  constructor(actions, initialValue) {
    super(initialValue)
    for (const [action, dispatcher] of Object.entries(actions)) {
      if (process.env.NODE_ENV !== 'production') {
        if (this[action]) {
          throw new Error(`action "${action}" is already defined`)
        }
        if (
          typeof dispatcher !== 'function' ||
          typeof dispatcher(undefined) !== 'function'
        ) {
          throw new Error(
            `action "${action}" must be a function of type \`() => (state) => state\``
          )
        }
      }
      this[action] = (data) => {
        this.value = dispatcher(data)(this.value)
      }
    }
  }
}

/**
 * subscribe to a store from a MiElement with unsubscription from store on
 * disconnectedCallback()
 * @param {MiElement} element
 * @param {Store} store
 * @param {string|string[]|Signal} propOrSignal element property to apply store
 * value updates
 */
export const subscribeToStore = (element, store, propOrSignal) => {
  if (propOrSignal instanceof Signal || isSignalLike(propOrSignal)) {
    element.dispose(
      store.subscribe((value) => {
        // @ts-expect-error
        propOrSignal.value = value
      })
    )
    return
  }
  const keys = Array.isArray(propOrSignal)
    ? propOrSignal
    : propOrSignal.split('.').filter(Boolean)
  const last = keys.pop()
  if (!last) throw TypeError('need prop')
  let tmp = element
  for (const key of keys) {
    if (typeof tmp[key] !== 'object') {
      throw new TypeError(`object expected for property "${key}"`)
    }
    tmp = tmp[key]
  }
  element.dispose(
    store.subscribe((value) => {
      tmp[last] = value
      element.requestUpdate()
    })
  )
}
