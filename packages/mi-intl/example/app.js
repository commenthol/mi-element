import './intl.js'
import './message.js'
import './lang-select.js'
import './loading.js'
import { escHtml } from 'mi-element'

// create lot more elements to test lang switching
const max = 1e3

const msg = document.getElementById('msg')
for (let i = 0; i < max; i++) {
  const el = document.createElement('mi-message')
  el.label = 'persons'
  el.html = true // render as "unsafe" html
  el.value = { value: escHtml(i) } // always HTML escape the input values, because of potential XSS
  msg.appendChild(el)
  msg.appendChild(document.createElement('br'))
}
