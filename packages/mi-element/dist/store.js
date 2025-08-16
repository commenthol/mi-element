import { State } from 'mi-signal';

class Store extends State {
  constructor(actions, initialValue, options) {
    super(initialValue, options);
    for (const [action, dispatcher] of Object.entries(actions)) this[action] = data => this.set(dispatcher(data)(this.get()));
  }
}

export { Store };
