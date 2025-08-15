import { define, MiElement, addGlobalStyles } from '../../dist/index.js'

define(
  'with-globalstyle',
  class extends MiElement {
    static template = `<h1>With global styles</h1>`

    render() {
      addGlobalStyles(this.renderRoot)
    }
  }
)
