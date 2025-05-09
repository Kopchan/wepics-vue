export const countUnits = ["", "K", "M", "B", "T", "Q"]

export function humanCount(number) {
  const pow = Math.min(
    Math.floor((number > 0 ? Math.log(number) : 0) / Math.log(1000)),
    countUnits.length - 1
  )

  const value = number / Math.pow(1000, pow)

  let formatted
  if (value % 1 === 0) {
    formatted = value.toFixed(0)
  } else {
    const precision = 3 - Math.floor(Math.log10(value) + 1)
    formatted = value.toFixed(Math.max(0, precision))
  }

  return `${formatted}${countUnits[pow]}`
}

export const numberWithSpaces = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

export default humanCount