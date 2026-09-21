<script setup lang="ts">
import { TheHeader, SideBar, MediaViewer } from '@/components'
import { useRouterHandlerStore, useServerSetupsStore, useSettingsStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed, onMounted, watch, watchEffect } from 'vue'
import { useWindowScroll } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { setupTheme } from './helpers'

// Установленная пользователем тема и другие настройки
const { theme, scroll } = storeToRefs(useSettingsStore())
// Статус открытия просмотрщика
const  { viewerOpened } = storeToRefs(useRouterHandlerStore())
// Предзагрузка надстроек сервера
useServerSetupsStore().preLoad()

onMounted(() => {
  // Убираем авто-тему, если пользователь установил конкретную
  if (theme.value == 'light' ||
      theme.value == 'dark')
    setupTheme(theme.value)
})

// Узнаём прокручена ли страница
const { y: yScroll } = useWindowScroll()
const isScrolledDown = computed(() => yScroll.value > 0)

// Устанавливаем новую тему, если пользователь сменил её
watch(theme, () => setupTheme(theme.value))

// Текущий маршрут
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
watchEffect(() => document.body.classList.toggle('scrolled', isScrolledDown.value))
watchEffect(() => document.body.classList.toggle('viewer', viewerOpened.value))

</script>

<template>
  <TheHeader/>
  <SideBar/>
  <RouterView/>
  <MediaViewer v-if="viewerOpened"/>
</template>

<style lang="scss">
body.no-scroll {
  overflow: hidden;
}
body.zen.viewer .page {
  opacity: 0;
  transition: 0.1s, opacity 1s;
}
</style>
