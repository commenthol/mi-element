import { MiElement } from 'mi-element';

import { IntlConsumer } from './intl-consumer.js';

class MiIntlMessage extends MiElement {
  #context;
  constructor() {
    super(), this.#context = new IntlConsumer(this);
  }
  t(label, value) {
    return this.#context.value.t(label, value);
  }
}

export { MiIntlMessage };
