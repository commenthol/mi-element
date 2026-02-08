[![npm-badge][npm-badge]][npm]
![types-badge][types-badge]

# mi-intl

> Formats strings using [ICU Message Syntax][icu-syntax] for [mi-element][].

**Table of contents**

<!-- !toc (minlevel=2) -->

- [Usage](#usage)

<!-- toc! -->

## Usage

In your project:

```
npm i mi-intl mi-element
```

/app.js

```js
import { define, MiElement } from 'mi-element'
import { MiIntlProvider, MiIntlMessage, IntlConsumer } from 'mi-intl'

// define tag for intl-provider
define('mi-intl-provider', MiIntlProvider)
define('mi-message', MiIntlMessage)

// define lang selector
define(
  'mi-language-selector',
  class extends MiElement {
    #context

    static template = `<slot></slot>`

    render() {
      // connect to intl-provider
      this.#context = new IntlConsumer(this)
      this.ref = this.renderRoot.querySelector('select')
      this.ref.addEventListener('change', (ev) => {
        this.#context.get().changeLanguage(ev.target.value).catch(console.error)
      })
      this.update()
    }

    update() {
      this.ref.value = this.#context.get().lng
    }
  }
)
```

/index.html

```html
<html>
  <body>
    <mi-intl-provider
      version="1.0.0"
      supported-lngs="en,en-US,es"
      locales-path="/locales/{lng}/{ns}.json?version={version}"
    >
      <mi-language-selector>
        <select>
          <option value="en">🇬🇧</option>
          <option value="en-US">🇺🇸</option>
          <option value="es">🇪🇸</option>
        </select>
      </mi-language-selector>
      <mi-message label="Hello {value}!" value="world">
      <mi-message label="lift">
    </mi-intl-provider>
    <script type="module" src="/app.js"></script>
  </body>
</html>
```

/locales/en/translations.json

```json
{
  "lift": "lift",
  "Hello {value}!": "Hello {value}!"
}
```

/locales/en-US/translations.json

```json
{
  "lift": "elevator",
  "Hello {value}!": "Hello {value}!"
}
```

/locales/es/translations.json

```json
{
  "lift": "ascensor",
  "Hello {value}!": "¡Hola {value}!"
}
```

Check folder ./example for a more advanced example.  
Run with `npm run example`

# License

MIT licensed

[icu-syntax]: https://formatjs.github.io/docs/core-concepts/icu-syntax
[mi-element]: https://github.com/commenthol/mi-element/tree/main/packages/mi-element
[npm-badge]: https://badgen.net/npm/v/mi-intl
[npm]: https://www.npmjs.com/package/mi-intl
[types-badge]: https://badgen.net/npm/types/mi-intl
