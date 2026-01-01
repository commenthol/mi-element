**Table of contents**

<!-- !toc (minlevel=2) -->

- [classNames](#classnames)
- [styleMap](#stylemap)
- [addGlobalStyles](#addglobalstyles)

<!-- toc! -->

# Styling

## classNames

Obtain a class string from an object. Only class-names with trueish values are
returned.

```js
import { classNames } from 'mi-element'

const className = classNames({ enabled: true, hidden: '', number: 1 }, 'always')
//> className == 'enabled number always'
```

## styleMap

Convert a map of styles into a styles string. CamelCased properties are
converted to kebab-case. Numbers are converted to css `px` unit. This can be
changed through its options.

```js
import { styleMap } from 'mi-element'

const styles = styleMap(
  { backgroundColor: 'blue', color: '#fff', width: 200 },
  { unit: 'px' } // optional
)
//> styles == 'background-color:blue;color:#fff;width:200px'
```

Signature

```ts
function styleMap(
  map: { [name: string]: string | number | undefined | null },
  options?: { unit?: string | undefined } | undefined
): string
```

## addGlobalStyles

Apply global style sheets to shadowRoot of a web-component.

E.g. you'd like to apply your global style sheet to

```css
h1 { color: rebeccapurple; }
```

```js
import { addGlobalStyles } from 'mi-element'

const template = document.createElement('template')
template.innerHTML = `<h1>Hello World!</h1>`

customElements.define(
  'x-hello-world',
  class extends HTMLElement {
    connectedCallback() {
      this.renderRoot = this.shadowRoot ?? this.attachShadow({ mode: 'open' })
      // apply global styles
      addGlobalStyles(this.renderRoot)
      this.renderRoot.append(template.content.cloneNode(true))
    }
  }
)

// with MiElement 
import { define, MiElement } from 'mi-element'

define('x-with-global-styles', class extends MiElement {
  static useGlobalStyles() {
    return true
  }

  static template = '<h1>Hello World</h1>'
})

```
