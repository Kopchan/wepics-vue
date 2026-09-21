import { computed, ref, watch, watchEffect, type WritableComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { defineStore } from 'pinia'
import { SITE_NAME } from '@/config'
import { albumsSortTypes, imagesSortTypes } from '@/api'
import type { AlbumItem, ImageItem } from '@/types'
import type { AlbumSortValue, ImageSortValue, MediaType } from '@/api'
import { routeNameViewer, routeViewerType } from '@/helpers'

type QueryPropValue = string | number | boolean | string[] | null

/** Хук хранилища обработчика маршрута */
export const useRouterHandlerStore = defineStore('routerHandler', () => {
  // --------- ХУКИ ---------
  const route = useRoute() // Текущий маршрут
  const router = useRouter() // Маршрутизатор для управления

  // --------- ВНУТРЕННИЕ ФУНКЦИИ ---------
  /** Функция создания get-set переменной для параметра (пути или запроса) в адресной строке */
  const createProp = <T extends QueryPropValue = string>(
    name: string,
    defaultValue: T | null = null,
    isPathParam = false
  ): WritableComputedRef<T> => {
    // Ссылка-переменная на значение
    const cached = ref<string | string[] | null>(null)

    // Запись в ссылку-переменную если route изменился
    watchEffect(() => {
      const raw = route[isPathParam ? 'params' : 'query'][name]
      cached.value = raw as string | string[] | null
    })

    return computed<T>({
      get: (): T => {
        // Берём значение из ссылки-переменной
        const prop = cached.value

        // Если параметр это изначально массив, то возвращаем массив
        if (Array.isArray(defaultValue)) {
          // Возвращаем пустой массив если значения нет
          if (!prop) return [] as unknown as T

          // Возвращаем массив. Строку пытаемся разделить по запятой
          return (Array.isArray(prop) ? prop : prop.split(',')).map(decodeURIComponent) as T
        }

        // Пустой параметр возвращаем как true
        if (prop === null) return true as T

        // Возвращаем значение или установленное по умолчанию
        return (prop ?? defaultValue) as T
      },
      set: (value: T) => {
        // Берём старые параметры запроса для новых значений
        const newQuery = { ...route.query }

        if (
          value === undefined ||
          value === false ||
          (Array.isArray(value) && value.length === 0) ||
          value === defaultValue
        ) // Удаляем параметр в адресной строке если задали undefined, false, пустой array или значение по умолчанию
          delete newQuery[name]
        else if (value === true)
          // Создаём пусой параметр запроса если задали true
          newQuery[name] = null
        else if (Array.isArray(value))
          // Создаём/замещаем параметр строками через запятую если задали массив
          newQuery[name] = value.map(encodeURIComponent).join(',')
        else
          // Создаём/замещаем простой параметр со значением (число, строка)
          newQuery[name] = value as string

        // Замещаем параметры запроса в адресной строке новым масивом
        router.replace({ query: newQuery })
      },
    })
  }

  // --------- ХРАНИЛИЩА, СОСТОЯНИЯ и ПЕРЕМЕННЫЕ ---------
  const albumData = ref<Partial<AlbumItem>>({})
  const imageData = ref<Partial<ImageItem>>({})
  const viewerOpened = ref(false)
  const openedPreviewSrc = ref<string>()

  // --------- ПАРАМЕТРЫ ПУТИ ---------
  const targetUser      = createProp('user'     ,  null , true)
  const targetAlbum     = createProp('album'    , 'root', true)
  const targetTrueAlbum = createProp('trueAlbum',  null , true)
  const targetImage     = createProp('image'    ,  null , true)
  const targetImageType = createProp('type'     ,  null , true)

  // --------- ПАРАМЕТРЫ ЗАПРОСА ---------
  const sort            = createProp<ImageSortValue>('sort'   , 'date')
  const sortAlbums      = createProp<AlbumSortValue>('asort'  , 'content')
  const limit           = createProp<number>        ('limit'  , 30)
  const isReverse       = createProp<boolean>       ('r'      , false)
  const isReverseAlbums = createProp<boolean>       ('ar'     , false)
  const nested          = createProp<boolean>       ('nested' , false)
  const disrespect      = createProp<boolean>       ('disord' , false)
  const randomSeed      = createProp<number|null>   ('seed'   , null)
  const types           = createProp<MediaType[]>   ('type'   , [])
  const ratings         = createProp<string[]>      ('ratings', [])
  const tags            = createProp<string[]>      ('tags'   , [])

  // --------- ВЫЧИСЛЯЕМЫЕ ПАРАМЕТРЫ ---------
  const sortType          = computed(() => imagesSortTypes.find(s => s.value === sort.value))
  const albumSortType     = computed(() => albumsSortTypes.find(s => s.value === sortAlbums.value))
  const trueReverse       = computed(() =>      sortType.value?.reverse !== isReverse.value)
  const trueReverseAlbums = computed(() => albumSortType.value?.reverse !== isReverseAlbums.value)

  // --------- СЛЕЖКА ---------
  // Если поменялось имя альбома или открылась картинка, то меняем название вкладки
  watch(
    () => [albumData.value?.name, imageData.value?.name],
    () => {
      const imgName = imageData.value?.name?.replace(/\.[^.]+$/, '')
      const albName = imageData.value?.album?.name ?? albumData.value?.name
      const titleParts = [...[imgName, albName].filter(Boolean)]

      const isPWA = () => {
        return window.matchMedia('(display-mode: standalone)').matches
          || window.navigator?.standalone
          || document.referrer.includes('android-app://')
      }

      if (!isPWA())
        titleParts.push(SITE_NAME)

      document.title = titleParts.length > 0
        ? titleParts.join(' • ')
        : SITE_NAME
    }
  )

  // Если сортировка поменялась на рандомную, то генерируем сид если его нет ещё
  watch([
    sort,
    sortAlbums,
  ], () => {
    if (sort.value === 'random' || sortAlbums.value === 'random')
      randomSeed.value ??= Math.floor(100000 + Math.random() * 900000)
    else
      randomSeed.value = null
  })

  // --------- ДЕЙСТВИЯ ---------
  /** Открытие просмотрщика */
  const openViewer = (
    image: ImageItem,
    event: MouseEvent | null = null,
    videoRefs: Record<string, HTMLVideoElement | null> = {}
  ) => {
    // Фиксируем таймлайн видео
    const watchedToNow = videoRefs[image.hash]?.currentTime

    if (!image?.watchedTo || (watchedToNow != null && image.watchedTo < watchedToNow))
      image.watchedTo = watchedToNow

    // Записываем все данные о картинке в стор
    imageData.value = image

    // Вытаскиваем src / poster из DOM по ивенту
    const currentTarget = event?.currentTarget as HTMLElement | null
    const imgElement = currentTarget?.querySelector<HTMLImageElement>('img')

    if (imgElement) {
      openedPreviewSrc.value = imgElement.currentSrc
    } else {
      const videoElement = currentTarget?.querySelector<HTMLVideoElement>('video')
      if (videoElement && videoElement.poster)
        openedPreviewSrc.value = videoElement.poster
    }

    router.push({
      name: routeNameViewer(!!targetUser.value, image),
      query: route.query,
      params: {
        user: targetUser.value,
        type: routeViewerType(image?.type ?? ''),
        album: albumData.value?.alias ?? targetAlbum.value,
        trueAlbum: image?.album?.alias ?? image?.album?.hash,
        image: image?.hash,
      },
    })
  }

  return {
    viewerOpened, openedPreviewSrc,
    albumData, imageData,

    targetAlbum, targetUser, targetImage, targetTrueAlbum, targetImageType,

    limit, sort, isReverse, sortType, tags, nested, sortAlbums,
    isReverseAlbums, disrespect, randomSeed, types, ratings,

    trueReverse, trueReverseAlbums,

    openViewer,
  }
})
