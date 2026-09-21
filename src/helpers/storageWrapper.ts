import { STORAGE_PREFIX } from "@/config"
import { watchDebounced } from "@vueuse/core"
import { reactive } from "vue"

const getTrueKey = (key: string): string => STORAGE_PREFIX + "_" + key

const readStorage = <T extends object>(key: string): T => {
  try {
    return JSON.parse(localStorage.getItem(getTrueKey(key)) ?? '') || {}
  } catch (e) {
    return {} as T
  }
}

export const storageWrapper = <T extends object = Record<string, unknown>>(key = 'data'): T => {
  const dataStorage = reactive(readStorage<T>(key)) as T

  watchDebounced(
    () => dataStorage,
    () => {
      localStorage.setItem(getTrueKey(key), JSON.stringify(dataStorage))
    },
    { deep: true, debounce: 250 }
  )
  
  return dataStorage
}

export default storageWrapper
