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
export class Store<T> extends State<any> {
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
    constructor(actions: Record<string, Action>, initialValue?: T | null | undefined, options?: SignalOptions<T> | undefined);
}
export type MiElement = import("./element.js").MiElement;
export type Action = (state: any, data?: any) => any;
/**
 * <T>
 */
export type SignalOptions<T> = import("./signal.js").SignalOptions<T>;
import { State } from './signal.js';
