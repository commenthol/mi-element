import { createSignal, effect } from './signal.js';

class ContextProvider {
  constructor(host, context, initialValue) {
    this.host = host, this.context = context, this.state = createSignal(initialValue), 
    this.host.addController?.(this);
  }
  hostConnected() {
    this.host.addEventListener("context-request", this.onContextRequest);
  }
  hostDisconnected() {
    this.host.removeEventListener("context-request", this.onContextRequest);
  }
  set(newValue) {
    this.state.set(newValue);
  }
  get() {
    return this.state.get();
  }
  onContextRequest=ev => {
    if (ev.context !== this.context) return;
    let unsubscribe;
    ev.stopPropagation(), ev.subscribe && (unsubscribe = effect((() => {
      const value = this.get();
      unsubscribe && ev.callback(value, unsubscribe);
    }))), ev.callback(this.get(), unsubscribe);
  };
}

class ContextRequestEvent extends Event {
  constructor(context, callback, subscribe) {
    super("context-request", {
      bubbles: !0,
      composed: !0
    }), this.context = context, this.callback = callback, this.subscribe = subscribe;
  }
}

class ContextConsumer {
  constructor(host, context, options) {
    const {subscribe: subscribe = !1, validate: validate = () => !0} = options || {};
    this.host = host, this.context = context, this.subscribe = !!subscribe, this.validate = validate, 
    this.value = void 0, this.unsubscribe = void 0, this.host.addController?.(this);
  }
  hostConnected() {
    this.dispatchRequest();
  }
  hostDisconnected() {
    this.unsubscribe && (this.unsubscribe(), this.unsubscribe = void 0);
  }
  dispatchRequest() {
    this.host.dispatchEvent(new ContextRequestEvent(this.context, this._callback.bind(this), this.subscribe));
  }
  _callback(value, unsubscribe) {
    unsubscribe && (this.subscribe ? this.unsubscribe && (this.unsubscribe !== unsubscribe && this.unsubscribe(), 
    this.unsubscribe = unsubscribe) : unsubscribe()), this.validate(value) && (this.value = value, 
    this.host.requestUpdate());
  }
}

export { ContextConsumer, ContextProvider, ContextRequestEvent };
