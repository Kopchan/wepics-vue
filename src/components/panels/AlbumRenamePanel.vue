<script setup>
import { onMounted, ref } from 'vue'
import { BtnRadios } from '@/components/ui'
import { fetchWrapper } from '@/helpers'
import { storeToRefs } from 'pinia'
import { useAlbumParamsStore } from '@/stores'
import { urls } from '@/api';

// Получаем данные о текущем открытом альбоме
const { targetAlbum, albumData } = storeToRefs(useAlbumParamsStore())

const isFetching = ref(false) // Статус "данные отправляются"
const isErrored = ref(false) // Статус "произошла ошибка"
const form = ref({})        // Данные для отправки

const inputBox = ref(null)

form.value.customName = albumData.value.name

// Переименование альбома
const renameAlbum = () => {
  fetchWrapper.patch(urls.albumInfo(targetAlbum.value), form.value)
    .then(data => {
      albumData.value.name = form.value.customName
    })
    .catch(() => {
      isErrored.value = true
    })
}

onMounted(() => {
  if (inputBox.value) 
    inputBox.value.focus()
})
</script>

<template>
  <div class="outer">
    <h4>Rename</h4>
    <form @submit.prevent="renameAlbum">
      <input class="text-box" required v-model="form.customName" placeholder="Album custom name" ref="inputBox">
      <button class="btn" :disable="isFetching">Save</button>
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
