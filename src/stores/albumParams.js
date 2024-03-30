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

      if (isParam)
        router.push({
          params: { name: value }, 
          query
        })

      let newQuery = {...query}
      console.log(value)
      if (value === undefined || value === false)
        delete newQuery[name]
      
      else if (value === true)
        newQuery[name] = null

      else newQuery[name] = value

      router.push({ query: newQuery })
    }
  })

  const targetAlbum = createProp('albumHash', 'root', true)
  const perPage     = createProp('perPage', 30 )
  const sort        = createProp('sort', 'name')
  const isReverse   = createProp('reverse', false)
  
  return { targetAlbum, perPage, sort, isReverse }
})
