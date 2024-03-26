<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { API_PATH } from '@/config'
import { fetchWrapper, sleep } from '@/helpers'
import { vInfiniteScroll } from '@vueuse/components'
import MasonryWall from '@yeger/vue-masonry-wall'

const router = useRoute()


const targetAlbum = ref(router.params?.albumHash || 'root')
const perPage     = ref(router.query ?.perPage   ||    30 )
const sort        = ref(router.query ?.sort      || 'name')
const isReverse   = ref(router.query ?.reverse   === null )
const getAlbumURL = (page) =>
  '/albums/'  + targetAlbum.value + 
  '/images?page=' +    page + 
  '&per_page=' +    perPage.value + 
  '&sort=' +           sort.value + 
  (isReverse.value ? '&reverse' : '')

const orien = 'w'
const size = 400
const getThumbURL = (hash) =>  
  `${API_PATH}/albums/` +
  `${targetAlbum.value}/images/` +
  `${hash}/thumb/` +
  `${orien}${size}`

let currentPage = 1
const isLoading   = ref(null)
const canLoadMore = ref(true)
const images      = ref([])
const loadMore = async () => {
  if (!canLoadMore.value) return
  isLoading.value = true

  await fetchWrapper.get(getAlbumURL(currentPage))
    .then((data) => {
      if (!canLoadMore.value) return
      canLoadMore.value = !(data.total < currentPage * perPage.value)
      images.value = [...images.value, ...data.pictures]
      isLoading.value = false
      currentPage++
    })
    .catch((error) => {
      if (error.status == 404) {
        canLoadMore.value = false
        alert(error.message) 
        // TODO: Сделать красивую страницу
      }
      if (error.status == 403) {
        canLoadMore.value = false
        alert(error.message) 
        // TODO: Вывсети окно входа (с инфой о заблокированном альбоме)
      }
    }) 
}

watch(() => router, () => {
  canLoadMore.value = false
  images     .value = []
  isLoading  .value = true
  targetAlbum.value = router.params?.albumHash || 'root' 
  perPage    .value = router.query ?.perPage   ||    30
  sort       .value = router.query ?.sort      || 'name' 
  isReverse  .value = router.query ?.reverse === null

  currentPage = 1
  canLoadMore.value = true
}, {deep: true})

const maxRetries = 4
const retryCounts = ref({})

async function onErrorImgLoad(event) {
  const src = event.target.attributes.src.value
  retryCounts.value[src] ||= 0

  if (retryCounts.value[src] <= maxRetries) {
    await sleep(1000)
    retryCounts.value[src]++
    event.src = event.src + ''
  }
}
</script>

<template>
  <main>
    <div class="grid_outer">
      <MasonryWall 
        :items="images" 
        :column-width="size" 
        :gap="8"
        class="grid">
        <template #default="{item}">
          <div class="grid-item">
            <img 
              loading="lazy" 
              :src="getThumbURL(item.hash)" 
              :alt="item.name" 
              :width="size" 
              :height="Math.round(size / item.width * item.height)"
              @error="onErrorImgLoad">
          </div>
        </template>
      </MasonryWall>
      <div 
        v-if="isLoading"
        class="message message--download">
        <p>Loading...</p>
      </div>
      <div 
        v-else-if="!isLoading && !canLoadMore && images"
        class="message message--end">
        <p>End</p>
      </div>
      <div style="
          position: absolute; 
          bottom: 0;
          height: 100%;
          display: flex;
          flex-direction: column-reverse;
        ">
        <div style="min-height: 0; height: 2000px;"></div>
        <div
          v-if="canLoadMore"
          v-infinite-scroll="[loadMore, {interval: 500}]">
        </div>
      </div>
    </div>
  </main>
</template>

/*
style="position: absolute; bottom: 100vh"
*/

<style lang="scss">
.grid_outer {
  //transition: margin 0.1s, left 0.1s;
  padding: var(--header-height) var(--cards-gap) 0;
  overflow-x: hidden;
  transition: 0.1s;
  position: relative;
}
.grid {
  justify-content: center;
  margin: 0 auto;
  padding-bottom: 4px; // Костыль
  .masonry-column {
    max-width: var(--card-width);
  }
  .grid-item {
    width: var(--card-width);
    height: auto;
    margin-bottom: -4px; // Костыль
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: calc(var(--border-r) * 2);
      &:before { // TODO: Доделать блок незагруженной картинки
        content: '';
        background: var(--c-b2);
        width: 100%;
        height: 200px;
        top: 0;
        left: 0;
      }
    }
  }
}
.message {
    margin: 0 auto;
    width: 150px;
    background: var(--c-b2);
    border-radius: var(--border-r);
    text-align: center;
  p {
    padding: 10px 0;
  }
  &--download {
    position: fixed;
    bottom: 32px;
    background: var(--c-b2a);
    backdrop-filter: blur(var(--div-blur));
    bottom: 16px;
    left: 0;
    right: 0;
    margin: 0 auto;
  }
  &--end {
    margin: 20px auto;
    background: var(--c-b2);
  }
}

/*  = =  Кладка картинок-карточек (горизонтально)  = =  */
body.grid--horizontal {
  .grid_outer {
    position: fixed;
    top:   0;
    left:  0;
    right: 0;
    box-sizing: border-box;
    height: 100%;
    margin: 0;
    overflow-x: unset;
    overflow-y: hidden;
    padding: var(--header-height) 0 var(--cards-gap) var(--cards-gap);
  }
  .grid {
    margin: 0;
    height: 100%;
    &-item {
      margin-bottom: 0;
      width: auto;
      height: var(--card-width);
      margin-right: var(--cards-gap);
    }
  }
}
</style>
