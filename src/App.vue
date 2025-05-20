<script setup>
import { TheHeader, SideBar } from '@/components'
import { useServerSetupsStore, useSettingsStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { onMounted, watch } from 'vue'
import { SITE_NAME } from './config'

document.title = SITE_NAME

// Установленная пользователем тема
const { theme, scroll } = storeToRefs(useSettingsStore())

// Функция получения HTML Node'ов по обычной строке
const getNodesFromString = (html) => {
  const template = document.createElement('div')
  template.innerHTML = html
  return template.childNodes
}

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

watch(
  () => scroll.value, 
  () => {
    document.body.classList[scroll.value ? 'remove' : 'add']('no-scroll')
  }
)

onMounted(() => {
  // Убираем авто-тему, если пользователь установил конкретную
  if (theme.value == 'light' ||
      theme.value == 'dark')
    setupTheme()
})

// Устанавливаем новую тему, если пользователь сменил её
watch(() => theme.value, setupTheme)
</script>

<template>
  <TheHeader/>
  <SideBar/>
  <RouterView/>
</template>

<style lang="scss">
.no-scroll {
  overflow: hidden;
}
</style>
