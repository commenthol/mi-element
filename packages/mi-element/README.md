# mi-element

> a lightweight alternative to write web components

Only weights 2.3kB minified and gzipped.

mi-element provides features to build web applications through
[Web Components][] like:

- type coercion with setAttribute
- controllers to hook into the components lifecycle
- ContextProvider, ContextConsumer for data provisioning from outside of a
  component
- Store for managing shared state across components
- Signal for reactive behavior

The motivation to build this module comes from the confusions around attributes
and properties. "mi-element" solves this by providing the same results when
setting objects or functions either through `el.setAttribute(name, value)` or
properties `el[name] = value`.

Furthermore all observed attributes have a reactive behavior through the use of
signals and effects. It implements signals (loosely) following the
[TC39 JavaScript Signals standard proposal][].

# Usage

In your project:

```
npm i mi-element
```

```js
/** @file ./mi-counter.js */

import { MiElement, define, refsById, Signal } from 'mi-element'

// define your Component
class MiCounter extends MiElement {
  static template = `
  <style>
    :host { font-size: 1.25rem; }
  </style>
  <div id aria-label="Counter value">0</div>
  <button id="increment" aria-label="Increment counter"> + </button>
  `

  static get attributes() {
    // declare reactive attribute(s)
    return { count: 0 }
  }

  // called by connectedCallback()
  render() {
    // gather refs from template (here by id)
    this.refs = refsById(this.renderRoot)
    // apply event listeners
    this.refs.increment.addEventListener('click', () => {
      // change observed and reactive attribute...
      this.count++
    })
    Signal.effect(() => {
      // ...triggers update on every change of `this.count`
      this.refs.div.textContent = this.count
    })
  }
}

// create the custom element
define('mi-counter', MiCounter)
```

Now use your now component in your HTML

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
- [signal][docs-signal] Signals and effect for reactive behavior
- [store][docs-store] Manage shared state in an application
- [context][docs-context] Implementation of the [Context Protocol][].
- [styling][docs-styling] Styling directives for "class" and "style"

# License

MIT licensed

[docs-lifecycle]: https://github.com/commenthol/mi-element/tree/main/packages/mi-element/docs/lifecycle.md
[docs-controller]: https://github.com/commenthol/mi-element/tree/main/packages/mi-element/docs/controller.md
[docs-context]: https://github.com/commenthol/mi-element/tree/main/packages/mi-element/docs/context.md
[docs-signal]: https://github.com/commenthol/mi-element/tree/main/packages/mi-element/docs/signal.md
[docs-store]: https://github.com/commenthol/mi-element/tree/main/packages/mi-element/docs/store.md
[docs-styling]: https://github.com/commenthol/mi-element/tree/main/packages/mi-element/docs/styling.md
[Context Protocol]: https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md
[Web Components]: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
[TC39 JavaScript Signals standard proposal]: https://github.com/tc39/proposal-signals
[krausest/js-framework-benchmark]: https://github.com/krausest/js-framework-benchmark
