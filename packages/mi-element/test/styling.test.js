import { describe, it, expect } from 'vitest'
import { classMap, styleMap } from '../src/styling.js'

describe('directives', () => {
  describe('classMap', () => {
    it('shall compose class', () => {
      const actual = classMap({
        button: true,
        'btn-primary': '',
        'btn-secondary': 'ok'
      })
      const expected = 'button btn-secondary'
      expect(actual).toEqual(expected)
    })

    it('')
  })

  describe('styleMap', () => {
    it('shall compose class', () => {
      const actual = styleMap({
        backgroundColor: 'rgba(0,0,0,0.5)',
        minWidth: 16
      })
      const expected = 'background-color:rgba(0,0,0,0.5);min-width:16px'
      expect(actual).toEqual(expected)
    })
  })
})
