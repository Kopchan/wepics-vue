import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { storageWrapper } from '@/helpers'
import { useDevicePixelRatio } from '@vueuse/core'
import { useServerSetupsStore } from './serverSetups'
import { urls } from '@/api'

interface SettingsData {
  size?: number
  isStrictSize?: number
  isRealSize?: number
  lines?: number
  gap?: number
  extGap?: boolean
  radius?: number
  orientation?: string
  theme?: string
  ambient?: boolean
  albumsLayout?: string
  lineWidth?: number
  [key: string]: unknown
}

export const useSettingsStore = defineStore('settings', () => {
  // Инфа об настройках в localStorage
  const settings = storageWrapper<SettingsData>('settings')

  // Сброс настроек
  const reset = (): void => {
    for (const key in settings) {
      delete settings[key]
    }
  }
  // Создание параметра в localStorage со значением по умолчанию
  const createProp = <T,>(name: keyof SettingsData, defaultValue: T) => {
    return computed<T>({
      get: ()      => (settings[name] as T) ?? defaultValue,
      set: (value) => { settings[name] = value }
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
  const albumsLayout = createProp('albumsLayout', 'lines')
  const lineWidth    = createProp('lineWidth', 720)
  const scroll = ref(true)

  const { getAllowedSize, allowedPreviewSizes } = useServerSetupsStore()
  const { pixelRatio } = useDevicePixelRatio()

  const pixelSize = computed(() => size.value * pixelRatio.value)
 
  const imagePreviewSize = computed(() => getAllowedSize(pixelSize.value * 1.2))
  const albumPreviewSize = computed(() => getAllowedSize(pixelSize.value / 2))

  return { 
    settings, reset, scroll,
    orientation, 
    theme, 
    size, isStrictSize, isRealSize, lines, 
    albumPreviewSize, imagePreviewSize, pixelRatio, pixelSize,
    ambient, 
    gap, extGap, radius, 
    albumsLayout, lineWidth,
  }
})
