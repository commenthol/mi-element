import { define, MiElement, refsById } from '../dist/index.js'
import './todo-input.js'
import './todo-item.js'

const LIST = 'list'
const store = (list) => localStorage.setItem(LIST, JSON.stringify(list))
const retrieve = () => {
  const list = localStorage.getItem(LIST)
  return list ? JSON.parse(list) : undefined
}

class TodoApp extends MiElement {
  static shadowRootOptions = null

  static template = `
  <button id="clear">Clear completed</button>
  <button id="store">Clear storage</button>
  <section>
    <todo-input id="input"></todo-input>
    <ul id="list-container"></ul>
  </section>
  `

  constructor() {
    super()
    this._list = retrieve()
    if (!this._list) {
      this._list = [
        { text: 'my initial todo', checked: false },
        { text: 'Learn about Web Components', checked: true }
      ]
      for (let i = 0; i < 20; i++) {
        this._list.push({
          text: i + ' Learn about Web Components',
          checked: true
        })
      }
    }
  }

  render() {
    this.refs = refsById(this.renderRoot)
    this.refs.input.addEventListener('onSubmit', this.addItem)
    this.refs.clear.addEventListener('click', () => {
      this._list = this._list.filter((item) => !item.checked)
      store(this._list)
      this.requestUpdate()
    })
    this.refs.store.addEventListener('click', () => {
      localStorage.clear(LIST)
      location.reload()
    })
  }

  update() {
    if (!this.refs.listContainer) return
    // empty the list
    this.refs.listContainer.innerHTML = ''
    this._list.forEach((item, index) => {
      let $item = document.createElement('todo-item')
      $item.setAttribute('text', item.text)
      $item.checked = item.checked
      $item.index = index
      $item.addEventListener('onRemove', this.removeItem)
      $item.addEventListener('onToggle', this.toggleItem)
      this.refs.listContainer.appendChild($item)
    })
  }

  addItem = (ev) => {
    this._list = [...this._list, { text: ev.detail, checked: false }]
    store(this._list)
    // only re-render list when new item is added render changes are handled in
    // the todo-item component we just propagate to reflect list changes
    this.requestUpdate()
  }

  removeItem = (ev) => {
    this._list.splice(ev.detail, 1)
    store(this._list)
    this.requestUpdate()
  }

  toggleItem = (ev) => {
    const item = this._list[ev.detail]
    this._list[ev.detail] = { ...item, checked: !item.checked }
    store(this._list)
  }
}

define('todo-app', TodoApp)
