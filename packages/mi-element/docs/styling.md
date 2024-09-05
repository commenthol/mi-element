**Table of contents**

<!-- !toc (minlevel=2) -->

* [classMap](#classmap)
* [styleMap](#stylemap)

<!-- toc! -->

# Styling

## classMap

Obtain a class string from an object. Only class-names with trueish values are
returned.

```js
import { classMap } from 'mi-element'

const className = classMap({ enabled: true, hidden: '', number: 1 })
//> className == 'enabled number'
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
