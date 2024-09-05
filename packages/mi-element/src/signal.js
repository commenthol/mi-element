/**
 * tries to follow proposal JavaScript Signals standard proposal which is in
 * stage 1
 * @see https://github.com/tc39/proposal-signals
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
export class State {
  #subscribers = new Set()
  #value
  #equals

  /**
   * @param {T|null} [value]
   * @param {SignalOptions<T>} [options]
   */
  constructor(value, options) {
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
      this.#subscribers.add(running)
      running.dependencies.add(this.#subscribers)
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
    for (const running of [...this.#subscribers]) {
      // run the effect()
      running.execute()
    }
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

function cleanup(running) {
  // delete all dependent subscribers from state
  for (const dep of running.dependencies) {
    dep.delete(running)
  }
  running.dependencies.clear()
}

/**
 * @param {() => void|Promise<void>} cb
 */
export function effect(cb) {
  const execute = () => {
    cleanup(running)
    context.push(running)
    try {
      cb()
    } finally {
      context.pop()
    }
  }

  const running = { execute, dependencies: new Set() }
  execute()

  return () => {
    // unsubscribe from all dependencies
    cleanup(running)
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
