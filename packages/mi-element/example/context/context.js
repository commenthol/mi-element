import { define, MiElement, ContextProvider, ContextConsumer } from '../../src/index.js'

define(
  'mi-context-provider',
  class extends MiElement {
    static get properties() {
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

define(
  'mi-context-consumer',
  class extends MiElement {
    static get properties() {
      return {
        context: {},
      }
    }

    static template = `
    <button id>Increment</button>
    <span>0</span>`

    constructor() {
      super()
      // define the context and set initial value
      // default context shall be unique amongst other context providers 
      // must match the context-providers context!
      this.context = 'my-context-provider'
    }

    render() {
      this.consumer = new ContextConsumer(this, this.context, {
        // define here if subscription to any change shall take place!
        subscribe: true,
      })
      this.refs = this.refsBySelector({
        button: 'button',
        span: 'span'
      })  
      this.refs.button.addEventListener('click', () => {
        this.consumer.value.increment()
      })
    }

    update() {
      this.refs.span.textContent = this.consumer.value?.value || 0
    }
  }
)
