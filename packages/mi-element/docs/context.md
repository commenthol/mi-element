# Context

Implements the [Context Protocol][].

[Context Protocol]: https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md

## ContextProvider

```js
import {
  define,
  MiElement
  ContextProvider,
  ContextConsumer,
} from 'mi-element'

define(
  'mi-context-provider',
  class extends MiElement {
    static get attributes() {
      return {
        // define the context
        context: 'counter',
        value: 0
      }
    }

    render() {
      this.value = this.initialValue
      this.renderRoot.innerHTML = '<slot></slot>'
      this.provider = new ContextProvider(
        this, this.context, this._providerValue())
    }

    update() {
      // updates signal and notifies all subscribers
      this.provider.value = this._providerValue()
    }

    increment() {
      // value is observed value, requestUpdate() is called on any change
      this.value++
    }

    _providerValue() {
      // create a new object on every change and add all shared values and methods
      return {
        value: this.value, increment: this.increment }
    }
  }
)
```

Works also with HTMLElement. In this case you must provide the necessary wiring.

```js
customeElement.define('html-context-provider', extends class HTMLElement {
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
    static get attributes() {
      return {
        // define the context
        context: 'counter',
        subscribe: true
      }
    }

    static template = `
    <button id>Increment</button>
    <span id>0</span>`

    render() {
      this.consumer = new ContextConsumer(this, this.context, {
        subscribe: !!this.subscribe
      })
      this.refs = refsById(this.renderRoot)
      this.refs.button.addEventListener('click', () => {
        this.consumer.value.increment()
      })
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
      <!-- does not subscribe to any changes (works only with MiElement)-->
      <mi-context-consumer subscribe="false">
        <!-- 3 -->
      </mi-context-consumer>
    </div>
    <div>
      <!-- connects to outer context provider -->
      <mi-context-consumer context="outer">
        <!-- 0 -->
      </mi-context-consumer>
    </div>
  </mi-context-provider>
</mi-context-provider>
```
