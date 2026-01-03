import { MiElement } from 'mi-element'
import { IntlConsumer } from './intl-consumer.js'

/**
 * Connects IntlConsumer to MiIntlProvider context
 * @example
 * ```js
 * import { define } from 'mi-element'
 * import { MiIntlMessage } from 'mi-intl'
 *
 * define('mi-message',
 *   class extends MiIntlMessage {
 *     static get properties() {
 *       return { label: {}, value: {} }
 *     }
 *     update() {
 *       this.renderRoot.textContent = this.t(this.label, this.value)
 *     }
 *   }
 * )
 * ```
 */
export class MiIntlMessage extends MiElement {
  #context

  constructor() {
    super()
    this.#context = new IntlConsumer(this)
  }

  t(label, value) {
    return this.#context.value.t(label, value)
  }

  /*
  update() {
    // update will be called on every #context.value change
    // use this.t() there or within a effect
  }
  */
}
