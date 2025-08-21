import { ContextConsumer } from 'mi-element'
import { INTL_CONTEXT } from './intl-provider.js'

/** @typedef {import('mi-element').MiElement} MiElement */

/**
 * ContextConsumer subscribing to MiIntlProvider context
 */
export class IntlConsumer extends ContextConsumer {
  /**
   * @param {MiElement} miElement
   * @param {boolean} [subscribe=true]
   */
  constructor(miElement, subscribe = true) {
    super(miElement, INTL_CONTEXT, { subscribe })
  }
}
