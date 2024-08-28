/**
 * @typedef {(value: any) => void} Callback
 */

export class Signal {
  _subscribers = new Set()

  /**
   * creates a new signal with an initial value
   * @param {any} [initialValue]
   */
  constructor(initialValue) {
    this._value = initialValue
  }

  /**
   * return current value
   * @returns {any}
   */
  get value() {
    return this._value
  }

  /**
   * set new value on signal;
   * if value has changed all subscribers are called
   * @param {any} newValue
   */
  set value(newValue) {
    // value or reference must have changed to notify subscribers
    if (this._value === newValue) {
      return
    }
    this._value = newValue
    this.notify()
  }

  /**
   * notify all subscribers on current value
   */
  notify() {
    for (const callback of this._subscribers) {
      callback(this._value)
    }
  }

  /**
   * subscribe to signal to receive value updates
   * @param {Callback} callback
   * @returns {() => void} unsubscribe function
   */
  subscribe(callback) {
    this._subscribers.add(callback)
    const unsubscribe = () => {
      this._subscribers.delete(callback)
    }
    return unsubscribe
  }
}

/**
 * creates a signal
 * @param {any} [initialValue]
 * @returns {Signal}
 */
export const createSignal = (initialValue) => new Signal(initialValue)

/**
 * check if implements signal like features
 * @param {any} possibleSignal
 * @returns {boolean}
 */
export const isSignalLike = (possibleSignal) =>
  typeof possibleSignal?.subscribe === 'function' &&
  typeof possibleSignal?.notify === 'function' &&
  'value' in possibleSignal
