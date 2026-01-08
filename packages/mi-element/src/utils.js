/**
 * convert to number safely
 * @param {*} any
 * @returns {number} number or 0 if NaN
 */
export const toNumber = (any) => {
  const n = Number(any)
  return isNaN(n) ? 0 : n
}

/**
 * safely parse JSON
 * @param {string} any
 * @returns {any|undefined} parsed object or undefined on error
 */
export const toJson = (any) => {
  try {
    return JSON.parse(any)
  } catch {
    return
  }
}
