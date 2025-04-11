import { STORAGE_PREFIX } from "@/config"
import { watchDebounced } from "@vueuse/core"
import { reactive } from "vue"

const getTrueKey = (key) => STORAGE_PREFIX + "_" + key

const readStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(getTrueKey(key))) || {}
  } catch (e) {
    return {}
  }
}

export const storageWrapper = (key = 'data') => {
  const dataStorage = reactive(readStorage(key))

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
