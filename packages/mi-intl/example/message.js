import { define } from 'mi-element'
import { MiIntlMessage } from '../src/index.js'

const safeJson = (any) => {
  if (typeof any !== 'string') {
    return any
  }
  try {
    return JSON.parse(any)
  } catch (_err) {
    return { value: any }
  }
}

define(
  'mi-message',
  class extends MiIntlMessage {
    static get attributes() {
      return { label: String, value: String, html: false }
    }

    update() {
      const values = safeJson(this.value)
      const str = this.t(this.label, values)
      if (this.html) {
        // render unsafe html
        this.renderRoot.innerHTML = str
      } else {
        this.renderRoot.textContent = str
      }
    }
  }
)
