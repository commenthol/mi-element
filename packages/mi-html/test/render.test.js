import { describe, it, expect } from 'vitest'
import { render, html } from '../src/index.js'
import { createSignal } from 'mi-signal'

const body = document.body

describe('html', () => {
  it('shall render text', () => {
    render(body, html`test`)
    expect(body.textContent).toBe('test')
  })

  it('shall render string', () => {
    render(body, html`this is a ${'test'}`)
    expect(body.innerHTML).toBe('<!--<>-->this is a test<!--</>-->')
  })

  it('shall render boolean', () => {
    render(body, html`this is ${true}`)
    expect(body.innerHTML).toBe('<!--<>-->this is true<!--</>-->')
  })

  it('shall render number', () => {
    render(body, html`this is ${1}`)
    expect(body.innerHTML).toBe('<!--<>-->this is 1<!--</>-->')
  })

  it('shall render nested templates', () => {
    render(body, html`map ${[1, 2, 3].map((i) => html`${i},`)}`)
    expect(body.textContent).toBe('map 1,2,3,')
  })

  it('shall pass attributes and properties and add event listeners', () => {
    let clicked = false
    render(
      body,
      () =>
        html`<div
          test="${42}"
          onclick=${() => {
            clicked = true
          }}
          .disabled=${true}
          .contentEditable=${false}
          null=${null}
        />`
    )
    let div = body.querySelector('div')
    div.dispatchEvent(new Event('click'))
    expect(clicked).toBe(true)
    expect(div.getAttribute('test')).toBe('42')
    expect(div.disabled).toBe(true)
    expect(div.contentEditable).toBe('false')
    expect(div.getAttribute(null)).toBe(null)
  })

  it('shall render object as attributes', () => {
    render(
      body,
      () => html`<div aria=${{ role: 'button', labelledBy: 'id' }} />`
    )
    expect(body.innerHTML).toBe(
      '<div role="button" aria-labelledby="id"></div>'
    )
  })

  it('shall increment counter using signal and effect', async () => {
    const count = createSignal(0)
    render(
      body,
      () => html`<div @click=${() => (count.value += 1)}>${count.value}</div>`
    )
    let div = body.querySelector('div')
    expect(div.textContent).toBe('0')
    div.dispatchEvent(new Event('click'))
    expect(div.textContent).toBe('1')
    div.dispatchEvent(new Event('click'))
    expect(div.textContent).toBe('2')
  })

  it('shall return ref', () => {
    let ref = {}
    render(body, html`<div ref=${ref}></div>`)
    ref.current.textContent = 'Hi'
    expect(body.querySelector('div').textContent).toBe('Hi')
  })
})
