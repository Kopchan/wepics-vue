import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { router } from '@/router'
import { SITE_NAME } from '@/config'
import { imagesSort } from '@/api'

export const useAlbumParamsStore = defineStore('albumParams', () => {
  // Функция создания get-set переменной для параметра в адресной строке
  const createProp = (
    name,
    defaultValue = null,
    routeName = false,
    isArray = false,
  ) => computed({
    get: () => {
      // Получение параметра из адресной строки
      const prop = router.currentRoute.value[routeName ? 'params' : 'query'][name]

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
      // Полученние query-параметров из адресной строки
      const query = router.currentRoute.value.query

      if (routeName) {
        if (value === undefined || value === defaultValue) {
          // Если получено значение "ничего" или равняющееся по умолчанию, 
          // то перейти на главную страницу
          router.push({
            name: 'home',
            query
          })
          return
        }
        
        // Переход на новое заданное значение
        const params = router.currentRoute.value.params
        router.push({
          name: routeName,
          params: { ...params, [name]: value ?? defaultValue },
          query
        })
        return
      }
      
      // Обработка нового параметра
      let newQuery = {...query}
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

  const targetImage = ref(null)
  const albumData = ref({})

  const targetAlbum     = createProp('album'    , 'root', true)
  const imageTrueAlbum  = createProp('trueAlbum',  null , true)
  const targetImage2    = createProp('image'    ,  null , true)

  const fullscreen      = createProp('f'     , false)
  const limit           = createProp('limit' , 30)
  const tags            = createProp('tags'  , [], false, true)
  const sort            = createProp('sort'  , 'date')
  const isReverse       = createProp('r'     , false)
  const sortAlbums      = createProp('asort' , 'content')
  const isReverseAlbums = createProp('ar'    , false)
  const nested          = createProp('nested', false)
  const disrespect      = createProp('disord', false)

  const sortType = computed(() => imagesSort.find(s => s.value === sort.value))
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
  watch(
    () => albumData.value?.name, 
    () => {
      document.title = (albumData.value?.name ? albumData.value.name + ' • ' : '') + SITE_NAME
    },
  )
 
  return { 
    targetAlbum, limit, sort, isReverse, sortType,
    tags, albumData, nested, sortAlbums, isReverseAlbums, disrespect,
    targetImage, targetImage2, imageTrueAlbum, fullscreen,
  }
})
