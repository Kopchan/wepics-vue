import { computed, ref, watch, watchEffect } from 'vue'
import { defineStore } from 'pinia'
//import { router } from '@/router'
import { SITE_NAME } from '@/config'
import { imagesSort } from '@/api'
import { useRoute, useRouter } from 'vue-router'

export const useAlbumParamsStore = defineStore('albumParams', () => {
  const route = useRoute()
  const router = useRouter()

  // Функция создания get-set переменной для параметра в адресной строке
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
  const createProp = (
    name,
    defaultValue = null,
    routeName = false,
    isArray = false,
  ) => {
    const cached = ref(null)  // кеш
  
    watchEffect(() => {
      const raw = route[routeName ? 'params' : 'query'][name]
      cached.value = raw
    })
  
    return computed({
      get: () => {
        const prop = cached.value
  
        if (isArray) {
          if (!prop) return []
          return prop.split(',').map(decodeURIComponent)
        }
  
        if (prop === null) return true
        return prop ?? defaultValue
      },
      set: (value) => {
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
          newQuery[name] = value
        }
  
        router.replace({ query: newQuery })
      }
    })
  }

  const albumData = ref({})
  const imageData = ref({})

  const targetImage = ref(null)
  const targetUser      = createProp('user'     ,  null , true)
  const targetAlbum     = createProp('album'    , 'root', true)
  const imageTrueAlbum  = createProp('trueAlbum',  null , true)
  const targetImage2    = createProp('image'    ,  null , true)
  const targetImageType = createProp('type'     ,  null , true)

  //const fullscreen      = createProp('f'     , false)
  const limit           = createProp('limit' , 30)
  const tags            = createProp('tags'  , [], false, true)
  const sort            = createProp('sort'  , 'date')
  const isReverse       = createProp('r'     , false)
  const sortAlbums      = createProp('asort' , 'content')
  const isReverseAlbums = createProp('ar'    , false)
  const nested          = createProp('nested', false)
  const disrespect      = createProp('disord', false)

  const sortType  = computed(() => imagesSort.find(s => s.value === sort.value))
  const fullImage = ref(false)

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
 
  return { 
    targetAlbum, limit, sort, isReverse, sortType, targetUser, fullImage,
    tags, albumData, nested, sortAlbums, isReverseAlbums, disrespect,
    targetImage, imageData, targetImage2, imageTrueAlbum, targetImageType,
  }
})

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