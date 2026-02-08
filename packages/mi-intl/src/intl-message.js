import { MiElement, escHtml } from 'mi-element'
import { IntlConsumer } from './intl-consumer.js'

/**
 * Connects IntlConsumer to MiIntlProvider context
 * @example
 * ```js
 * import { define } from 'mi-element'
 * import { MiIntlMessage } from 'mi-intl'
 *
 * define('mi-message', MiIntlMessage)
 * // then use <mi-message label="my.label" value='{ "count": 5 }'></mi-message> in your template
 * ```
 */
export class MiIntlMessage extends MiElement {
  #context

  static get properties() {
    return {
      label: {},
      value: {},
      unsafeHtml: { type: Boolean, initial: false }
    }
  }

  constructor() {
    super()
    this.#context = new IntlConsumer(this)
  }

  /**
   * @param {string} label
   * @param {object} [value]
   * @returns
   */
  t(label, value) {
    return this.#context.value.t(label, value)
  }

  update() {
    // ensure value is an object for interpolation, if it's a string
    // try to parse it as JSON otherwise use it as a value property
    if (typeof this.value === 'string') {
      try {
        this.value = JSON.parse(this.value)
      } catch {
        this.value = { value: this.value }
      }
    }
    if (this.unsafeHtml) {
      // escape values for interpolation to prevent XSS
      const escValue = {}
      for (const [key, val] of Object.entries(this.value || {})) {
        escValue[key] = escHtml(val)
      }
      this.renderRoot.innerHTML = this.t(this.label, escValue)
    } else {
      this.renderRoot.textContent = this.t(this.label, this.value)
    }
  }
}
