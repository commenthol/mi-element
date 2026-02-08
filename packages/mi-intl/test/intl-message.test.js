import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { MiIntlMessage } from '../src/intl-message.js'
import { define, MiElement, ContextProvider } from 'mi-element'
import { INTL_CONTEXT } from '../src/intl-provider.js'

const napAf = () => new Promise((resolve) => requestAnimationFrame(resolve))

class MockIntlProvider extends MiElement {
  _contextValue() {
    return {
      t: (label, values) =>
        `translated: ${label} ${JSON.stringify(values) || ''}`
    }
  }

  render() {
    this.provider = new ContextProvider(
      this,
      INTL_CONTEXT,
      this._contextValue()
    )
  }

  update() {
    // updates signal and notifies all subscribers
    this.provider?.set(this._contextValue())
  }
}

describe('MiIntlMessage', () => {
  let element

  beforeAll(() => {
    define('mock-intl-provider', MockIntlProvider)
    define('mi-intl', MiIntlMessage)
  })

  beforeEach(() => {
    document.body.innerHTML = `<mock-intl-provider>
      <mi-intl id="test-intl" label="test" value='{"count":5}'></mi-intl>
    </mock-intl-provider>`
    element = document.getElementById('test-intl')
  })

  describe('properties', () => {
    it('should define label, value, and unsafeHtml properties', () => {
      const props = MiIntlMessage.properties
      expect(props).toHaveProperty('label')
      expect(props).toHaveProperty('value')
      expect(props).toHaveProperty('unsafeHtml')
    })

    it('should set unsafeHtml initial value to false', () => {
      expect(MiIntlMessage.properties.unsafeHtml.initial).toBe(false)
    })
  })

  describe('update()', () => {
    it('should set textContent when unsafeHtml is false', async () => {
      element.label = 'test.label'
      element.value = { count: 5 }
      await napAf() // wait for context value to propagate
      expect(element.shadowRoot.textContent).toBe(
        'translated: test.label {"count":5}'
      )
    })

    it('should set innerHTML when unsafeHtml is true', async () => {
      element.label = '<strong>Bold text</strong>'
      element.value = '<script>'
      element.unsafeHtml = true
      await napAf() // wait for context value to propagate
      expect(element.shadowRoot.innerHTML).toBe(
        'translated: <strong>Bold text</strong> {"value":"&lt;script&gt;"}'
      )
    })

    it('should call t with current label and value', async () => {
      await napAf() // wait for context value to propagate
      expect(element.shadowRoot.textContent).toBe(
        'translated: test {"count":5}'
      )
    })
  })
})
