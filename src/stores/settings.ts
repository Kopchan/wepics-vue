import { computed, ref, watch } from 'vue'
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

/** Хук хранилища настроек приложения */
export const useSettingsStore = defineStore('settings', () => {
  // --------- ХУКИ и ЛОКАЛЬНЫЕ ПОСТОЯННЫЕ ХРАНИЛИЩА ---------
  const { getAllowedSize } = useServerSetupsStore()
  const { pixelRatio } = useDevicePixelRatio()
  // Инфа об сохранёных настройках в localStorage
  const settings = storageWrapper<SettingsData>('settings')

  // --------- ВНУТРЕННИЕ ФУНКЦИИ ---------
  /** Создание параметра в localStorage со значением по умолчанию */
  const createProp = <T>(name: string, defaultValue: T) => {
    return computed<T>({
      get: ()      => (settings[name] as T) ?? defaultValue,
      set: (value) => { settings[name] = value },
    })
  }

  // Все переменные и классы применяем к телу документа DOM
  const body = document.body

  /** Смена стиль строки (например из extGap в ext-gap) */
  const toKebab = (str: string) => str.replace(/[A-Z]/g, letter => ('-'+letter.toLowerCase()))

  /** Создание параметра в localStorage со значением по умолчанию и привязкой к var на body в DOM */
  const createPropSyncVar = <T>(name: string, defaultValue: T, unit: string = '') => {
    const prop = computed<T>({
      get: ()      => (settings[name] as T) ?? defaultValue,
      set: (value) => { settings[name] = value },
    })
    const varName = '--'+toKebab(name)

    watch(prop, (newVal) => {
      if (typeof newVal === 'boolean') {
        body.style.setProperty(varName, newVal ? '1' : '0')
      } else {
        body.style.setProperty(varName, `${newVal}${unit ?? ''}`)
      }
    }, { immediate: true })

    return prop
  }

  /** Создание параметра в localStorage со значением по умолчанию и переключением класса на body в DOM */
  const createPropSyncClass = (name: string, defaultValue: boolean) => {
    const prop = computed({
      get: ()       => (settings[name] ?? defaultValue),
      set: (value) => { settings[name] = value },
    })

    watch(prop, (newVal) => {
      const body = document.body
      const className = toKebab(name)

      if (newVal) body.classList.add(className)
      else body.classList.remove(className)
    }, { immediate: true })

    return prop
  }

  // --------- СОХРАНЁНЫЕ ПАРАМЕТРЫ ---------
  const size          = createPropSyncVar<number> ('size', 480, 'px')
  const isStrictSize  = createProp<boolean>       ('isStrictSize', true)
  const isRealSize    = createProp<boolean>       ('isRealSize', true)
  const lines         = createProp<number>        ('lines', 0)
  const lineWidth     = createPropSyncVar<number> ('lineWidth', 720, 'px')
  const gap           = createPropSyncVar<number> ('gap', 8, 'px')
  const extGap        = createPropSyncVar<boolean>('extGap', true)
  const radius        = createPropSyncVar<number> ('radius', 12, 'px')

  // --------- СОХРАНЁНЫЕ СОСТОЯНИЯ ---------
  const orientation   = createProp<'h' | 'w'>              ('orientation', 'h')
  const theme         = createProp<'auto'|'dark'|'light'>  ('theme', 'auto')
  const ambient       = createPropSyncClass                ('ambient', true)
  const zen           = createPropSyncClass                ('zen', false)
  const albumsLayout  = createProp<'hide'|'grid'|'lines'>  ('albumsLayout', 'lines')
  const openPreviewTo = createProp<'fit'|'screen'|'window'>('preview', 'fit')

  // --------- СОХРАНЁНЫЕ ХРАНИЛИЩА ---------
  const position      = createProp<object>('position', { width: 1024, height: 768, x: 100, y: 100 })


  // TODO: вынести в другой сторадж (тут должны быть только настройки)
  // --------- ПЕРЕКЛЮЧАТЕЛИ ---------
  const scroll = ref(true)


  // --------- ВЫЧИСЛЯЕМЫЕ ПАРАМЕТРЫ ---------
  const pixelSize        = computed(() => size.value * pixelRatio.value)
  const imagePreviewSize = computed(() => getAllowedSize(pixelSize.value * 1.2))
  const albumPreviewSize = computed(() => getAllowedSize(pixelSize.value / 2))
  // TODO END


  // --------- ДЕЙСТВИЯ ---------
  /** Сброс настроек */
  const reset = (): void => {
    for (const key in settings) {
      delete settings[key]
    }
  }

  return {
    settings,
    size, isStrictSize, isRealSize, lines, gap, extGap, radius, lineWidth,
    orientation, theme, ambient, zen, albumsLayout, openPreviewTo,
    position,
    scroll,
    pixelRatio, pixelSize, albumPreviewSize, imagePreviewSize,
    reset,
  }
})

/*
type CSSVariableName = `--${string}`;
const syncVar = (prop: ComputedRef<number | boolean>, varName: CSSVariableName, unit: string = '') => {
  watch(prop, (newVal) => {

    if (typeof newVal === 'boolean') {
      body.style.setProperty(varName, newVal ? '1' : '0')
    } else {
      body.style.setProperty(varName, `${newVal}${unit ?? ''}`)
    }
  }, { immediate: true })
}
*/
/*
type ElementType<T extends readonly string[]> = T[number];

function createPropSyncClassOptions<T extends readonly string[]>(
  name: string,
  options: T,
  defaultValue: ElementType<T>,
  prefix?: string,
  useSeparator: false|'dash'|'bem' = 'dash'
): ComputedRef<ElementType<T>> {

  type AllowedValues = ElementType<T>;

  const prop = computed({
    get: () => (settings[name] ?? defaultValue) as AllowedValues,
    set: (value) => { settings[name] = value },
  })

  watch(prop, (newVal, oldVal) => {
    const body = document.body

    let separator = ''
    if (useSeparator === 'dash') separator = '-'
    if (useSeparator === 'bem') separator = '--'

    const classPrefix = prefix && useSeparator !== false ? `${prefix}${separator}` : ''

    if (oldVal) body.classList.remove(`${classPrefix}${oldVal}`)

    body.classList.add(`${classPrefix}${newVal}`)
  }, { immediate: true })

  return prop
}
*/
