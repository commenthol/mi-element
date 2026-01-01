import { define, MiElement } from '../../src/index.js'
import { render, html } from 'mi-html'

define(
  'mi-counter',
  class extends MiElement {
    static get properties() {
      return {
        count: { type: Number }
      }
    }

    constructor() {
      super()
      // initialize property
      this.count = 0
    }

    render() {
      render(
        this.renderRoot,
        () => html`
          <style>
            div {
              display: flex;
              flex-direction: column;
              max-width: 5em;
            }
            div > * {
              width: 100%;
            }
            h2 {
              border: 1px solid gray;
              text-align: center;
              padding: 0.25em 0;
              border-radius: 0.25em;
              margin: 0;
            }
          </style>
          <div>
            <h2>${this.count}</h2>
            <button @click=${() => this.count++}>Click here</button>
          </div>
        `
      )
    }
  }
)
