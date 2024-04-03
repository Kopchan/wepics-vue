import { watchDebounced } from "@vueuse/core"
import { reactive } from "vue"

const readStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || {}
  } catch (e) {
    return {}
  }
}

export const storageWrapper = (key = 'data') => {
  const dataStorage = reactive(readStorage(key))
  watchDebounced(
    () => dataStorage,
    () => {
      localStorage.setItem(key, JSON.stringify(dataStorage))
    },
    { deep: true, debounce: 250 }
  )
  return dataStorage
}

export default storageWrapper
