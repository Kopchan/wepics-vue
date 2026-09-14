import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { storageWrapper } from '@/helpers'
import { useDevicePixelRatio } from '@vueuse/core'
import { useServerSetupsStore } from './serverSetups'

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
  const createProp = <T>(name: string, defaultValue: T) => {
    return computed<T>({
      get: ()      => (settings[name] as T) ?? defaultValue,
      set: (value) => { settings[name] = value },
    })
  }

  const size          = createProp<number>                 ('size', 480)
  const isStrictSize  = createProp<boolean>                ('isStrictSize', true)
  const isRealSize    = createProp<boolean>                ('isRealSize', true)
  const lines         = createProp<number>                 ('lines', 0)
  const gap           = createProp<number>                 ('gap', 8)
  const extGap        = createProp<boolean>                ('extGap', true)
  const radius        = createProp<number>                 ('radius', 12)
  const orientation   = createProp<'h'|'w'>                ('orientation', 'h')
  const theme         = createProp<'auto'|'dark'|'light'>  ('theme', 'auto')
  const ambient       = createProp<boolean>                ('ambient', true)
  const zen           = createProp<boolean>                ('zen', false)
  const albumsLayout  = createProp<'hide'|'grid'|'lines'>  ('albumsLayout', 'lines')
  const lineWidth     = createProp<number>                 ('lineWidth', 720)
  const openPreviewTo = createProp<'fit'|'screen'|'window'>('preview', 'fit')
  const position      = createProp<object>('position', {
    width: 1024,
    height: 768,
    x: 100,
    y: 100,
  })

  // TODO: вынести в другой сторадж (тут должны быть только настройки)
  const scroll = ref(true)

  const { getAllowedSize } = useServerSetupsStore()
  const { pixelRatio } = useDevicePixelRatio()

  const pixelSize = computed(() => size.value * pixelRatio.value)

  const imagePreviewSize = computed(() => getAllowedSize(pixelSize.value * 1.2))
  const albumPreviewSize = computed(() => getAllowedSize(pixelSize.value / 2))
  // TODO END

  return {
    settings, reset, scroll,
    orientation,
    theme,
    size, isStrictSize, isRealSize, lines,
    albumPreviewSize, imagePreviewSize, pixelRatio, pixelSize,
    ambient, zen, position, openPreviewTo,
    gap, extGap, radius,
    albumsLayout, lineWidth,
  }
})
