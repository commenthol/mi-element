import { Store, Signal } from '../../dist/index.js'

const tty = document.querySelector('#tty')
const consolelog = (...args) => {
  const node = document.createTextNode(args.join(' ') + '\n')
  tty.appendChild(node)
}

const actions = {
  increment:
    (by = 1) =>
    (state) =>
      state + by
}
const initialValue = 1
const store = new Store(actions, initialValue)

// create effect, which is executed immediately
const unsubscribe = Signal.effect(() => consolelog(`count is ${store.get()}`))
//> count is 1

// change the store
store.increment(2) // increment by 2
//> count is 3

unsubscribe()

store.increment(2)
// no output as we have unsubscribed the effect
