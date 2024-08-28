import { define, MiElement, refsBySelector } from '../dist/index.js'

class TodoInput extends MiElement {
  static shadowRootOptions = null

  static template = `
  <form id="new-todo-form">
    <input id="new-todo" type="text" placeholder="What needs to be done?">
  </form>
  `

  render() {
    const refs = refsBySelector(this.renderRoot, {
      form: '#new-todo-form',
      input: '#new-todo'
    })
    refs.form.addEventListener('submit', (ev) => {
      ev.preventDefault()
      if (!refs.input.value) return
      this.dispatchEvent(
        new CustomEvent('onSubmit', { detail: refs.input.value })
      )
      refs.input.value = ''
    })
  }
}

define('todo-input', TodoInput)
