import { camelToKebabCase } from './case.js'

/**
 * Construct className based on trueish values of map
 * @param {{[name: string]: string | boolean | number}} map
 * @returns {string}
 */
export const classMap = (map) => {
  /** @type {string[]} */
  const acc = []
  for (const [name, value] of Object.entries(map ?? {})) {
    if (value) acc.push(name)
  }
  return acc.join(' ')
}

/**
 * Construct style from camelCased map.
 * @param {{[name: string]: string | number | undefined | null}} map
 * @param {object} [options]
 * @param {string} [options.unit] cssUnit for number values; default='px'
 * @returns {string}
 */
export const styleMap = (map, options) => {
  const { unit = 'px' } = options || {}
  const acc = []
  for (const [name, value] of Object.entries(map ?? {})) {
    if (value === null || value === undefined) continue
    const _unit = Number.isFinite(value) ? unit : ''
    acc.push(`${camelToKebabCase(name)}:${value}${_unit}`)
  }
  return acc.join(';')
}
