import { define, MiElement, esc as html } from 'mi-element'
import { IntlConsumer } from '../src/index.js'

define(
  'mi-loading',
  class extends MiElement {
    static template = html`
      <style>
        :host {
          display: block;
        }
      </style>
      <slot name="loading" hidden></slot>
      <slot></slot>
    `

    render() {
      this.context = new IntlConsumer(this)
      this.refs = this.renderRoot.querySelectorAll('slot')
    }

    _loading(isLoading) {
      this.refs[0].hidden = !isLoading
      this.refs[1].hidden = isLoading
    }

    update() {
      this.refs[0].textContent = this.context.value.t('loading')
      this._loading(this.context.value.loading)
    }
  }
)
