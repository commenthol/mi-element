[![npm-badge][npm-badge]][npm]
![types-badge][types-badge]

# mi-html

> html template literal for building reactive web components

Uses [uhtml@4][] for html literal and DOM rendering.

Needs 3.8kB minified and gzipped with all bundled dependencies.

## Usage

In your project:

```
npm i mi-html
```

Create a reactive web-component with mi-html and mi-element.

```js
import { render, html } from 'mi-html'
import { MiElement, define } from 'mi-element'

define(
  'my-counter',
  class extends MiElement {
    static get attributes() {
      return { count: 0 }
      // this.count becomes a signal on instantiation
    }
    render() {
      const template = html`<button @click=${() => this.count++}>
        Clicked ${this.count} times
      </button>`
      render(this.renderRoot, template)
    }
  }
)
```

## html`` In a nutshell

(From [uhtml@4][])

The following code is an abstract representation of all features delivered by _uhtml_ and it's explained in details preserving the same order.

You can skip to details directly via the following links:

- [render](#render) - to reveal tags content
- [tag](#tag) - to create content
- [boolean](#boolean) - to toggle attributes
- [attribute](#attribute) - to assign attributes
- [direct](#direct) - to assign properties
- [listener](#listener) - to add listeners
- [list](#list) - to grow or shrink a list of nodes
- [ref](#ref) - to keep references to DOM nodes
- [self closing](#self-closing) - to simplify life
- [hole](#hole) - to represent generic content
- [reactivity](#reactivity) - to understand reactivity

```
let el = {}
   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ render
   ┃                    ┏━━━━━━━━━━━━━━━━━━━ tag
render(document.body, html`
  <div class=${className} ?hidden=${!show}>
         ┃                    ┗━━━━━━━━━━━━━ boolean
         ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ attribute
    <ul @click=${sort} .sort=${order}>
           ┃             ┗━━━━━━━━━━━━━━━━━━ direct
           ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ listener
      ${[...listItems]}
        ┗━━━━━━┳━━━━━┛
               ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━ list
    </ul>
                 ┏━━━━━━━━━━━━━━━━━━━━━━━━━━ ref
    <my-element ref=${el} /> ━━━━━━━━━━━━━━━ self closing
    <p>
      ${show ? `${order} results` : null}
       ┗━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━┛
                      ┗━━━━━━━━━━━━━━━━━━━━━ hole
    </p>
  </div>
`);
```

### render

To reveal template literal tags within a specific element we need a helper which goal is to understand if the
content to render was already known but also, in case it's a _hole_, to orchestrate a "_smart dance_" to render such content.

The `render` exported helper is a function that, given a node _where_ to render such content, returns that very
same node with the content in the right place, content returned by the _tag_ used to render.

```js
import { render, html } from 'mi-html'

const whom = 'World'

render(document.body, () => html`Hello ${whom}!`)

/** results into
<body>
  Hello World!
<body>
 */
```

### tag

A template literal tag can be either the `html` or the `svg` one, both directly exported from this module:

```js
import { html, svg } from 'mi-html'

html`<button />`
svg`<circle />`
```

### boolean

Fully inspired by _lit_, boolean attributes are simply a **toggle** indirection to either have, or not, such attribute.

```js
import { render, html } from 'mi-html'

render(
  document.body,
  () => html`
    <div ?hidden=${false}>I am visible</div>
    <div ?hidden=${true}>I am invisible</div>
  `
)

/** results into
<body>
  <div>I am visible</div>
  <div hidden>I am invisible</div>
<body>
 */
```

### attribute

Every attribute that doesn't have a specialized syntax prefix, such as `?`, `@` or `.`, is handled in the following way and only if different from its previous value:

- if the exported `attr` _Map_ knows the attribute, a callback related to it will be used to update
  - `aria` attribute accepts and handle an object literal with `role` and other _aria_ attributes
  - `class` attribute handles a direct `element.className` assignment or remove the attribute if the value is either `null` or `undefined`
  - `data` attribute accepts and handle an object literal with `dataset` names to directly set to the node
  - `ref` attribute handles _React_ like _ref_ property by updating the `ref.current` value to the current node, or invoking `ref(element)` when it's a callback
  - `style` attribute handles a direct `element.style.cssText` assignment or remove the attribute if the value is either `null` or `undefined`
  - it is possible to augment the `attr` _Map_ with any custom attribute name that doesn't have an already known prefix and it's not part of the already known list (although one could override known attributes too). In this case, `attr.set("my-attr", (element, newValue, name, oldValue) => newValue)` is the expected signature to augment attributes in the wild, as the stack retains only the current value and it will invoke the callback only if the new value is different.
- if the attribute is unknown in the `attr` map, a `name in element` check is performed once (per template, not per element) and if that's `true`, a _direct_ assignment will be used to update the value, unless the value is either `null` or `undefined`, in which case the attribute is removed if it's _not a listener_, otherwise it drops the listener:
  - `"onclick" in element`, like any other native listener, will directly assign the callback via `element[name] = value`, when `value` is different, providing a way to simplify events handling in the wild
  - `"value" in input`, like any other understood accessor for the currently related node, will directly use `input[name] = value`, when `value` is different
  - `"hidden" in element`, as defined by standard, will also directly set `element[name] = value`, when `value` is different, somehow overlapping with the _boolean_ feature
  - any other `"accessor" in element` will simply follow the exact same rule and use the direct `element[name] = value`, when `value` is different
- in all other cases the attribute is set via `element.setAttribute(name, value)` and removed via `element.removeAttribute(name)` when `value` is either `null` or `undefined`

### direct

A direct attribute is simply passed along to the element, no matter its name or special standard behavior.

```js
import { render, html } from 'mi-html'

const state = {
  some: 'special state'
}

render(
  document.body,
  () => html`<div id="direct" .state=${state}>content</div>`
)

document.querySelector('#direct').state === state
// true
```

If the name is already a special standard accessor, this will be set with the current value, whenever it's different from the previous one, so that _direct_ syntax _could_ be also used to set `.hidden` or `.value`, for input or textarea, but that's just explicit, as these accessors would work regardless that way, without needing special syntax hints and as already explained in the _attribute_ section.

### listener

As already explained in the _attribute_ section, common listeners can be already attached via `onclick=${callback}` and everything would work already as expected, with also less moving parts behind the scene ... but what if the listener is a custom event name or it requires options such as `{ once: true }` ?

This is where `@click=${[handler, { once: true }]}` helps, so that `addEventListener`, and `removeEventListener` when the listener changes, are used instead of direct `on*=${callback}` assignment.

```js
import { render, html } from 'mi-html'

const handler = {
  handleEvent(event) {
    console.log(event.type)
  }
}

render(
  document.body,
  () => html`
    <div @custom:type="${handler}" @click=${[handler, { once: true }]}>
      content
    </div>
  `
)

const div = document.querySelector('div')

div.dispatchEvent(new Event('custom:type'))
// logs "custom:type"

div.click()
// logs "click"

div.click()
// nothing, as it was once
```

**Please note** that even if options such as `{ once: true }` are used, if the handler / listener is different each time the listener itself will be added, as for logic sake that's indeed a different listener.

### list

Most of the time, the template defines just static parts of the content and this is not likely to grow or shrink over time _but_, when that's the case or desired, it is possible to use an _array_ to delimit an area that over time could grow or shrink.

`<ul>`, `<ol>`, `<tr>` and whatnot, are all valid use cases to use a list placeholder and not some unique node, together with `<article>` and literally any other use case that might render or not multiple nodes in the very same place after updates.

```js
import { render, html } from 'mi-html'

render(
  document.querySelector('#todos'),
  () => html`
    <ul>
      ${databaseResults.map((value) => html`<li>${value}</li>`)}
    </ul>
  `
)
```

Please note that whenever a specific placeholder in the template might shrink in the future, it is always possible to still use an array to represent a single content:

```js
html`
  <div>
    ${items.length
      ? items
      : [
          html`...loading content`
          // still valid hole content
          // or a direct DOM node to render
        ]}
  </div>
`
```

**Please also note** that an _array_ is always expected to contain a _hole_ or an actual DOM Node.

### ref

Keep references to DOM nodes

```js
let ref = {}
render(document.body, () => html`<div ref=${ref}>Hey</div>`)
// access with `.current`
ref.current.textContent = 'Hi'
```

### self closing

Fully inspired by _XHTML_ first and _JSX_ after, any element that self closes won't result into surprises so that _custom-elements_ as well as any other standard node that doesn't have nodes in it works out of the box.

```js
import { render, html } from 'mi-html'

render(
  document.body,
  () => html`
    <my-element />
    <my-other-element />
  `
)

/** results into
<body>
  <my-element></my-element>
  <my-other-element></my-other-element>
<body>
 */
```

Please note this is an _optional_ feature, not a mandatory one: you don't need to self-close standard void elements such as `<br>`, `<link>` or others, but you can self-close even these if consistency in templates is what you are after.

### hole

Technically speaking, in the template literal tags world all values part of the template are called _interpolations_.

```js
const tag = (template, ...interpolations) => {
  console.log(template.join())
  // logs "this is , and this is ,"
  console.log(interpolations)
  // logs [1, 2]
}

tag`this is ${1} and this is ${2}`
```

Mostly because the name _Interpolation_ is both verbose and boring plus it doesn't really describe the value _kind_ within a DOM context, in _uhtml_ the chosen name for "_yet unknown content to be rendered_" values is _hole_.

By current TypeScript definition, a _hole_ can be either:

- a `string`, a `boolean` or a `number` to show as it is on the rendered node
- `null` or `undefined` to signal that _hole_ has currently no content whatsoever
- an actual `instanceof Hole` exported class, which is what `html` or `svg` tags return once invoked
- an _array_ that contains a list of instances of _Hole_ or DOM nodes to deal with

### reactivity

Signals are a primitive used to automatically react to changes, as opposite of remembering to deal manually with re-renders invokes which is all good but not ideal in terms of DX.

```js
import { effect, createSignal, render, html } from 'mi-html'

const count = createSignal(0)

// render in the body passing a () => html`...` callback
render(
  document.body,
  () => html`
    <button
      onclick=${() => {
        count.value++
      }}
    >
      Clicks: ${count.value}
    </button>
  `
)
```

### constraints

If signals are meant to be used within a template then the `render` function needs to have a lazy invoke of its content because otherwise signals don't get a chance to subscribe to it.

```js
// ⚠️ DOES NOT CREATE AN EFFECT
render(target, html`${signal.value}`)

// ✔ CREATE AN EFFECT 👍
render(target, () => html`${signal.value}`)
```

Please note that components that are meant to be rendered within other components, and not stand-alone, passing a non callback as second argument might be even desired so that only the outer top-most render would react to changes.

# License

MIT licensed

[uhtml@4]: https://github.com/WebReflection/uhtml/tree/v4
[mi-element]: https://github.com/commenthol/mi-element/tree/main/packages/mi-element

[npm-badge]: https://badgen.net/npm/v/mi-html
[npm]: https://www.npmjs.com/package/mi-html
[types-badge]: https://badgen.net/npm/types/mi-html
