import { define, MiElement, html } from '../../src/index.js'

class TodoInput extends MiElement {
  static shadowRootInit = null

  static template = html`
  <form id="new-todo-form">
    <input id="new-todo" type="text" placeholder="What needs to be done?">
  </form>
  `

  render() {
    const refs = this.refsBySelector({
      form: '#new-todo-form',
      input: '#new-todo'
    })
    refs.form.addEventListener('submit', (ev) => {
      ev.preventDefault()
      if (!refs.input.value) return
      this.dispatchEvent(
        new CustomEvent('todo-submit', { detail: refs.input.value })
      )
      refs.input.value = ''
    })
  }
}

define('todo-input', TodoInput)
