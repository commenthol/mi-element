import { ContextConsumer } from 'mi-element'

import { INTL_CONTEXT } from './intl-provider.js'

class IntlConsumer extends ContextConsumer {
  constructor(miElement, subscribe = !0) {
    super(miElement, INTL_CONTEXT, {
      subscribe: subscribe
    })
  }
}

export { IntlConsumer }
