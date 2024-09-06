const context = [];

class State extends EventTarget {
  #value;
  #equals;
  constructor(value, options) {
    super();
    const {equals: equals} = options || {};
    this.#value = value, this.#equals = equals ?? ((value, nextValue) => value === nextValue);
  }
  get() {
    const running = context[context.length - 1];
    return running && running.add(this), this.#value;
  }
  set(nextValue) {
    this.#equals(this.#value, nextValue) || (this.#value = nextValue, this.dispatchEvent(new CustomEvent('signal')));
  }
}

const createSignal = (initialValue, options) => initialValue instanceof State ? initialValue : new State(initialValue, options);

function effect(cb) {
  const running = new Set;
  context.push(running);
  try {
    cb();
  } finally {
    context.pop();
  }
  for (const dep of running) dep.addEventListener('signal', cb);
  return () => {
    for (const dep of running) dep.removeEventListener('signal', cb);
  };
}

class Computed {
  #state;
  constructor(cb) {
    this.#state = new State, effect((() => this.#state.set(cb())));
  }
  get() {
    return this.#state.get();
  }
}

var signal = {
  State: State,
  createSignal: createSignal,
  effect: effect,
  Computed: Computed
};

export { Computed, State, createSignal, signal as default, effect };
