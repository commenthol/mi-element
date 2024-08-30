/**
 * convert lowerCamelCase to kebab-case
 * @param {string} str
 * @returns {string}
 */
export const camelToKebabCase = (str = '') =>
  str.replace(/([A-Z])/g, (_, m) => `-${m.toLowerCase()}`)

/**
 * convert kebab-case to lowerCamelCase
 * @param {string} str
 * @returns {string}
 */
export const kebabToCamelCase = (str = '') =>
  str.toLowerCase().replace(/[-_]\w/g, (m) => m[1].toUpperCase())
