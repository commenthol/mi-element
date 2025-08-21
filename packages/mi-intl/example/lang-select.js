import { define, MiElement, esc as html, unsafeHtml } from 'mi-element'
import { IntlConsumer } from '../src/index.js'

function flagEmoji(countryCode) {
  const map = { en: 'gb' }
  const codePoints = (map[countryCode] || countryCode)
    .slice(0, 2)
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt())
  return String.fromCodePoint(...codePoints)
}

define(
  'mi-lang-select',
  class extends MiElement {
    #context
    render() {
      this.#context = new IntlConsumer(this)
      this.renderRoot.innerHTML = html`
        <select>
          ${unsafeHtml(
            this.#context.value
              .getLanguages()
              .map(
                (lc) =>
                  html`<option value="${lc}">${flagEmoji(lc)} ${lc}</option>`
              )
              .join('')
          )}
        </select>
      `
      this.ref = this.renderRoot.querySelector('select')
      this.ref.addEventListener('change', (ev) => {
        this.#context.get().changeLanguage(ev.target.value).catch(console.error)
      })
    }

    update() {
      // synchronize selected value
      this.ref.value = this.#context.get().lng
    }
  }
)
