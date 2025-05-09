<script setup>
import { onMounted, ref, toRefs } from 'vue'
import { fetchWrapper } from '@/helpers'
import { storeToRefs } from 'pinia'
import { useServerSetupsStore } from '@/stores'
import { urls } from '@/api'
import SelectorRadios2 from '../ui/SelectorRadios2.vue'

// Параметры компонента
const props = defineProps({
  album: Object,
})

// Параметры компонента в переменные
const { album } = toRefs(props)

const isFetching = ref(false) // Статус "данные отправляются"
const isErrored = ref(false) // Статус "произошла ошибка"
const form = ref({})        // Данные для отправки

const inputBox = ref(null)

      
if (album.value?.path) {
  const parts = album.value.path?.split(/[\\/]/)
  form.value.pathName = parts[parts?.length - 2]
}

form.value.displayName = album.value?.name
form.value.urlName     = album.value?.alias
form.value.oldUrlNames = album.value?.oldAliases
form.value.ageRatingId = album.value?.ratingId
form.value.orderLevel  = album.value?.orderLevel ?? 0
form.value.guestAllow  = album.value?.guestAllow ?? null

// Параметры предустановок
const { ageRatings } = storeToRefs(useServerSetupsStore())

// Переименование альбома
const editAlbum = () => {
  fetchWrapper.patch(urls.album(album.value.hash), form.value)
    .catch(() => {
      isErrored.value = true
    })
    .then(data => {
      album.value.name        = form.value.displayName
      album.value.alias       = form.value.urlName
      album.value.oldUrlNames = form.value.oldUrlNames
      album.value.ratingId    = form.value.ageRatingId
      album.value.orderLevel  = form.value.orderLevel
      album.value.guestAllow  = form.value.guestAllow
      
      if (album.value?.path) {
        const parts = album.value.path?.split(/[\\/]/)
        parts[parts?.length - 2] = form.value?.pathName
        album.value.path = parts.join('/')
      }
    })
}

onMounted(() => {
  if (inputBox.value) 
    inputBox.value.focus()
})
</script>

<template>
  <div class="outer">
    <h4>Edit</h4>
    <form @submit.prevent="editAlbum">
      <div class="label-group">
        <label>Display name</label>
      </div>
      <input class="text-box" v-model="form.displayName" placeholder="Album custom display name" ref="inputBox">

      <div class="label-group">
        <label>URL name (alias)</label>
      </div>
      <input class="text-box" v-model="form.urlName" placeholder="Album url path name">

      <div class="label-group">
        <label>Enternal folder name</label>
      </div>
      <input class="text-box" v-model="form.pathName" placeholder="Album enternal folder path name">

      <div class="label-group">
        <label>Order level (ignore sort)</label>
      </div>
      <input class="text-box" type="number" v-model="form.orderLevel" placeholder="Order level" step="1">
      
      <div class="label-group">
        <label>Age rating</label>
      </div>
      <select class="droplist field" v-model="form.ageRatingId">
        <option :value="null" :selected="!form.ageRatingId">None</option>
        <option v-for="(rating, index) in ageRatings" 
          :key="index" 
          :value="rating.id"
        >
          {{ rating.code }} - {{ rating.name }}
        </option>
      </select>
      
      <div class="label-group">
        <label>Guest allow</label>
      </div>
      <SelectorRadios2 
        v-model="form.guestAllow"
        :options="[
          { name: 'Inherit', value: null },
          { name: 'Hide',    value: false},
          { name: 'Visible', value: true},
      ]"/>

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
