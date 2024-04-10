import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { router } from '@/router'
import { fetchWrapper } from '@/helpers'

export const useAlbumParamsStore = defineStore('albumParams', () => {
  const createProp = (
    name,
    defaultValue = null,
    routeName = false,
    isArray = false,
  ) => computed({
    get: () => {
      const prop = router.currentRoute.value[routeName ? 'params' : 'query'][name]
      if (name === 'albumHash') console.log({
        get: prop, 
        by: `router.currentRoute.value[${routeName} ? 'params' : 'query'][${name}]`
      });
      if (isArray) {
        return prop?.split(',')?.map(elem => decodeURIComponent(elem)) ?? []
      }
      else if (prop === null)
        return true
     
      return prop ?? defaultValue
    },
    set: (value) => {
      if (name === 'albumHash') console.log({set: value});
      const query = router.currentRoute.value.query

      if (routeName) {
        if (value === undefined || value === defaultValue) {
          router.push({
            name: 'home',
            query
          })
          return
        }
        
        const params = router.currentRoute.value.params
        router.push({
          name: routeName,
          params: { ...params, [name]: value ?? defaultValue },
          query
        })
        return
      }

      let newQuery = {...query}
      if (value === undefined || value === false || value.length === 0)
        delete newQuery[name]
     
      else if (value === true)
        newQuery[name] = null

      else if (value instanceof Array) {
        newQuery[name] = value.map(elem => encodeURIComponent(elem))?.join(',')
      }
      else newQuery[name] = value

      router.replace({ query: newQuery })
    }
  })

  const targetAlbum = createProp('albumHash', 'root', 'album')
  const limit       = createProp('limit', 30 )
  const sort        = createProp('sort', 'name')
  const isReverse   = createProp('reverse', false)
  const tags        = createProp('tags', [], undefined, true)
  /*
  const getAlbumData = () => {
    fetchWrapper.get('/albums/' + (router.currentRoute.value.params.albumHash ?? 'root'))
      .then(data => albumData.value = data)
  }
  setTimeout(getAlbumData(), 100)

  watch(
    () => targetAlbum.value, 
    getAlbumData(),
  )*/
  const albumData = ref({})
 
  return { targetAlbum, limit, sort, isReverse, tags, albumData }
})
