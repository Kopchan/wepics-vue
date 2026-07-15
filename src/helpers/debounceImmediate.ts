export const debounceImmediate = <Args extends unknown[]>(
  func: (...args: Args) => void,
  ms: number,
) => {
  let timeout: ReturnType<typeof setTimeout>
  let isAsked = false
  let isDoubleAsked = false

  const createTimeout = (...args: Args) => {
    timeout = setTimeout(() => {
      isAsked = false
      if (isDoubleAsked) {
        func(...args)
        isDoubleAsked = false
      }
    }, ms)
  }

  return (...args: Args) => {
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
