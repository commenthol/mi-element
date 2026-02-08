import './intl.js'
import './lang-select.js'
import './loading.js'

// create lot more elements to test lang switching
const max = 1e3

const msg = document.getElementById('msg')
for (let i = 0; i < max; i++) {
  const el = document.createElement('mi-message')
  el.label = 'persons'
  el.unsafeHtml = true
  el.value = { value: i }
  msg.appendChild(el)
  msg.appendChild(document.createElement('br'))
}
