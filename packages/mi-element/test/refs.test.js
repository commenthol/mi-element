import { expect, describe, it } from 'vitest'
import { refsById, refsBySelector } from '../src/refs.js'

describe('refs', function () {
  it('shall get refs by id', () => {
    const container = document.createElement('div')
    container.innerHTML = `
    <button id>Click Me</button>
    <p>click count is <span id="count"></span></p>
    `
    expect(refsById(container)).toStrictEqual({
      button: container.querySelector('button'),
      count: container.querySelector('p > span')
    })
  })

  it('shall get refs by selector', () => {
    const container = document.createElement('div')
    container.innerHTML = `
    <button id="button">Click Me</button>
    <p>click count is <span id="count"></span></p>
    `
    expect(
      refsBySelector(container, {
        button: 'button',
        count: 'p > span'
      })
    ).toStrictEqual({
      button: container.querySelector('#button'),
      count: container.querySelector('#count')
    })
  })
})
