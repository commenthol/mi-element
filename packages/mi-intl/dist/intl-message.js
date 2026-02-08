import { MiElement, escHtml } from 'mi-element';

import { IntlConsumer } from './intl-consumer.js';

class MiIntlMessage extends MiElement {
  #context;
  static get properties() {
    return {
      label: {},
      value: {},
      unsafeHtml: {
        type: Boolean,
        initial: !1
      }
    };
  }
  constructor() {
    super(), this.#context = new IntlConsumer(this);
  }
  t(label, value) {
    return this.#context.value.t(label, value);
  }
  update() {
    if ('string' == typeof this.value) try {
      this.value = JSON.parse(this.value);
    } catch {
      this.value = {
        value: this.value
      };
    }
    if (this.unsafeHtml) {
      const escValue = {};
      for (const [key, val] of Object.entries(this.value || {})) escValue[key] = escHtml(val);
      this.renderRoot.innerHTML = this.t(this.label, escValue);
    } else this.renderRoot.textContent = this.t(this.label, this.value);
  }
}

export { MiIntlMessage };
