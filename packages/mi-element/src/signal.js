/**
 * tries to follow proposal JavaScript Signals standard proposal which is in
 * stage 1
 * @see https://github.com/tc39/proposal-signals
 * @credits https://github.com/jsebrech/tiny-signals
 */

// global context for nested reactivity
const context = []

/**
 * @template T
 * @typedef {(value?: T|null, nextValue?: T|null) => boolean} EqualsFn
 * Custom comparison function between old and new value
 * default `(value, nextValue) => value === nextValue`
 */

/**
 * @template T
 * @typedef {{equals: EqualsFn<T>}} SignalOptions
 */

/**
 * read- write signal
 * @template T
 */
export class State extends EventTarget {
  #value
  #equals

  /**
   * @param {T|null} [value]
   * @param {SignalOptions<T>} [options]
   */
  constructor(value, options) {
    super()
    const { equals } = options || {}
    this.#value = value
    this.#equals = equals ?? ((value, nextValue) => value === nextValue)
  }

  /**
   * @returns {T|null|undefined}
   */
  get() {
    const running = context[context.length - 1]
    if (running) {
      running.add(this)
    }
    return this.#value
  }

  /**
   * @param {T|null|undefined} nextValue
   */
  set(nextValue) {
    if (this.#equals(this.#value, nextValue)) {
      return
    }
    this.#value = nextValue
    this.dispatchEvent(new CustomEvent('signal'))
  }
}

/**
 * @template T
 * @param {T} initialValue
 * @param {SignalOptions<T>} [options]
 * @returns {State<T>}
 */
export const createSignal = (initialValue, options) =>
  initialValue instanceof State
    ? initialValue
    : new State(initialValue, options)

/**
 * effect subscribes to state at first run only. Do not hide a signal.get()
 * inside conditionals!
 * @param {() => void|Promise<void>} cb
 */
export function effect(cb) {
  const running = new Set()

  context.push(running)
  try {
    cb()
  } finally {
    context.pop()
  }
  for (const dep of running) {
    dep.addEventListener('signal', cb)
  }

  return () => {
    // unsubscribe from all dependencies
    for (const dep of running) {
      dep.removeEventListener('signal', cb)
    }
  }
}

/**
 * @template T
 */
export class Computed {
  #state

  /**
   * @param {() => T} cb
   */
  constructor(cb) {
    this.#state = new State()
    effect(() => this.#state.set(cb()))
  }

  /**
   * @template T
   * @returns {T}
   */
  get() {
    return this.#state.get()
  }
}

export default { State, createSignal, effect, Computed }
