export const bytesUnits = ['B', 'K', 'M', 'G', 'T']

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

export default humanFileSize
