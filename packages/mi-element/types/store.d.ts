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
  constructor(actions: Record<string, Action>, initialValue?: any)
}
export function subscribeToStore(
  element: MiElement,
  store: Store,
  prop: string | string[]
): void
export type MiElement = import('./element.js').MiElement
export type Action = (state: any, data?: any) => any
import { Signal } from './signal.js'
