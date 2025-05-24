<script setup>
import { computed, onMounted, ref, toRefs } from 'vue'
import { fetchWrapper, sleep } from '@/helpers'
import { storeToRefs } from 'pinia'
import { useServerSetupsStore } from '@/stores'
import { urls } from '@/api'
import { SelectorRadios2 } from '@/components/ui'
import { InputFormItem, SelectFormItem, RadioBtnsFormItem } from '@/components/form'

// Параметры компонента
const props = defineProps({
  overlay: Object,
})

// Параметры компонента в переменные
const { overlay } = toRefs(props)

// v-model компонента
const album = defineModel()

const isFetching = ref(false) // Статус "данные отправляются"
const error = ref(null) // Ошибка
const form = ref({})        // Данные для отправки

const inputBox = ref(null)

      
if (album.value?.path) {
  const parts = album.value.path?.split(/[\\/]/)
  form.value.pathName = parts[parts?.length - 2]
}

form.value.displayName = album.value?.name
form.value.urlName     = album.value?.alias
form.value.oldUrlNames = album.value?.oldAliases
form.value.ageRatingId = album.value?.ratingId   ?? null
form.value.orderLevel  = album.value?.orderLevel ?? 0
form.value.guestAllow  = album.value?.guestAllow ?? null

// Параметры предустановок
const { ageRatings } = storeToRefs(useServerSetupsStore())

const ratingOptions = computed(() => {
  const options = {}
  options['None'] = null

  if (ageRatings.value?.length)
    for (const rating of ageRatings.value)
      options[`${rating.code} - ${rating.name}`] = rating.id
  
  return options
})

// Переключатель видимости для гостей
const guestAllowOptions = [
  { name: 'Inherit', value: null },
  { name: 'Hide',    value: false},
  { name: 'Visible', value: true},
]

// Переименование альбома
const editAlbum = () => {
  isFetching.value = true
  error.value = null

  fetchWrapper.patch(urls.album(album.value.hash), form.value)
    .then(data => {
      Object.assign(album.value, data)
      album.value.oldUrlNames = form.value.oldUrlNames
      
      if (album.value?.path) {
        const parts = album.value.path?.split(/[\\/]/)
        parts[parts?.length - 2] = form.value?.pathName
        album.value.path = parts.join('/')
      }
      isFetching.value = false
      error.value = null
      overlay.value?.hide()
    })
    .catch(err => {
      isFetching.value = false
      error.value = err
      console.error(err)
    })
}

onMounted(async () => {
  await sleep(10)
  if (inputBox.value) 
    inputBox.value.focus()
})
</script>

<template>
  <div class="outer">
    <h4>Edit</h4>
    <form @submit.prevent="editAlbum">
      <InputFormItem     v-model="form" :error="error" name="displayName" label="Display name"              placeholder="Album custom display name"/>
      <InputFormItem     v-model="form" :error="error" name="urlName"     label="URL name (alias)"          placeholder="Album url path name"/>
      <InputFormItem     v-model="form" :error="error" name="pathName"    label="Internal folder name"      placeholder="Album internal folder path name"/>
      <InputFormItem     v-model="form" :error="error" name="orderLevel"  label="Order level (ignore sort)" placeholder="Order level" type="number" :step="1"/>
      <SelectFormItem    v-model="form" :error="error" name="ageRatingId" label="Age rating"  :options=    "ratingOptions"/>
      <RadioBtnsFormItem v-model="form" :error="error" name="guestAllow"  label="Guest allow" :options="guestAllowOptions"/>

      <button class="btn" :disable="isFetching">
        {{ isFetching ? 'Saving...' : 'Save' }}
      </button>
    </form>
    <div v-if="error" class="error">
      <p v-if="error?.message">{{ error.message }}</p>
      <p v-else>Something going wrong</p>
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
.btn {
  background-color: var(--c-b0a);
  width: 100%;
}
.error {
  background-color: var(--red-bg);
  padding: 10px;
  border-radius: var(--border-r);
}
</style>
