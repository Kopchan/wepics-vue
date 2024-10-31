<script setup>
import { ref } from 'vue'
import { BtnRadios } from '@/components/ui'
import { fetchWrapper } from '@/helpers'
import { storeToRefs } from 'pinia'
import { useAlbumParamsStore } from '@/stores'
import { urls } from '@/api';

// Получаем данные о текущем открытом альбоме
const { targetAlbum, albumData } = storeToRefs(useAlbumParamsStore())


const isFetching = ref(false) // Статус "данные отправляются"
const isErrored = ref(false) // Статус "произошла ошибка"
const mode = ref('album')   // Режим добавления
const form = ref({})       // Данные для отправки

// Создание альбома
const createAlbum = () => {
  fetchWrapper.post(urls.albumInfo(targetAlbum.value), form.value)
    .then(data => {
      albumData.value.children[form.value.name] = { hash: data.hash }
    })
    .catch(() => {
      isErrored.value = true
    })
}
// Отправка картинок
const sendImages = () => {
  fetchWrapper.post(urls.albumInfo(targetAlbum.value), form.value)
    .catch(() => {
      isErrored.value = true
    })
}
</script>

<template>
  <div class="outer">
    <h4>Add</h4>
    <BtnRadios name="mode" v-model="mode" :options="{album: 'Album', images: 'Images'}"/>
    <form @submit.prevent="createAlbum" v-if="mode === 'album'">
      <input class="text-box" required v-model="form.name" placeholder="Album name">
      <button class="btn" :disable="isFetching">Create</button>
    </form>
    <form @submit.prevent="sendImages" v-else @drop.prevent="sendImages">
      <input type="file" required ref="images" multiple
        accept=".png,.jpg,.jpeg,.apng,.gif,.webp,.avif,.bmp">
      <button class="btn" :disable="isFetching">Upload</button>
    </form>
    <div v-if="isErrored">
      <p>Something going wrong</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.outer {
  width: 250px;
  display: flex;
  flex-direction: column;
  gap: 12px
}
h4 {
  text-align: center;
}
button {
  background-color: var(--c-b0a);
}
form {
  display: flex;
  flex-direction: column;
  gap: 12px
}
.error {
  background-color: #a004;
  padding: 10px;
  border-radius: var(--border-r);
}
</style>
