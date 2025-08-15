import { describe, it, expect } from 'vitest'
import { classMap, styleMap, addGlobalStyles } from '../src/styling.js'
import { nap } from './helpers.js'

describe('directives', () => {
  describe('classMap', () => {
    it('shall compose class', () => {
      const actual = classMap({
        button: true,
        'btn-primary': '',
        'btn-secondary': 'ok'
      })
      const expected = 'button btn-secondary'
      expect(actual).toEqual(expected)
    })
  })

  describe('styleMap', () => {
    it('shall compose class', () => {
      const actual = styleMap({
        backgroundColor: 'rgba(0,0,0,0.5)',
        minWidth: 16
      })
      const expected = 'background-color:rgba(0,0,0,0.5);min-width:16px'
      expect(actual).toEqual(expected)
    })
  })

  describe.only('addGlobalStyles', () => {
    it('shall apply global styles', async () => {
      // define global style
      const style = document.createElement('style')
      style.innerText = `h1 { color: red; }`
      document.body.appendChild(style)

      // define custom component
      customElements.define(
        'x-hello',
        class extends HTMLElement {
          connectedCallback() {
            this.renderRoot =
              this.shadowRoot ?? this.attachShadow({ mode: 'open' })
            addGlobalStyles(this.renderRoot)
            this.renderRoot.innerHTML = `<h1>Hello</h1>`
          }
        }
      )
      const xHello = document.createElement('x-hello')
      document.body.appendChild(xHello)
      // visually inspect that h1 has different color
      await nap()
    })
  })
})
