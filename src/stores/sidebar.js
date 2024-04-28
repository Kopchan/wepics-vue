import { storageWrapper } from '@/helpers'
import { defineStore } from 'pinia'
import { computed } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
  const storage = storageWrapper('sidebar')

  const createProp = (name, defaultValue) => {
    return computed({
      get: ()      => storage[name] ?? defaultValue,
      set: (value) => storage[name] = value
    })
  }
  
  const isOpened = createProp('isOpened', false)
  const isPinned = createProp('isPinned', false)

  if (!isPinned.value) isOpened.value = false
 
  return { isOpened, isPinned }
})
