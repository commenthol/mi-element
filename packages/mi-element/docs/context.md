**Table of contents**

<!-- !toc (minlevel=2) -->

- [ContextProvider](#contextprovider)
- [ContextConsumer](#contextconsumer)
- [Connecting consumers to providers](#connecting-consumers-to-providers)

<!-- toc! -->

# Context

Implements the [Context Protocol][].

[Context Protocol]: https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md

## ContextProvider

```js
import { define, MiElement, ContextProvider, ContextConsumer } from 'mi-element'

define(
  'mi-context-provider',
  class extends MiElement {
    static get properties () {
      return {
        context: {},
        value: { type: Number }
      }
    }

    constructor() {
      super()
      // define the context and set initial value
      // default context shall be unique amongst other context providers
      this.context = 'my-context-provider' 
      this.value = 0
    }

    render() {
      this.renderRoot.innerHTML = '<slot></slot>'
      this.provider = new ContextProvider(
        this,
        this.context,
        this._providerValue()
      )
      this.update()
    }

    update() {
      // updates signal and notifies all subscribers
      this.provider.value = this._providerValue()
    }

    increment() {
      // value is observed value, requestUpdate() is called on every change
      this.value++
    }

    _providerValue() {
      // create a new object on every change and add all shared values and methods
      return {
        value: this.value,
        increment: () => this.increment()
      }
    }
  }
)
```

Works also with HTMLElement. In this case you must provide the necessary wiring.

```js
customElement.define('html-context-provider', extends class HTMLElement {
  connectedCallback() {
    this.provider = new ContextProvider(this, this.context, this)
    this.provider.hostConnected()
  }
  disconnectedCallback() {
    this.provider.hostDisconnected()
  }
  requestUpdate() {
    this.provider.value = this._providerValue()
  }
  // ...
})
```

## ContextConsumer

```js
define(
  'mi-context-consumer',
  class extends MiElement {
    static get properties() {
      return {
        context: {},
        subscribe: { type: Boolean }
      }
    }

    static template = `
    <button id>Increment</button>
    <span id>0</span>`

    constructor() {
      super()
      // define the context and set initial value
      // default context shall be unique amongst other context providers 
      // must match the context-providers context!
      this.context = 'my-context-provider'
      this.subscribe = false
    }

    render() {
      this.consumer = new ContextConsumer(this, this.context, {
        subscribe: this.subscribe
      })
      this.refs = refsById(this.renderRoot)
      this.refs.button.addEventListener('click', () => {
        this.consumer.value.increment()
      })
      this.update()
    }

    update() {
      this.refs.span.textContent = this.consumer.value?.value || 0
    }
  }
)
```

## Connecting consumers to providers

```html
<mi-context-provider context="outer">
  <mi-context-provider value="3">
    <div>
      <!-- does not subscribe to any changes -->
      <mi-context-consumer>
        <!-- 3 -->
      </mi-context-consumer>
    </div>
    <div>
      <!-- connects to outer context provider and subscribes to changes -->
      <mi-context-consumer context="outer" subscribe>
        <!-- 0 -->
      </mi-context-consumer>
    </div>
  </mi-context-provider>
</mi-context-provider>
```
