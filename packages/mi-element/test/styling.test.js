import { describe, it, expect } from 'vitest'
import {
  classNames,
  styleMap,
  addGlobalStyles,
  css,
  unsafeCss
} from '../src/styling.js'
import { nap } from './helpers.js'

describe('directives', () => {
  describe('classNames', () => {
    it('shall compose class', () => {
      const actual = classNames('', null, undefined, false, 0, 'there', {
        button: true,
        'btn-primary': '',
        'btn-secondary': 'ok'
      })
      const expected = 'there button btn-secondary'
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

  describe('addGlobalStyles', () => {
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

  describe('css', () => {
    it('shall use template literals', () => {
      const style = css`
        .red {
          color: ${'#f00'};
        }
      `
        .replace(/\s+/g, ' ')
        .trim()
      expect(style).toEqual(`.red { color: #f00; }`)
    })

    it('shall escape dangerous characters in interpolated values', () => {
      const style = css`
        .test {
          content: ${'</style><script>alert("xss")</script>'};
        }
      `
      console.log(style)
      expect(style).toContain('\\3c /style\\3e ')
      expect(style).toContain('\\3c script\\3e ')
    })

    it('shall escape ampersand in interpolated values', () => {
      const style = css`
        .test {
          content: ${'foo & bar'};
        }
      `
      expect(style).toContain('foo \\26  bar')
    })

    it('shall allow unsafeCss to bypass escaping', () => {
      const style = css`
        .test {
          content: ${unsafeCss('var(--my-color)')};
        }
      `
      expect(style).toContain('var(--my-color)')
      expect(style).not.toContain('\\')
    })

    it('shall escape null and undefined values gracefully', () => {
      const style = css`
        .test {
          color: ${null};
          padding: ${undefined};
        }
      `
      expect(style).toBeTruthy()
    })
  })
})
