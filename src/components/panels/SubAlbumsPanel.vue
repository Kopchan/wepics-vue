<script setup>
import { toRefs, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { fetchWrapper } from '@/helpers'
import { useAlbumParamsStore } from '@/stores'

const props = defineProps({
  hash: String
})
const { hash } = toRefs(props)
const { targetAlbum, albumData } = storeToRefs(useAlbumParamsStore())

const isLoading = ref(true)
const isErrored = ref(false)
const subAlbumData = ref(null)
if (hash.value === targetAlbum.value) {
  isLoading.value = false
  subAlbumData.value = albumData.value
}
else fetchWrapper.get('/albums/' + hash.value)
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
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.gray {
  color: var(--c-t2a);
  font-size: 12px;
  display: flex;
  justify-content: space-between;
}
.badge {
  font-size: 12px;
  background-color: var(--c-t0);
  color: var(--c-b0);
  padding: 2px 5px;
  border-radius: var(--border-r);
}
button {
  background-color: var(--c-b0a);
}
</style>
