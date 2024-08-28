# Controllers

A controller is meant to hook into the components update lifecycle and provide
an updated value to the host component.

```js
/**
 * @file './my-clock.js'
 * Defines custom element my-clock with controller
 */
import { define, MiElement } from 'mi-element'

class ClockController {
  /**
   * @param {MiElement} host
   */
  constructor(host) {
    this.host = host
    // Add controller to component.
    this.host.addController(this)
    // As soon as component is mounted `hostConnected()` is called.
  }
  /**
   * called by the hosts connectedCallback()
   */
  hostConnected() {
    this._interval() // start timer
  }
  /**
   * called by the hosts disconnectedCallback(); do cleanup herein.
   */
  hostDisconnected() {
    clearTimeout(this._timerId)
  }
  /**
   * periodically update controller value
   */
  _interval() {
    this.value = new Date()
    // on every change call requestUpdate()
    this.host.requestUpdate()

    this._timerId = setTimeout(() => {
      this._interval()
    }, 1000)
  }
}

define(
  'my-clock',
  class extends MiElement {
    constructor() {
      super()
      // create controller and pass `this` as host
      this.controller = new ClockController(this)
    }

    update() {
      // get value from controller
      const { value } = this.controller
      // apply some formatting
      const formattedDateTime = new Intl.DateTimeFormat(navigator.language, {
        dateStyle: 'short',
        timeStyle: 'long'
      }).format(value)
      // update component
      this.renderRoot.textContent = formattedDateTime
    }
  }
)
```

```html
<!-- @file ./index.html -->
<!doctype html>
<html>
  <body>
    <my-clock></my-clock>
    <script type="module" src="./my-clock.js"></script>
  </body>
</html>
```
