export const withResolvers = () => {
  let resolve, reject
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })
  return {
    resolve,
    reject,
    promise
  }
}

if (typeof Promise.withResolvers !== 'function') {
  Promise.withResolvers = withResolvers
}

export const nap = (ms = 25) =>
  new Promise((resolve) => setTimeout(() => resolve(ms), ms))
