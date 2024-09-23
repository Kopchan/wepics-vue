const units = ['B', 'kB', 'MB', 'GB', 'TB']

export const humanFileSize = (bytes) => {
  var i = bytes == 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + units[i]
}

export default humanFileSize
