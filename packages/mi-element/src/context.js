/**
 * @see https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md
 */

import { createSignal, effect } from './signal.js'

/**
 * @typedef {import('./element.js').HostController} HostController
 */
/**
 * @typedef {string|Symbol} Context
 */

const CONTEXT_REQUEST = 'context-request'

/**
 * @implements {HostController}
 */
export class ContextProvider {
  /**
   * @param {HTMLElement} host
   * @param {Context} context
   * @param {any} initialValue
   */
  constructor(host, context, initialValue) {
    this.host = host
    this.context = context
    this.state = createSignal(initialValue)
    // @ts-expect-error
    this.host.addController?.(this)
  }

  hostConnected() {
    // @ts-expect-error
    this.host.addEventListener(CONTEXT_REQUEST, this.onContextRequest)
  }

  hostDisconnected() {
    // @ts-expect-error
    this.host.removeEventListener(CONTEXT_REQUEST, this.onContextRequest)
  }

  /**
   * @param {any} newValue
   */
  set(newValue) {
    this.state.set(newValue)
  }

  /**
   * @returns {any}
   */
  get() {
    return this.state.get()
  }

  /**
   * @private
   * @param {ContextRequestEvent} ev
   */
  onContextRequest = (ev) => {
    if (ev.context !== this.context) {
      // event has wrong context
      return
    }
    ev.stopPropagation()
    console.debug('provider.onContextRequest', this.state)
    let unsubscribe
    if (ev.subscribe) {
      unsubscribe = effect(() => {
        // needed to subscribe to signal
        const value = this.get()
        // don't call callback the first time where unsubscribe is not defined
        if (unsubscribe) ev.callback(value, unsubscribe)
      })
    }
    ev.callback(this.get(), unsubscribe)
  }
}

export class ContextRequestEvent extends Event {
  /**
   * @param {Context} context
   * @param {(value: any, unsubscribe?: () => void) => void} callback
   * @param {boolean} [subscribe=false] subscribe to value changes
   */
  constructor(context, callback, subscribe) {
    super(CONTEXT_REQUEST, { bubbles: true, composed: true })
    this.context = context
    this.callback = callback
    this.subscribe = subscribe
  }
}

/**
 * @implements {HostController}
 */
export class ContextConsumer {
  /**
   * @param {HTMLElement} host
   * @param {Context} context
   * @param {object} [options]
   * @param {boolean} [options.subscribe=false] subscribe to value changes
   * @param {(any) => boolean} [options.validate] validation function
   */
  constructor(host, context, options) {
    const { subscribe = false, validate = () => true } = options || {}
    this.host = host
    this.context = context
    this.subscribe = !!subscribe
    this.validate = validate
    // initial value yet unknown
    this.value = undefined
    // unsubscribe function
    this.unsubscribe = undefined
    // add the controller in case of a MiElement otherwise call hostConnected()
    // and hostDisconnected() from the host element
    // @ts-expect-error
    this.host.addController?.(this)
  }

  hostConnected() {
    this.dispatchRequest()
  }

  hostDisconnected() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = undefined
    }
  }

  dispatchRequest() {
    this.host.dispatchEvent(
      new ContextRequestEvent(
        this.context,
        this._callback.bind(this),
        this.subscribe
      )
    )
  }

  _callback(value, unsubscribe) {
    console.debug('consumer.callback', { value, unsubscribe })
    if (unsubscribe) {
      if (!this.subscribe) {
        // unsubscribe as we didn't ask for subscription
        unsubscribe()
      } else if (this.unsubscribe) {
        if (this.unsubscribe !== unsubscribe) {
          // looks there was a previous provider
          this.unsubscribe()
        }
        this.unsubscribe = unsubscribe
      }
    }
    if (!this.validate(value)) {
      return
    }
    this.value = value
    // @ts-expect-error
    this.host.requestUpdate()
  }
}
