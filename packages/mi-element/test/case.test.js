import { describe, it, expect } from 'vitest'
import { camelToKebabCase, kebabToCamelCase } from '../src/case.js'

describe('case', () => {
  describe('kebabToCamelCase', () => {
    it('should not fail when undefined', () => {
      expect(camelToKebabCase()).toEqual('')
    })

    it('should convert lowerCamelCase to kamel case', () => {
      expect(camelToKebabCase('lowerCamelCase')).toEqual('lower-camel-case')
    })
  })

  describe('kebabToCamelCase', () => {
    it('should not fail when undefined', () => {
      expect(kebabToCamelCase()).toEqual('')
    })

    it('should convert from kebab case', () => {
      expect(kebabToCamelCase('lower-camel-case')).toEqual('lowerCamelCase')
    })

    it('should convert from falsy kebab case', () => {
      expect(kebabToCamelCase('lower-CaMel-case')).toEqual('lowerCamelCase')
    })
  })
})
