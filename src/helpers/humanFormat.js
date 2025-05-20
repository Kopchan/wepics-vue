

export const humanNumber = (number, units) => {
  const pow = Math.min(
    Math.floor((number > 0 ? Math.log(number) : 0) / Math.log(1000)),
    units.length - 1
  )

  const value = number / Math.pow(1000, pow)

  let formatted
  if (value % 1 === 0) {
    formatted = value.toFixed(0)
  } else {
    const precision = 3 - Math.floor(Math.log10(value) + 1)
    formatted = value.toFixed(Math.max(0, precision))
  }

  return `${formatted}${units[pow]}`
}

export const countUnits = ['', 'K', 'M', 'B', 'T', 'Q']
export const SI_Units   = [' ', ' K', ' M', ' G', ' T', ' P']

export const humanCount = (number) => humanNumber(number, countUnits)
export const humanSI    = (number) => humanNumber(number, SI_Units)


export const numberWithSpaces = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}


export const bytesUnits = [' B', ' KiB', ' MiB', ' GiB', ' TiB', ' PiB']

export const humanFileSizeLegacy = (bytes) => {
  var i = bytes == 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + bytesUnits[i]
}

export const humanFileSize = (bytes) => {
  let suffixIndex = 0
  let count = bytes

  while (count >= 1000 && suffixIndex < bytesUnits.length - 1) {
    count /= 1024
    suffixIndex++
  }

  let formatted
  if (count >= 100 || suffixIndex === 0) {
    formatted = count.toFixed(0)
  } else if (count >= 10) {
    formatted = count.toFixed(1)
  } else {
    formatted = count.toFixed(2)
  }

  return `${formatted}${bytesUnits[suffixIndex]}`
}


export const humanDate = (dateString) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}


export const humanDuration = (seconds) => {
  seconds    = Math.floor(seconds)
  const hrs  = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const pad = num => String(num).padStart(2, '0')

  return `${ hrs > 0 ? (pad(hrs) +':') : '' }${pad(mins)}:${pad(secs)}`
}