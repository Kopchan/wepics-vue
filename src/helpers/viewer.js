export const routeNameViewer = (hasUser, image, nestedAlbum = null) =>
  (hasUser ? 'user' : 'open') 
  + 'Album'
  + ((image?.album?.alias ?? image?.album?.hash ?? nestedAlbum) ? 'Nested' : '')
  + 'Image'

export const routeViewerType = (type) => {
  switch (type) {
  case 'video': return 'v'
  case 'audio': return 'a'
  default:      return 'i'
  }
} 
