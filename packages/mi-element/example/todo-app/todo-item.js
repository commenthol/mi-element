import { define, MiElement, html, render } from '../../src/index.js'

class TodoItem extends MiElement {
  static shadowRootInit = null

  static get properties() {
    return {
      checked: { type: Boolean },
      text: {},
      index: { type: Number }
    }
  }

  render() {
    const template = html`
    <li ref="item" class="item">
      <input ref="checkbox" type="checkbox" ?checked=${this.checked} @click=${(ev) => {
        ev.preventDefault()
        this.dispatchEvent(new CustomEvent('on-toggle', { detail: this.index }))
        this.checked = !this.checked
      }}>
      <label ref="text">${this.text}</label>
      <button class="destroy" @click=${(ev) => {
        ev.preventDefault()
        this.dispatchEvent(new CustomEvent('on-remove', { detail: this.index }))
        this.remove()
      }}>x</button>
    </li>`
    this.refs = render(this.renderRoot, template)
  }

  update() {
    const { refs } = this
    if (!refs.item) return
    refs.text.textContent = this.text
    if (this.checked) {
      refs.item.classList.add('completed')
      // uncontrolled checkbox change is always in its way...
      refs.checkbox.setAttribute('data-checked', '')
    } else {
      refs.item.classList.remove('completed')
      refs.checkbox.removeAttribute('data-checked')
    }
  }
}

define('todo-item', TodoItem)
