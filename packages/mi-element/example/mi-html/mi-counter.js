import { define, MiElement, render, html } from '../../dist/index.min.js'

define(
  'mi-counter',
  class extends MiElement {
    static get attributes() {
      return {
        count: 1
      }
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
