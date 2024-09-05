# Store

Store implements [Flux](https://www.npmjs.com/package/flux) pattern, which is a
signal triggered by action (dispatchers).

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
     // update component with new state
   }
   ```

Sample:

```js
import { Store, Signal } from 'mi-element'

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
const unsubscribe = Signal.effect(() => console.log(`count is ${store.get()}`))

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
