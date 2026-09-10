import { computed, ref, watch, watchEffect, type WritableComputedRef } from 'vue'
import { defineStore } from 'pinia'
//import { router } from '@/router'
import { SITE_NAME } from '@/config'
import { albumsSortTypes, imagesSortTypes } from '@/api'
import { useRoute, useRouter } from 'vue-router'
import type { AlbumItem, ImageItem } from '@/types'

type QueryPropValue = string | number | boolean | string[]

export const useAlbumParamsStore = defineStore('albumParams', () => {
  const route = useRoute()
  const router = useRouter()

  // Функция создания get-set переменной для параметра в адресной строке
  const createProp = <T extends QueryPropValue = string>(
    name: string,
    defaultValue: T | null = null,
    routeName = false,
    isArray = false,
  ): WritableComputedRef<T> => {
    const cached = ref<string | string[] | null>(null)  // кеш

    watchEffect(() => {
      const raw = route[routeName ? 'params' : 'query'][name]
      cached.value = raw as string | string[] | null
    })

    return computed<T>({
      get: (): T => {
        const prop = cached.value

        if (isArray) {
          if (!prop) return [] as unknown as T
          return (Array.isArray(prop) ? prop : prop.split(',')).map(decodeURIComponent) as T
        }

        if (prop === null) return true as T
        return (prop ?? defaultValue) as T
      },
      set: (value: T) => {
        const newQuery = { ...route.query }

        if (
          value === undefined ||
          value === false ||
          (Array.isArray(value) && value.length === 0) ||
          value === defaultValue
        ) {
          delete newQuery[name]
        } else if (value === true) {
          newQuery[name] = null
        } else if (Array.isArray(value)) {
          newQuery[name] = value.map(encodeURIComponent).join(',')
        } else {
          newQuery[name] = value as string
        }

        router.replace({ query: newQuery })
      }
    })
  }

  const albumData = ref<AlbumItem>({} as AlbumItem)
  const imageData = ref<ImageItem>({} as ImageItem)
  const viewerOpened = ref(false)

  const targetImage = ref<ImageItem | null>(null)
  const targetUser      = createProp<string>('user'     ,  null , true)
  const targetAlbum     = createProp<string>('album'    , 'root', true)
  const imageTrueAlbum  = createProp<string>('trueAlbum',  null , true)
  const targetImage2    = createProp<string>('image'    ,  null , true)
  const targetImageType = createProp<string>('type'     ,  null , true)

  const limit           = createProp<number>('limit'  , 30)
  const sort            = createProp<string>('sort'   , 'date')
  const isReverse       = createProp<boolean>('r'      , false)
  const sortAlbums      = createProp<string>('asort'  , 'content')
  const isReverseAlbums = createProp<boolean>('ar'     , false)
  const nested          = createProp<boolean>('nested' , false)
  const disrespect      = createProp<boolean>('disord' , false)
  const randomSeed      = createProp<number>('seed'   , null)
  const tags            = createProp<string[]>('tags'   , [], false, true)
  const ratings         = createProp<string[]>('ratings', [], false, true)
  const types           = createProp<string[]>('type'   , [], false, true)

  const sortType          = computed(() => imagesSortTypes.find(s => s.value === sort.value))
  const trueReverse       = computed(() => sortType.value?.reverse !== isReverse.value)
  const albumSortType     = computed(() => albumsSortTypes.find(s => s.value === sortAlbums.value))
  const trueReverseAlbums = computed(() => albumSortType.value?.reverse !== isReverseAlbums.value)

  watch(
    [
      () => albumData.value?.name,
      () => imageData.value?.name,
    ],
    () => {
      document.title =
        (imageData.value?.name ? (imageData.value.name + ' • ') : '') +
        (
          (imageData.value?.album?.name ?? albumData.value?.name)
            ? ((imageData.value?.album?.name ?? albumData.value.name) + ' • ')
            : ''
        ) +
        SITE_NAME
    },
  )

  watch(
    [
      sort,
      sortAlbums,
    ],
    () => {
      if (sort.value === 'random' || sortAlbums.value === 'random')
        randomSeed.value ??= Math.floor(100000 + Math.random() * 900000)
      else
        randomSeed.value = null as unknown as number
    },
  )

  return {
    targetAlbum, limit, sort, isReverse, sortType, targetUser, viewerOpened,
    tags, albumData, nested, sortAlbums, isReverseAlbums, disrespect, randomSeed, types, ratings,
    targetImage, imageData, targetImage2, imageTrueAlbum, targetImageType, trueReverse, trueReverseAlbums,
  }
})


/*
const createProp = (
  name,
  defaultValue = null,
  routeName = false,
  isArray = false,
) => computed({
  get: () => {
    // Получение параметра из адресной строки
    const prop = route[routeName ? 'params' : 'query'][name]
    // Если переменная была с предустановкой "это массив",
    // то элементы массива считываются через запятую
    if (isArray)
      return prop?.split(',')?.map(elem => decodeURIComponent(elem)) ?? []
    // Если null, то это true
    else if (prop === null)
      return true

    // Если undefined, то возвращается стандартное значение,
    // иначе полученное из адресной строки
    return prop ?? defaultValue
  },
  set: (value) => {

    // Обработка нового параметра
    let newQuery = {...route.query}
    if  (value === undefined
      || value === false
      || value.length === 0
      || value === defaultValue)
      delete newQuery[name]

    else if (value === true)
      newQuery[name] = null
    else if (value instanceof Array)
      newQuery[name] = value.map(elem => encodeURIComponent(elem))?.join(',')

    else newQuery[name] = value
    // Замена параметров в адресной строке
    router.replace({ query: newQuery })
  }
})
*/

/*
const getAlbumData = () => {
  fetchWrapper.get(urls.albumInfo(router.currentRoute.value.params.albumHash ?? 'root'))
    .then(data => albumData.value = data)
}
setTimeout(getAlbumData(), 100)
watch(
  () => targetAlbum.value,
  getAlbumData(),
)*/

//if (routeName) {
//  // Переход на новое заданное значение
//  const params = router.currentRoute.value.params
//  router.push({
//    name: routeName,
//    params: { ...params, [name]: value ?? defaultValue },
//    query
//  })
//  return
//}
