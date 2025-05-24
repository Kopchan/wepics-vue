import { urls } from "@/api"

// Требуемые размеры карточек на представлении / скачиваемого изображения 
//const { pixelRatio } = useDevicePixelRatio()
//const realSize = computed(() =>  isRealSize.value ? size.value : Math.round(size.value * pixelRatio.value) )
//const  cssSize = computed(() => !isRealSize.value ? size.value : Math.round(size.value / pixelRatio.value) )

//export const allowedSizes = [144, 240, 360, 480, 720, 1080] // сортированный
//export const getAllowedSize = (size) => {
//  for (const allowedSize of allowedSizes) {
//    if (size <= allowedSize)
//      return allowedSize
//  }
//  return allowedSizes.at(-1)
//}

// Получение превью всех размеров, если устройство поддерживает srcset 
//export const getThumbMultiURL = (albumHash, img, sign = null) => {
//  const srcsetItems = []
//  for (const allowSize of allowedSizes) {
//    const urlW = urls.imageThumb(albumHash, img.hash, sign, 'w', allowSize)
//    srcsetItems.push(urlW +' '+ allowSize +'w')
//
//    const urlH = urls.imageThumb(albumHash, img.hash, sign, 'h', allowSize)
//    srcsetItems.push(urlH +' '+ Math.round(allowSize * img.ratio) +'w')
//  }
//  return srcsetItems.join(', ')
//}

// Видео и анимированные картинки как оригинал
//export const getThumbUrlOnAlbum = (album, img, size) => {
//  return img.type === 'imageAnimated'
//    ? urls.imageOrig (album.hash, img.hash, album?.sign) 
//    : urls.imageThumb(album.hash, img.hash, album?.sign, 'h', size) 
//}