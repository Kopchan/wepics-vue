import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import router from '@/router'

export const useAlbumParamsStore = defineStore('albumParams', () => {
  const route = useRoute()

  const createProp = (
    name, 
    defaultValue = null, 
    isParam = false
  ) => computed({
    get: () => {
      const prop = route[isParam ? 'params' : 'query'][name]
      if (prop === null)
        return true
      
      return prop ?? defaultValue
    },
    set: (value) => {
      const query = route.query

      if (isParam) {
        const params = route.params
        router.push({
          name: 'album',
          params: { ...params, [name]: value ?? defaultValue }, 
          query
        })
        return
      }

      let newQuery = {...query}
      if (value === undefined || value === false)
        delete newQuery[name]
      
      else if (value === true)
        newQuery[name] = null

      else newQuery[name] = value

      router.replace({ query: newQuery })
    }
  })

  const targetAlbum = createProp('albumHash', 'root', true)
  const perPage     = createProp('perPage', 30 )
  const sort        = createProp('sort', 'name')
  const isReverse   = createProp('reverse', false)
  
  return { targetAlbum, perPage, sort, isReverse }
})
