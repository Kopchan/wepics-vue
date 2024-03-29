import { computed } from 'vue'
import { defineStore } from 'pinia'
import { storageWrapper } from '@/helpers'

export const useSettingsStore = defineStore('settings', () => {
  const settings = storageWrapper('settings')

  const createProp = (name, defaultValue) => {
    return computed({
      get: ()      => settings[name] || defaultValue,
      set: (value) => settings[name] = value
    })
  }

  const size         = createProp('size', 360)
  const isStrictSize = createProp('isStrictSize', false)
  const isRealSize   = createProp('isRealSize', false)
  const lines        = createProp('lines', null)
  const gap          = createProp('gap', 8)
  const radius       = createProp('radius', 12)
  const orientation  = createProp('orientation', 'w')
  
  return { size, isStrictSize, isRealSize, lines, gap, radius, orientation }
})
