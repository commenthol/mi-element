# Store

Store implements [Flux](https://www.npmjs.com/package/flux) pattern, which is a
signal triggered by an action (dispatchers).

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

// create effect, which is executed immediately
const unsubscribe = Signal.effect(() => console.log(`count is ${store.get()}`))
//> count is 1

// change the store
store.increment(2) // increment by 2
//> count is 3

unsubscribe()
```

If `initialValue` is an object, the object's reference must be changed
with the spread operator to notify on state changes, e.g.

**Example**

```js
const initialValue = { count: 0, other: 'foo' }
const actions = {
  increment:
    (by = 1) =>
    (state) => ({ ...state, count: state.count + by })
}
const store = new Store(actions, initialValue)
```
