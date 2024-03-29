import { computed } from 'vue'
import { defineStore } from 'pinia'
import { storage } from '@/helpers'

export const useSettingsStore = defineStore('settings', () => {
  let settings = storage('settings')
  
  const size = computed({
    get: ()  => settings.size || 360, 
    set: val => settings.size = val
  })
  const isStrictSize = computed({
    get: ()  => settings.isStrictSize || false, 
    set: val => settings.isStrictSize = val
  })
  const isRealSize = computed({
    get: ()  => settings.isRealSize || false, 
    set: val => settings.isRealSize = val
  })
  const lines = computed({
    get: ()  => settings.columns || null, 
    set: val => settings.columns = val
  })
  const gap = computed({
    get: ()  => settings.gap || 8, 
    set: val => settings.gap = val
  })
  const radius = computed({
    get: ()  => settings.radius || 12, 
    set: val => settings.radius = val
  })
  const orientation = computed({
    get: ()  => settings.orientation || 'w', 
    set: val => settings.orientation = val
  })
  
  return { size, isStrictSize, isRealSize, lines, gap, radius, orientation }
})
