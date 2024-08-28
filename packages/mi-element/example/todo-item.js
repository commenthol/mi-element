import { define, MiElement, refsBySelector } from '../dist/index.js'

class TodoItem extends MiElement {
  static shadowRootOptions = null

  static template = `
  <li class="item">
    <input type="checkbox">
    <label></label>
    <button class="destroy">x</button>
  </li>
  `

  static get attributes() {
    return { checked: false, text: '', index: 0 }
  }

  render() {
    const refs = (this.refs = refsBySelector(this.renderRoot, {
      item: '.item',
      removeButton: '.destroy',
      text: 'label',
      checkbox: 'input'
    }))
    refs.removeButton.addEventListener('click', (ev) => {
      ev.preventDefault()
      this.dispatchEvent(new CustomEvent('onRemove', { detail: this.index }))
      this.remove()
    })
    refs.checkbox.addEventListener('click', (ev) => {
      ev.preventDefault()
      this.dispatchEvent(new CustomEvent('onToggle', { detail: this.index }))
      this.checked = !this.checked
    })
  }

  update() {
    const { refs } = this
    if (!refs.item) return
    refs.text.textContent = this.text
    console.log(this.checked, this.text)
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
