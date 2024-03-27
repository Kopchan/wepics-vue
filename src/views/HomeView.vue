<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { vInfiniteScroll } from '@vueuse/components'
import { useDevicePixelRatio, watchThrottled } from '@vueuse/core'
import MasonryWall from '@yeger/vue-masonry-wall'

import { API_PATH } from '@/config'
import { fetchWrapper, sleep } from '@/helpers'
import { useAlbumParamsStore, useSettingsStore } from '@/stores'

// Параметры роутера и URL на альбом
const  { 
  targetAlbum, perPage, sort, isReverse 
} = storeToRefs(useAlbumParamsStore())

const getAlbumURL = (page) =>
  '/albums/'  + targetAlbum.value + 
  '/images?page=' +    page + 
  '&per_page=' +    perPage.value + 
  '&sort=' +           sort.value + 
  (isReverse.value ? '&reverse' : '')

const router = useRoute()
watchThrottled(() => router, () => {
  canLoadMore.value = false
  isLoading  .value = true
  images     .value = []
  currentPage = 1
  canLoadMore.value = true
}, {deep: true, throttle: 1000 })

// Косметические параметры и URL на превью
const { 
  size, isStrictSize, isRealSize, lines, gap, radius, orientation 
} = storeToRefs(useSettingsStore())
const { pixelRatio } = useDevicePixelRatio()
const realSize = ref(  isRealSize ? size : Math.round(realSize.value / pixelRatio.value) )
const  cssSize = ref( !isRealSize ? size : Math.round(realSize.value * pixelRatio.value) )
const getThumbURL = (hash) =>
  `${API_PATH}/albums/` +
  `${targetAlbum.value}/images/` +
  `${hash}/thumb/` +
  `${orientation.value}${realSize.value}`

watchThrottled(() => pixelRatio.value, () => {
  console.log('pixelRatio.value changed')

  if (!isRealSize) {
    cssSize.value = Math.round(realSize.value / pixelRatio.value)
    return
  }
  realSize.value = Math.round(cssSize.value * pixelRatio.value)
  images.value.forEach(element => {
    element.thumbURL = getThumbURL(element.hash)
  })
}, { throttle: 500 })

// Порционный запрос картинок
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
      
      const newImages = data.pictures
      newImages.forEach(element => {
        element.thumbURL = getThumbURL(element.hash)
      })
      
      images.value = [...images.value, ...data.pictures]
      isLoading.value = false
      currentPage++
    })
    .catch(async (error) => {
      switch (error.status) {
      case 404:
        canLoadMore.value = false
        alert(error.message) 
        // TODO: Сделать красивую страницу
        return
      case 403:
        canLoadMore.value = false
        alert(error.message) 
        // TODO: Вывсети окно входа (с инфой о заблокированном альбоме)
        return
      case 429:
        alert(error.message) 
        // TODO: Вывсети уведомление о частых запросов
        return
      case 500:
        await sleep(1000)
        return
      default:
        canLoadMore.value = false
        alert(error.message) 
      }
    }) 
}

// Перезагрузка превьюшек с ошибками
const maxRetries = 4
const retryCounts = ref({})
const onErrorImgLoad = async (event) => {
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
        class="grid"
        :items="images" 
        :column-width="cssSize" 
        :gap="gap"
        :max-columns="lines"
        :class="{strict: isStrictSize}">
        <template #default="{item}">
          <div class="grid-item">
            <img 
              loading="lazy" 
              :src="item.thumbURL" 
              :alt="item.name" 
              :width="cssSize" 
              :height="Math.round(cssSize / item.width * item.height)"
              @error="onErrorImgLoad">
          </div>
        </template>
      </MasonryWall>
      <div class="message message--download"
        v-if="isLoading">
        <p>Loading...</p>
      </div>
      <div class="message message--end"
        v-else-if="!isLoading && !canLoadMore && images">
        <p>End</p>
      </div>
      <div class="inf-handler-position" v-if="canLoadMore">
        <div style="min-height: 0; height: 3000px;"></div>
        <div v-infinite-scroll="[loadMore, {interval: 500}]"></div>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
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
  &.strict:deep(.masonry-column) {
    max-width: v-bind('cssSize + "px"');
  }
  .grid-item {
    height: auto;
    margin-bottom: -4px; // Костыль
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: v-bind('radius + "px"');
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
.inf-handler-position {
  position: absolute; 
  bottom: 0;
  height: 100%;
  display: flex;
  flex-direction: column-reverse;
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
