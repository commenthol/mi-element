/**
 * @typedef {(value: any) => void} Callback
 */
export class Signal {
  /**
   * creates a new signal with an initial value
   * @param {any} [initialValue]
   */
  constructor(initialValue?: any)
  _subscribers: Set<any>
  _value: any
  /**
   * set new value on signal;
   * if value has changed all subscribers are called
   * @param {any} newValue
   */
  set value(newValue: any)
  /**
   * return current value
   * @returns {any}
   */
  get value(): any
  /**
   * notify all subscribers on current value
   */
  notify(): void
  /**
   * subscribe to signal to receive value updates
   * @param {Callback} callback
   * @returns {() => void} unsubscribe function
   */
  subscribe(callback: Callback): () => void
}
export function createSignal(initialValue?: any): Signal
export function isSignalLike(possibleSignal: any): boolean
export type Callback = (value: any) => void
