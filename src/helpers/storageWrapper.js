import { reactive, watch } from "vue"

const readStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || {}
  } catch (e) {
    return {}
  }
}

const storageWrapper = (key) => {
  const dataStorage = reactive(readStorage(key))
  watch(
    () => dataStorage,
    () => {
      localStorage.setItem(key, JSON.stringify(dataStorage))
    },
    { deep: true }
  )
  return dataStorage
}

export default storageWrapper
