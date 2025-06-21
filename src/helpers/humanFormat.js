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


export const bytesUnits = [' B', ' KB', ' MB', ' GB', ' TB', ' PB']

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


export const humanDurationLegacy = (seconds) => {
  console.log(seconds)
  const ms    = Math.floor(seconds * 1000 % 1000)
  seconds     = Math.floor(seconds)
  const hrs   = Math.floor(seconds / 3600)
  const mins  = Math.floor((seconds % 3600) / 60)
  const secs  = seconds % 60

  const pad = (num, size = 2) => String(num).padStart(size, '0')

  return (hrs  > 0 ? (pad(hrs) +'h:') : '') 
       + (mins > 0 ? (pad(mins) +'m:') : '')
       + ((hrs < 1 && secs !== 0) ? (pad(secs) +'s') : '')
       + ((mins < 1 && ms !== 0) ? ('.'+ pad(ms, 3) +'ms') : '')
}


export const humanDuration = (seconds) => {
  const totalSeconds = Number(seconds)
  const ms = Math.round((totalSeconds % 1) * 1000)
  const absSeconds = Math.floor(Math.abs(totalSeconds))

  const days = Math.floor(absSeconds / 86400)
  const hours = Math.floor((absSeconds % 86400) / 3600)
  const minutes = Math.floor((absSeconds % 3600) / 60)
  const secs = absSeconds % 60

  // Форматируем части с ведущими нулями (кроме дней)
  const formatPart = (value, suffix) => {
    if (value <= 0 && suffix !== 'ms') return ''
    const paddedValue = suffix === 'd' ? value : value.toString().padStart(2, '0')
    return paddedValue + suffix
  }

  // Собираем все значимые части (без нулевых)
  const parts = [
    formatPart(days, 'd'),
    formatPart(hours, 'h'),
    formatPart(minutes, 'm'),
    formatPart(secs, 's'),
  ].filter(Boolean)

  // Добавляем миллисекунды, если время < 1 минуты и они есть
  if (ms > 0 && minutes < 1) {
    parts.push(ms.toString().padStart(3, '0') + 'ms')
  }

  // Берём только две самые значимые части
  const significantParts = parts.slice(0, 2)

  // Определяем разделитель
  const separator = significantParts[1]?.endsWith('ms') ? '.' : ':'

  return significantParts.join(separator) || '0s'
}