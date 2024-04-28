<script setup>
import { toRefs, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { fetchWrapper } from '@/helpers'
import { useAlbumParamsStore } from '@/stores'

// Заданные данные компоненту
const props = defineProps({
  hash: String
})
// Хеш тыкнутого альбома
const { hash } = toRefs(props)
// Данные по текущему открытому альбому
const { targetAlbum, albumData } = storeToRefs(useAlbumParamsStore())

const subAlbumData = ref(null) // Данные по тыкнутому альбому
const isErrored = ref(false)  // Статус "произошла ошибка"
const isLoading = ref(true)  // Статус "загружаюсь"
if (hash.value === targetAlbum.value) {
  // Если тыкнутый альбом = текущий альбом, то данные уже есть 
  isLoading.value = false
  subAlbumData.value = albumData.value
}
else fetchWrapper.get('/albums/' + hash.value)
  // Иначе загрузить по хешу
  .then(data => {
    isLoading.value = false
    subAlbumData.value = data
  }).catch(() => {
    isLoading.value = false
    isErrored.value = true
  })
</script>

<template>
  <div class="outer">
    <template v-if="subAlbumData?.children">
      <button 
        v-for="(childParams, child) in subAlbumData?.children"
        :key="child"
        class="btn" 
        @click="targetAlbum = childParams.hash">
        {{ child }}
      </button>
    </template>
    <template v-else>
      <p v-if="isLoading">Loading...</p>
      <p v-else-if="isErrored">Error download</p>
      <p v-else-if="!subAlbumData?.children">No childs</p>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.outer {
  min-width: 100px;
  display: flex;
  flex-direction: column;
}
.btn {
  justify-content: start;
  &:hover {
    background-color: var(--c-b0a);
  }
  &:active {
    background-color: var(--c-b0);
  }
}
</style>
