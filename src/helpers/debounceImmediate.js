export const debounceImmediate = (func, ms) => {
  let timeout
  let isAsked = false
  let isDoubleAsked = false

  const createTimeout = (...args) => {
    timeout = setTimeout(() => {
      isAsked = false
      if (isDoubleAsked) {
        func(...args)
        isDoubleAsked = false
      }
    }, ms)
  }

  return (...args) => {
    if (!isAsked) {
      func(...args)
      createTimeout(...args)
    }
    if (isAsked) {
      isDoubleAsked = true

      clearTimeout(timeout)
      createTimeout(...args)
    }
    isAsked = true
  }
}

export default debounceImmediate
