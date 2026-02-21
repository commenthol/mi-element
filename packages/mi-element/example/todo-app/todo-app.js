import { define, MiElement, html, render } from '../../src/index.js'
import './todo-input.js'
import './todo-item.js'

const LIST = 'list'
const store = (list) => localStorage.setItem(LIST, JSON.stringify(list))
const retrieve = () => {
  const list = localStorage.getItem(LIST)
  return list ? JSON.parse(list) : undefined
}

class TodoApp extends MiElement {
  static shadowRootInit = null

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
    this.refs = render(this.renderRoot, html`
      <button @click=${() => {
        this._list = this._list.filter((item) => !item.checked)
        store(this._list)
        this.requestUpdate()
      }}>Clear completed</button>
      <span> </span>
      <button @click=${() => {
        localStorage.clear(LIST)
        location.reload()
      }}>Clear storage</button>
      <section>
        <todo-input @todo-submit=${(ev) => this.addItem(ev)}></todo-input>
        <ul ref="listContainer"></ul>
      </section>`
    )
  }

  update() {
    const { listContainer } = this.refs
    if (!listContainer) return
    // 1. always build up template first
    let template = ''
    this._list.forEach((item, index) => {
      template += html`<todo-item
        .text=${item.text} ?checked=${item.checked} .index=${index}
        @on-remove=${this.removeItem}
        @on-toggle=${this.toggleItem}>
        </todo-item>`
    })
    // 2. then render it in one go to avoid multiple re-rendering of the list container
    render(listContainer, template)
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
