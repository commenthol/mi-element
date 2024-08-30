# mi-element

> a lightweight alternative to write web components

Only weights 2.3kB minified and gzipped.

mi-element provides further features to build web applications through 
[Web Components][] like:

- controllers to hook into the components lifecycle
- ContextProvider, ContextConsumer for data provisioning from outside of a
  component
- Store for managing shared state across components

# Usage

In your project:

```
npm i mi-element
```

```js
/** @file ./mi-counter.js */

import { MiElement, define, refsById } from 'mi-element'

// define your Component
class MiCounter extends MiElement {
  static template = `
  <style>
    :host { font-size: 1.25rem; }
  </style>
  <button id="decrement" aria-label="Decrement counter"> - </button>
  <span id aria-label="Counter value">0</span>
  <button id="increment" aria-label="Increment counter"> + </button>
  `

  // declare reactive attributes
  static get attributes() {
    return { count: 0 }
  }

  // called by connectedCallback()
  render() {
    // gather refs from template (here by id)
    this.refs = refsById(this.renderRoot)
    // apply event listeners
    this.refs.button.decrement.addEventListener('click', () => this.count--)
    this.refs.button.increment.addEventListener('click', () => this.count++)
  }

  // called on every change of an observed attributes via `this.requestUpdate()`
  update() {
    this.refs.span.textContent = this.count
  }
}

// create the custom element
define('mi-counter', MiCounter)
```

Now use in your HTML

```html
<body>
  <mi-counter></mi-counter>
  <mi-counter count="-3"></mi-counter>
  <script type="module" src="./mi-counter.js"></script>
</body>
```

In `./example` you'll find a working sample of a Todo App. Check it out with
`npm run example`

# Documentation

- [lifecycle][docs-lifecycle] mi-element's lifecycle
- [controller][docs-controller] adding controllers to mi-element to hook into the lifecycle
- [context][docs-context] Implementation of the [Context Protocol][].
- [store][docs-store] Manage shared state in an application
- [styling][docs-styling] Styling directives for "class" and "style"

# License

MIT licensed

[Context Protocol]: https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md
[Web Components]: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
[docs-lifecycle]: https://github.com/commenthol/mi-element/tree/main/packages/mi-element/docs/lifecycle.md
[docs-controller]: https://github.com/commenthol/mi-element/tree/main/packages/mi-element/docs/controller.md
[docs-context]: https://github.com/commenthol/mi-element/tree/main/packages/mi-element/docs/context.md
[docs-store]: https://github.com/commenthol/mi-element/tree/main/packages/mi-element/docs/store.md
[docs-styling]: https://github.com/commenthol/mi-element/tree/main/packages/mi-element/docs/styling.md
