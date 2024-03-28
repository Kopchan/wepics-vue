import { computed } from 'vue'
import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', () => {
  const size = computed({
    get: ()  => localStorage.getItem('size') || 360, 
    set: val => localStorage.setItem('size', val)
  })
  const isStrictSize = computed({
    get: ()  => localStorage.getItem('isStrictSize') || false, 
    set: val => localStorage.setItem('isStrictSize', val)
  })
  const isRealSize = computed({
    get: ()  => localStorage.getItem('isRealSize') || false, 
    set: val => localStorage.setItem('isRealSize', val)
  })
  const lines = computed({
    get: ()  => localStorage.getItem('columns') || null, 
    set: val => localStorage.setItem('columns', val)
  })
  const gap = computed({
    get: ()  => localStorage.getItem('gap') || 8, 
    set: val => localStorage.setItem('gap', val)
  })
  const radius = computed({
    get: ()  => localStorage.getItem('radius') || 12, 
    set: val => localStorage.setItem('radius', val)
  })
  const orientation = computed({
    get: ()  => localStorage.getItem('orientation') || 'w', 
    set: val => localStorage.setItem('orientation', val)
  })
  
  return { size, isStrictSize, isRealSize, lines, gap, radius, orientation }
})
