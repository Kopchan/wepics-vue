import type { ImageItem } from "@/types"

export const routeNameViewer = (
  hasUser: boolean,
  image: ImageItem | null | undefined,
  nestedAlbum: string | null = null,
): string =>
  (hasUser ? 'user' : 'open')
  + 'Album'
  + ((image?.album?.alias ?? image?.album?.hash ?? nestedAlbum) ? 'Nested' : '')
  + 'Image'

export const routeViewerType = (type: string): string => {
  switch (type) {
  case 'video': return 'v'
  case 'audio': return 'a'
  default:      return 'i'
  }
} 
