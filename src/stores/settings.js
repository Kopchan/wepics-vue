import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { storageWrapper } from '@/helpers'

export const useSettingsStore = defineStore('settings', () => {
  // Инфа об настройках в localStorage
  const settings = storageWrapper('settings')

  // Сброс настроек
  const reset = () => {
    for (const key in settings) {
      delete settings[key]
    }
  }
  // Создание параметра в localStorage со значением по умолчанию
  const createProp = (name, defaultValue) => {
    return computed({
      get: ()      => settings[name] ?? defaultValue,
      set: (value) => settings[name] = value
    })
  }

  const size         = createProp('size', 480)
  const isStrictSize = createProp('isStrictSize', 0)
  const isRealSize   = createProp('isRealSize', 0)
  const lines        = createProp('lines', 0)
  const gap          = createProp('gap', 8)
  const extGap       = createProp('extGap', true)
  const radius       = createProp('radius', 12)
  const orientation  = createProp('orientation', 'h')
  const theme        = createProp('theme', 'auto')
  const ambient      = createProp('ambient', true)
  const scroll = ref(true)
 
  return { 
    settings, reset, size, isStrictSize, isRealSize, ambient,
    lines, gap, extGap, radius, orientation, theme, scroll
  }
})
