class Signal {
  _subscribers=new Set;
  constructor(initialValue) {
    this._value = initialValue;
  }
  get value() {
    return this._value;
  }
  set value(newValue) {
    this._value !== newValue && (this._value = newValue, this.notify());
  }
  notify() {
    for (const callback of this._subscribers) callback(this._value);
  }
  subscribe(callback) {
    return this._subscribers.add(callback), () => {
      this._subscribers.delete(callback);
    };
  }
}

const createSignal = initialValue => new Signal(initialValue), isSignalLike = possibleSignal => 'function' == typeof possibleSignal?.subscribe && 'function' == typeof possibleSignal?.notify && 'value' in possibleSignal;

export { Signal, createSignal, isSignalLike };
