import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import router from '@/router'

export const useAlbumParamsStore = defineStore('albumParams', () => {
  const route = useRoute()

  const createProp = (
    name,
    defaultValue = null,
    routeName = false,
    isArray = false,
  ) => computed({
    get: () => {
      const prop = route[routeName ? 'params' : 'query'][name]
      if (isArray) {
        return prop?.split(',')?.map(elem => decodeURIComponent(elem)) ?? []
      }
      else if (prop === null)
        return true
     
      return prop ?? defaultValue
    },
    set: (value) => {
      const query = route.query

      if (routeName) {
        if (value === undefined || value === defaultValue) {
          router.push({
            name: 'home',
            query
          })
          return
        }
        
        const params = route.params
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
 
  return { targetAlbum, limit, sort, isReverse, tags }
})
