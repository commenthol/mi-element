**Table of contents**

<!-- !toc (minlevel=2) -->

* [State, createSignal](#state-createsignal)
* [effect](#effect)
  * [DONT'S](#donts)
* [Computed Signals](#computed-signals)
* [Signals in MiElement](#signals-in-mielement)

<!-- toc! -->

# Signal

Signal is the core for any reactive behavior of mi-element.
It loosely follows the [TC39 JavaScript Signals standard proposal][].

## State, createSignal

Reactive state and its subscribers is managed in this class. With
`.set(nextValue)` and `.get()` access to the state is achieved.

For convenience there is a `createSignal(initialValue<T>): State<T>` function to
create a signal.

```js
import { Signal } from 'mi-element'

const signal = Signal.createSignal(1)
// same as
const signal = new Signal.State(1)

signal.get()
//> 1
signal.set(4)
signal.get()
//> 4
```

For controlling the notifications to subscribers, the signal option `equals` for
a custom comparison function can be used, e.g. to trigger an effect on every
`.set(nextValue)`

```js
// default is:
const equals = (value, nextValue) => value === nextValue
// changes to trigger change on every `.set()`
const equals = (value, nextValue) => true
const signal = Signal.createSignal(initialValue, { equals })
```

## effect

Reactivity is achieved by subscribing to a signals State using an effect
callback function. Such callback function is called for registration to the
signals state as well as to update on any change through
`signal.set(nextValue)`. Within that callback the `signal.get()` must be called
_synchronously_! 

```js
import { Signal } from 'mi-element'

const signal = Signal.createSignal(1)

const callback = () => console.log('value is %s', signal.get())
// `callback` is executed with assigning to the effect!
const unsubscribe = Signal.effect(callback)
//> "value is 1"
signal.set(4)
//> "value is 4"

// Signal.effect returns a function to unsubscribe `callback` from the signal
unsubscribe()
signal.set(5)
// gives no console.log output
```

For asynchronous usage, request the value from the signal first. Otherwise no
subscription to the signal will take place.

```js
const signal = Signal.createSignal(1)

const callback = async () => {
  // synchronously get the value
  const value = signal.get()
  const p = Promise.withResolvers()
  setTimeout(() => {
    console.log('value is %s', )
    p.resolve()
  }, 100)
}.catch(() => {})
// callback is executed with assigning to the effect!
Signal.effect(callback)
```

### DONT'S

Effects are executed synchronously for a better debugging experience. But be
warned to never set the signal in the an effects callback!

```js
const signal = createSignal(0)

// DON'T DO THIS
Signal.effect(() => {
  const value = signal.get()
  signal.set(value++) //< meeeeh
})
```

The signal value getter triggers the registration of the callback through the
effect. So don't hide a signals getter inside conditionals!

```js
const signal = createSignal(0)
const rand = Math.random()

// DON'T DO THIS
Signal.effect(() => {
  if (rand < 0.5) {
    console.log(signal.get()) //< meeeeh
  }
})

// DO THIS
Signal.effect(() => {
  const value = signal.get() //< much better
  if (rand < 0.5) {
    console.log(value) 
  }
})
```

## Computed Signals

Computed signals from more than one signal can be obtained from
`Signal.Computed`.

```js
const firstName = createSignal('Joe')
const lastName = createSignal('Doe')
// define computed signal
const name = new Signal.Computed(() => `${firstName.get()} ${lastName.get()}`)
const events = []
// apply effect
effect(() => console.log(name.get()))
//> 'Joe Doe'
firstName.set('Alice')
//> 'Alice Doe'
lastName.set('Wonderland')
//> 'Alice Wonderland'
```

## Signals in MiElement

MiElement attributes are backed by signals. To subscribe to reactive changes a
`Signal.effect` callback can be used on all observed attributes.

```js
import { Signal, define, MiElement, refByIds } from 'mi-element'

define(
  'mi-counter',
  class extends MiElement {
    static template = `
      <button id> + </button>
      <div id></div>
    `

    static get attributes() {
      return {
        // define reactive attribute
        count: 0
      }
    }

    render() {
      this.refs = refsById(this.renderRoot)
      this.refs.button.addEventListener('click', () => {
        // change observed and reactive attribute...
        this.count++
      })
      Signal.effect(() => {
        // ...triggers update on every change
        this.refs.div.textContent = `${this.count} clicks counted`
      })
    }
  }
)
```

[TC39 JavaScript Signals standard proposal]: https://github.com/tc39/proposal-signals
