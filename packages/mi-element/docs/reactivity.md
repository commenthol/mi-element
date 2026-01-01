# Reactivity with mi-html

MiElement can be used with [mi-html][] for reactive updates.

To install use

    pnpm install mi-html

MiElement provides signals for all its attributes defined in `static get
attributes() {}`.

```js
import { define, MiElement } from 'mi-element'
import { html, render } from 'mi-html'

define(
  'mi-counter',
  class extends MiElement {
    static get properties() {
      return {
        count: { type: Number } //<< this.count is already a signal
      }
    }

    render() {
      render(
        this.renderRoot, 
        // use callback function!
        () => 
          html`<button @click=${() => this.count++}>
            Clicked ${this.count} times
          </button> `
      )
    }
  }
)
```

See `./example/mi-html/index.html` for a running sample.

[mi-html]: https://github.com/commenthol/mi-element/blob/main/packages/mi-html/README.md
