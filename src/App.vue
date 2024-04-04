<script setup>
import { TheHeader, SideBar } from '@/components'
import { useSettingsStore } from './stores'
import { storeToRefs } from 'pinia'
import { onMounted, watch } from 'vue'

const { theme } = storeToRefs(useSettingsStore())

const getNodesFromString = (html) => {
  const template = document.createElement('div')
  template.innerHTML = html
  return template.childNodes
}

const setupTheme = () => {
  document.documentElement.classList.remove('light', 'dark')
  const metaTags = document.head.querySelectorAll('[name="theme-color"]')
  for(const metaTag of metaTags) metaTag.remove()

  switch (theme.value) {
  case 'light':
  case 'dark':
    document.documentElement.classList.add(theme.value)
    getNodesFromString(
      `<meta name="theme-color" content="#${theme.value == 'light' ? 'fff' : '000'}">`
    ).forEach(node => {
      document.head.appendChild(node)
    })
    return
  case 'auto':
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
  if (theme.value == 'light' ||
      theme.value == 'dark')
    setupTheme()
})

watch(() => theme.value, setupTheme)
</script>

<template>
  <TheHeader/>
  <SideBar/>
  <RouterView/>
</template>
