# Store

Store implements [Flux](https://www.npmjs.com/package/flux) pattern, which is a
observer triggered by action (dispatchers).

1. Define actions which allow changing the store value.  
   The actions must be a function with the shape:

   ```js
   const actions = {
     [actionName]: (change) => (state) => {
       // change state based on change e.g.
       const stateChange = { ...state, change }
       return stateChange
     }
   }
   ```

2. Create store and add export to component.  
   Component imports store and connects to it by subscribing with a callback
   function to receive any state changes:
   ```js
   const callback = (state) => {
     // update compoenent with new state
   }
   ```

Sample:

```js
import { Store } from 'mi-element'

const actions = {
  increment:
    (by = 1) =>
    (state) =>
      state + by
}
const initialValue = 1
const store = new Store(actions, initialValue)

// subscribe with a callback function
const callback = (value) => console.log(`count is ${value}`)
const unsubscribe = store.subscribe(callback)

// change the store
store.increment(2) // increment by 2
//> count is now 3

unsubscribe()
```

if `initialValue` is an object, the object's reference must be changed
using the spread operator, in order to notify on state changes, e.g.

```js
const initialValue = { count: 0, other: 'foo' }
const actions = {
  increment:
    (by = 1) =>
    (state) => ({ ...state, count: state.count + by })
}
```

## subscribeToStore()

Helper function for use with MiElement to handle subscriptions and
unsubscriptions with the components lifecycle.

```js
/**
 * @file ./counter-store.js
 */
// define store with initial value and actions
export const counterStore = new Store(
  {
    increment: (by) => (state) => state + by,
    decrement: (by) => (state) => state - by
  },
  0
)
```

```js
import { subscribeToStore, MiElement, refsById } from 'mi-element'
import { counterStore } from './counter-store.js'

class Counter extends MiElement {
  static template = `
  <button id>Click</button>
  <p>Store count is <span id>0</span></p>
  `

  static get attributes() {
    // define reactive attributes
    return { count: 0 }
  }

  constructor() {
    // bind to `this['count']`
    subscibeToStore(this, counterStore, 'count')
  }

  render() {
    this.refs = refsById(this.renderRoot)
    this.refs.button.addEventListener('click', () => {
      // call store action
      store.increment()
    })
  }

  update() {
    this.refs.span.textContent = this.count
  }
}
```
