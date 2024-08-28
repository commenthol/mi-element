import { isSignalLike, createSignal } from './signal.js';

class ContextProvider {
  constructor(host, context, initialValue) {
    this.host = host, this.context = context, this.state = isSignalLike(initialValue) ? initialValue : createSignal(initialValue), 
    this.host.addController?.(this);
  }
  hostConnected() {
    this.host.addEventListener("context-request", this.onContextRequest);
  }
  hostDisconnected() {
    this.host.removeEventListener("context-request", this.onContextRequest);
  }
  set value(newValue) {
    this.state.value = newValue;
  }
  get value() {
    return this.state.value;
  }
  notify() {
    this.state.notify();
  }
  onContextRequest=ev => {
    if (ev.context !== this.context) return;
    ev.stopPropagation();
    const unsubscribe = ev.subscribe ? this.state.subscribe(ev.callback) : void 0;
    ev.callback(this.value, unsubscribe);
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
