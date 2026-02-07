**Table of contents**

<!-- !toc (minlevel=2) -->

- [html Tagged Template Literal](#html-tagged-template-literal)
  - [Basic Usage](#basic-usage)
  - [Working with Arrays](#working-with-arrays)
  - [Nested Templates](#nested-templates)
  - [Unsafe HTML](#unsafe-html)
- [render() Function](#render-function)
  - [Signature](#signature)
  - [Basic Example](#basic-example)
- [Special Attributes](#special-attributes)
  - [Boolean Attributes (`?attr`)](#boolean-attributes-attr)
  - [Property Binding (`.prop`)](#property-binding-prop)
  - [Event Listeners (`@event`)](#event-listeners-event)
  - [Element References (`ref`)](#element-references-ref)
  - [Spread Properties (`...`)](#spread-properties-)
- [Complete Example](#complete-example)
- [Security](#security)
- [Best Practices](#best-practices)
- [Custom Elements](#custom-elements)

<!-- toc! -->

# HTML Templating and Rendering

MiElement offers a lightweight templating system for properly escaping HTML to
prevent XSS attacks. The `html` tagged template literal combined with the
`render()` function provides a safe and convenient way to create dynamic HTML
with event handlers, property bindings, and element references.

## html Tagged Template Literal

The `html` function is a tagged template literal that automatically escapes all
interpolated values to prevent XSS attacks.

### Basic Usage

```js
import { html } from '@mi-element/mi-element'

// Simple text escaping
const userInput = '<script>alert("xss")</script>'
const safe = html`<div>${userInput}</div>`
// Result: <div>&lt;script&gt;alert("xss")&lt;/script&gt;</div>
```

### Working with Arrays

Arrays are automatically joined and each item is escaped:

```js
const items = ['Apple', 'Banana', 'Cherry']
const list = html`<ul>
  ${items.map((item) => html`<li>${item}</li>`)}
</ul>`
```

### Nested Templates

HTML templates can be nested safely without double-escaping:

```js
const header = html`<h1>${'<Title>'}</h1>`
const page = html`
  <div>
    ${header}
    <p>${'<content>'}</p>
  </div>
`
// The header content remains escaped, not double-escaped
```

### Unsafe HTML

When you need to render raw HTML (use with caution):

```js
import { unsafeHtml } from '@mi-element/mi-element'

const trustedHtml = '<strong>Bold</strong>'
const template = html`<div>${unsafeHtml(trustedHtml)}</div>`
// Result: <div><strong>Bold</strong></div>
```

## render() Function

The `render()` function takes an HTML template and renders it into a DOM node,
with support for special attributes for event handling, property binding, and
element references.

### Signature

```js
render(node, template, (handlers = {}))
```

- `node`: Target DOM element to render into
- `template`: HTML template string (typically from `html` tagged template)
- `handlers`: Optional object containing event handler functions or HTMLElement
  for method lookup
- **Returns**: Object with collected element references

### Basic Example

```js
import { html, render } from '@mi-element/mi-element'

const container = document.querySelector('#app')
const template = html`
  <div>
    <h1>Hello World</h1>
    <p>Welcome to MiElement</p>
  </div>
`

render(container, template)
```

## Special Attributes

Special attributes provide powerful features for dynamic behavior. All special
attributes are removed from the DOM after processing.

### Boolean Attributes (`?attr`)

Use the `?` prefix for boolean attributes:

```js
const isDisabled = true
const template = html`
  <input ?disabled=${isDisabled} />
  <button ?hidden=${false}>Click</button>
`

render(container, template)
// Result: <input disabled=""> <button>Click</button>
```

### Property Binding (`.prop`)

Use the `.` prefix to set properties directly on DOM elements (not attributes):

```js
const inputValue = 'Hello'
const userData = { name: 'John', age: 30 }

const template = html`
  <input .value=${inputValue} />
  <my-component .data=${userData}></my-component>
`

render(container, template)
// The input.value property is set, but not visible as an attribute
```

**Note**: Use kebab-case for property names - they will be automatically
converted to camelCase:

```js
html`<div .some-property=${'value'}></div>`
// Sets element.someProperty = 'value'
```

### Event Listeners (`@event`)

Use the `@` prefix for event listeners:

#### Inline Functions

```js
const template = html`
  <button @click=${(e) => console.log('Clicked!', e)}>Click Me</button>
`

render(container, template)
```

#### Named Handlers

```js
const handlers = {
  handleClick(e) {
    console.log('Button clicked:', e.target)
  },
  handleInput(e) {
    console.log('Input value:', e.target.value)
  }
}

const template = html`
  <button @click="handleClick">Click</button>
  <input @input="handleInput" />
`

render(container, template, handlers)
```

#### Using HTMLElement Methods

```js
class MyComponent extends HTMLElement {
  handleClick(e) {
    console.log('Clicked in component')
  }

  connectedCallback() {
    const template = html` <button @click="handleClick">Click</button> `
    render(this, template, this)
  }
}
```

### Element References (`ref`)

Collect references to rendered elements:

```js
const template = html`
  <div>
    <input ref="nameInput" type="text" />
    <button ref="submitBtn">Submit</button>
  </div>
`

const refs = render(container, template)
// refs.nameInput -> the input element
// refs.submitBtn -> the button element

refs.nameInput.focus()
refs.submitBtn.addEventListener('click', () => {
  console.log(refs.nameInput.value)
})
```

### Spread Properties (`...`)

Spread multiple properties from an object:

```js
const inputProps = {
  value: 'Default text',
  disabled: true,
  placeholder: 'Enter text'
}

const template = html`<input ...=${inputProps} />`

render(container, template)
// Sets all properties: value, disabled, and placeholder
```

## Complete Example

```js
import { html, render, MiElement, define } from '@mi-element/mi-element'
import { MiElement } from '@mi-element/mi-element'

class TodoList extends MiElement {
  todos = [
    { id: 1, text: 'Learn MiElement', done: false },
    { id: 2, text: 'Build something', done: false }
  ]

  toggleTodo(id) {
    const todo = this.todos.find((t) => t.id === id)
    if (todo) todo.done = !todo.done
    this.requestUpdate()
  }

  // first time render
  render() {
    const template = html`
      <div>
        <h2>My Todos</h2>
        <ul ref="list"></ul>
      </div>
    `
    this.refs = render(this.renderRoot, template)
  }

  // any updates
  update() {
    const template = this.todos.map(
      (todo) => html`
        <li>
          <input
            type="checkbox"
            ?checked=${todo.done}
            @change=${() => this.toggleTodo(todo.id)}
          />
          <span>${todo.text}</span>
        </li>
      `
    )
    // clear all children first
    this.refs.list.innerHTML = ''
    // then rerender
    render(this.refs.list, template)
  }
}

define('todo-list', TodoList)
```

## Security

The `html` tagged template automatically escapes all values to prevent XSS
attacks:

- Strings are HTML-escaped
- Objects and functions are stored in a temporary cache and referenced by key
- Only use `unsafeHtml()` when you have trusted HTML content

```js
// Safe - user input is escaped
const userInput = '<script>alert("xss")</script>'
html`<div>${userInput}</div>`
// Result: <div>&lt;script&gt;alert("xss")&lt;/script&gt</div>;

// Unsafe - only use with trusted content
const trustedHtml = '<strong>Safe HTML</strong>'
html`<div>${unsafeHtml(trustedHtml)}</div>`
```

## Best Practices

1. **Always use `html` for dynamic content** to ensure proper escaping
2. **Use kebab-case** for all attribute and event names
3. **Collect refs** instead of using `querySelector` when possible
4. **Avoid `unsafeHtml`** unless absolutely necessary with trusted content
5. **Use property binding** (`.prop`) for complex data structures
6. **Leverage event delegation** for dynamic lists with many items
7. **Keep handlers object** or use class methods for better organization

## Custom Elements

The render system automatically skips processing children of custom elements,
allowing them to manage their own content:

```js
class MyElement extends HTMLElement {
  connectedCallback() {
    // This element controls its own rendering
    this.innerHTML = `<input ref="inside" />`
  }
}

customElements.define('my-element', MyElement)

// The render function will process my-element's attributes
// but won't process its children
const template = html`
  <my-element .data=${{ test: true }} ref="custom"></my-element>
`
```
