<script setup lang="ts">
import { TheHeader, SideBar } from '@/components'
import { useAlbumParamsStore, useServerSetupsStore, useSettingsStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed, onMounted, watch, watchEffect } from 'vue'
import { SITE_NAME } from './config'
import { useWindowScroll } from '@vueuse/core'
import { useRoute } from 'vue-router'

document.title = SITE_NAME

// Установленная пользователем тема и другие настройки
const { theme, zen, ambient, scroll } = storeToRefs(useSettingsStore())
// Статус открытия просмотрщика
const  { viewerOpened } = storeToRefs(useAlbumParamsStore())

// Функция получения HTML Node'ов по обычной строке
const getNodesFromString = (html: string) => {
  const template = document.createElement('div')
  template.innerHTML = html
  return template.childNodes
}

// Предзагрузка надстроек сервера
useServerSetupsStore().preLoad()

// Функция  установки темы
const setupTheme = () => {
  // Удаляем старую тему
  document.documentElement.classList.remove('light', 'dark')
  const metaTags = document.head.querySelectorAll('[name="theme-color"]')
  for(const metaTag of metaTags) metaTag.remove()

  // Устанавливаем новую тему
  switch (theme.value) {
  case 'light':
  case 'dark':
    // Если тёмная или светлая
    document.documentElement.classList.add(theme.value)
    getNodesFromString(
      `<meta name="theme-color" content="#${theme.value == 'light' ? 'fff' : '000'}">`
    ).forEach(node => {
      document.head.appendChild(node)
    })
    return
  case 'auto':
    // Если автоматическая
    getNodesFromString(
      '<meta name="theme-color" content="#fff" media="(prefers-color-scheme: light)">' +
      '<meta name="theme-color" content="#000" media="(prefers-color-scheme:  dark)">'
    ).forEach(node => {
      document.head.appendChild(node)
    })
    return
  }
}

onMounted(() => {
  // Убираем авто-тему, если пользователь установил конкретную
  if (theme.value == 'light' ||
      theme.value == 'dark')
    setupTheme()
})

// Узнаём прокручена ли страница
const { y: yScroll } = useWindowScroll()
const isScrolledDown = computed(() => yScroll.value > 0)

// Устанавливаем новую тему, если пользователь сменил её
watch(theme, setupTheme)

// Маршрут
const route = useRoute()

// Если в имени роута есть в конце Image, то меняем скролл и статус просмотрщика
watch(
  () => route?.name,
  () => {
    viewerOpened.value = typeof route.name === 'string' && route.name.endsWith("Image")
    scroll.value = !viewerOpened.value
  },
  { immediate: true }
)

// С инициализации переключаем классы по отслеживаемым настройкам
watchEffect(() => document.body.classList.toggle('no-scroll', !scroll.value))
watchEffect(() => document.body.classList.toggle('ambient', ambient.value))
watchEffect(() => document.body.classList.toggle('zen', zen.value))
watchEffect(() => document.body.classList.toggle('scrolled', isScrolledDown.value))
watchEffect(() => document.body.classList.toggle('viewer', viewerOpened.value))

</script>

<template>
  <TheHeader />
  <SideBar />
  <RouterView />
</template>

<style lang="scss">
.no-scroll {
  overflow: hidden;
}
</style>
