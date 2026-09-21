import { storageWrapper } from '@/helpers'
import { defineStore } from 'pinia'
import { computed } from 'vue'

interface SidebarData {
  isOpened?: boolean
  isPinned?: boolean
}

export const useSidebarStore = defineStore('sidebar', () => {
  const storage = storageWrapper<SidebarData>('sidebar')

  const createProp = <T extends boolean>(name: keyof SidebarData, defaultValue: T) => {
    return computed<T>({
      get: ()      => (storage[name] as T) ?? defaultValue,
      set: (value) => { storage[name] = value },
    })
  }

  const isOpened = createProp<boolean>('isOpened', false)
  const isPinned = createProp<boolean>('isPinned', false)

  if (!isPinned.value) isOpened.value = false

  return { isOpened, isPinned }
})
