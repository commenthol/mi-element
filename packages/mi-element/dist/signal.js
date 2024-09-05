const context = [];

class State {
  #subscribers=new Set;
  #value;
  #equals;
  constructor(value, options) {
    const {equals: equals} = options || {};
    this.#value = value, this.#equals = equals ?? ((value, nextValue) => value === nextValue);
  }
  get() {
    const running = context[context.length - 1];
    return running && (this.#subscribers.add(running), running.dependencies.add(this.#subscribers)), 
    this.#value;
  }
  set(nextValue) {
    if (!this.#equals(this.#value, nextValue)) {
      this.#value = nextValue;
      for (const running of [ ...this.#subscribers ]) running.execute();
    }
  }
}

const createSignal = (initialValue, options) => initialValue instanceof State ? initialValue : new State(initialValue, options);

function cleanup(running) {
  for (const dep of running.dependencies) dep.delete(running);
  running.dependencies.clear();
}

function effect(cb) {
  const execute = () => {
    cleanup(running), context.push(running);
    try {
      cb();
    } finally {
      context.pop();
    }
  }, running = {
    execute: execute,
    dependencies: new Set
  };
  return execute(), () => {
    cleanup(running);
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
