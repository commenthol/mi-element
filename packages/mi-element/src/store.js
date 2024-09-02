import { State } from './signal.js'

/**
 * @typedef {import('./element.js').MiElement} MiElement
 */
/**
 * @typedef {(state: any, data?: any) => any} Action
 */
/**
 * @template T
 * @typedef {import('./signal.js').SignalOptions<T>} SignalOptions<T>
 */

/**
 * Store implementing [Flux](https://www.npmjs.com/package/flux) pattern based
 * on Signals
 * @template T
 */
export class Store extends State {
  /**
   * @param {Record<string, Action>} actions
   * @param {T|null} [initialValue]
   * @param {SignalOptions<T>} [options]
   * @example
   * ```js
   * import { Signal, Store } from 'mi-element'
   * const actions = { increment: (by = 1) => (current) => current + by }
   * const initialValue = 1
   * const store = new Store(actions, initialValue)
   * // subscribe with a callback function
   * const unsubscribe = Signal.effect(() => console.log(`count is ${store.get()}`))
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
   *   increment: (by = 1) => (state) => ({...state, count: state.count + by})
   * }
   * ```
   * or you change the signals options equality function
   * ```js
   * const actions = {
   *   increment: (by = 1) => (state) => {
   *     state.count += by
   *     return state
   *   }
   * }
   * const initialValue = { count: 0, other: 'foo' }
   * const options = { equals: (value, nextValue) => true }
   * const store = new Store(actions, initialValue, options)
   * ```
   */
  constructor(actions, initialValue, options) {
    super(initialValue, options)
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
      this[action] = (data) => this.set(dispatcher(data)(this.get()))
    }
  }
}
