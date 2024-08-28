import { Signal, isSignalLike } from './signal.js';

class Store extends Signal {
  constructor(actions, initialValue) {
    super(initialValue);
    for (const [action, dispatcher] of Object.entries(actions)) this[action] = data => {
      this.value = dispatcher(data)(this.value);
    };
  }
}

const subscribeToStore = (element, store, propOrSignal) => {
  if (propOrSignal instanceof Signal || isSignalLike(propOrSignal)) return void element.dispose(store.subscribe((value => {
    propOrSignal.value = value;
  })));
  const keys = Array.isArray(propOrSignal) ? propOrSignal : propOrSignal.split('.').filter(Boolean), last = keys.pop();
  if (!last) throw TypeError('need prop');
  let tmp = element;
  for (const key of keys) {
    if ('object' != typeof tmp[key]) throw new TypeError(`object expected for property "${key}"`);
    tmp = tmp[key];
  }
  element.dispose(store.subscribe((value => {
    tmp[last] = value, element.requestUpdate();
  })));
};

export { Store, subscribeToStore };
