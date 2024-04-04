<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { vInfiniteScroll } from '@vueuse/components'
import { useDevicePixelRatio, useWindowSize, watchDebounced } from '@vueuse/core'
import MasonryWall from '@yeger/vue-masonry-wall'

import { API_PATH } from '@/config'
import { fetchWrapper, sleep, debounceImmediate } from '@/helpers'
import { useAlbumParamsStore, useSettingsStore } from '@/stores'
import { computed } from 'vue'

// Параметры роутера и URL на альбом
const  { 
  targetAlbum, perPage, sort, isReverse 
} = storeToRefs(useAlbumParamsStore())

const getAlbumURL = (page) =>
  '/albums/'  + targetAlbum.value + 
  '/images?page=' +    page       + 
  '&per_page=' +    perPage.value + 
  '&sort=' +           sort.value + 
  (isReverse.value ? '&reverse' : '')

const route = useRoute()
watch(
  () => route, 
  debounceImmediate(() => {
    canLoadMore.value = false
    isLoading  .value = false
    images     .value = []
    currentPage = 1
    canLoadMore.value = true
  }, 500), 
  {deep: true }
)

// Косметические параметры и URL на превью
const { 
  size, isStrictSize, isRealSize, lines, gap, radius, orientation 
} = storeToRefs(useSettingsStore())

const { pixelRatio } = useDevicePixelRatio()
const realSize = computed(() =>  isRealSize.value ? size.value : Math.round(size.value * pixelRatio.value) )
const  cssSize = computed(() => !isRealSize.value ? size.value : Math.round(size.value / pixelRatio.value) )

const allowedSizes = [144, 240, 360, 480, 720, 1080] // сортированный
const getAllowedSize = (size) => {
  for (const allowedSize of allowedSizes) {
    if (size <= allowedSize)
      return allowedSize
  }
  return allowedSizes.at(-1)
}
const refinedSize = computed(() => getAllowedSize(realSize.value))
const imgSign = ref(null)
const getThumbURL = (hash) => 
  `${API_PATH}/albums/` +
  `${targetAlbum.value}/images/` +
  `${hash}/thumb/` +
  `${orientation.value}${refinedSize.value}` +
  ( imgSign.value ? `?sign=${imgSign.value}` : '' )

const getThumbMultiURL = (hash) => {
  const srcsetItems = [] 
  for (const allowSize of allowedSizes) {
    const url =  
      `${API_PATH}/albums/` +
      `${targetAlbum.value}/images/` +
      `${hash}/thumb/` +
      `${orientation.value}${allowSize}` +
      ( imgSign.value ? `?sign=${imgSign.value}` : '' )

    srcsetItems.push(url +' '+ allowSize + orientation.value)
  }
  return srcsetItems.join(', ')
}
/*
watchThrottled(
  () => pixelRatio.value, 
  () => {
    if (!isRealSize) {
      console.log(`pixelRatio changed to ${pixelRatio.value}, change cssSize ${isRealSize ? 'true' : 'false'}`)
      cssSize.value = Math.round(realSize.value / pixelRatio.value)
      return
    }
    console.log('pixelRatio.value changed, change realSize from '+ realSize.value +' to...' +`${isRealSize ? 'true' : 'false'}` )
    realSize.value = Math.round(cssSize.value * pixelRatio.value)
    allowedRealSize.value = getAllowedSize()
    console.log(realSize.value +' and  '+ allowedRealSize.value)
    images.value.forEach(element => {
      element.thumbURL = getThumbURL(element.hash)
    })
  }, 
  { throttle: 500 })
*/
// Порционный запрос картинок
let currentPage = 1
const isLoading   = ref(null)
const canLoadMore = ref(true)
const images      = ref([])
const loadMore = async () => {
  if (!canLoadMore.value || isLoading.value) return
  isLoading.value = true

  await fetchWrapper.get(getAlbumURL(currentPage))
    .then((data) => {
      if (!canLoadMore.value) return
      canLoadMore.value = !(data.total < currentPage * perPage.value)

      imgSign.value = data.sign
      
      const newImages = data.pictures
      newImages.forEach(element => {
        element.thumbURL = getThumbURL(element.hash)
      })
      
      images.value = [...images.value, ...data.pictures]
      currentPage++
      isLoading.value = false
    })
    .catch(async (error) => {
      isLoading.value = false
      switch (error.status) {
      case 500:
        await sleep(1000)
        return
      case 429: // TODO: Вывсети уведомление о частых запросов
        alert(error.message) 
        return
      case 404: // TODO: Сделать красивую страницу
      case 403: // TODO: Вывсети окно входа (с инфой о заблокированном альбоме)
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
  // FIXME: не всегда срабатывает (второй раз?)
  const src = event.target.attributes.src.value 
  retryCounts.value[src] ||= 0
  
  if (retryCounts.value[src] <= maxRetries) {
    await sleep(1000)
    retryCounts.value[src]++
    event.src = event.src + ''
  }
}
const columnWidth = ref(cssSize.value)
const masonryWall = ref(null)
const windowWidth = useWindowSize().width

onMounted(async () => {
  await sleep(1000)
  watchDebounced(
    () => windowWidth.value, 
    () => {
      const columnSize = masonryWall.value?.$el?.children[0]?.clientWidth
      columnWidth.value = Math.round(columnSize) || cssSize.value
    },
    { deep: true, immediate: true, debounce: 500 }
  )
})
</script>

<template>
  <main>
    <div class="grid_outer">
      <!-- DEBUG
      <button @click="console.log({
        sizeNew,
        size, 
        cssSize, 
        lines,
        gap,
        settings,
      })">
        get values
      </button>
      -->
      <MasonryWall 
        class="grid"
        ref="masonryWall"
        :items="images" 
        :column-width="cssSize" 
        :gap="gap"
        :min-columns="lines"
        :max-columns="lines"
        :class="{strict: isStrictSize}">
        <template #default="{item}">
          <div class="grid-item">
            <img 
              :loading="currentPage != 1 ? 'lazy' : undefined" 
              :src="item.thumbURL"
              :srcset="getThumbMultiURL(item.hash)"
              :sizes="columnWidth +'px'"
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
        v-else-if="!isLoading && !canLoadMore && images.length">
        <p>End</p>
      </div>
      <div class="inf-handler-position" v-if="canLoadMore && !isLoading">
        <div style="height: 1px" v-infinite-scroll="[loadMore, {interval: 500}]"></div>
        <div style="min-height: 0; height: 3000px;"></div>
        <div style="height: 1px" v-infinite-scroll="[loadMore, {interval: 500}]"></div>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.grid {
  justify-content: center;
  margin: 0 auto;
  &.strict:deep(.masonry-column) {
    max-width: v-bind('cssSize + "px"');
  }
  &_outer {
    //transition: margin 0.1s, left 0.1s;
    padding: calc(var(--header-height) + 1px) v-bind('gap + "px"') v-bind('gap + "px"');
    overflow-x: hidden;
    transition: 0.1s;
    position: relative;
  }
  &-item {
    border-radius: v-bind('radius + "px"');
    &:hover {
      background: var(--c-b2);
      outline: 1px solid;
      .info {
        display: block;
      }
    }
    img {
      border-radius: v-bind('radius + "px"');
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      &:before { // TODO: Доделать блок незагруженной картинки
        content: '';
        background: var(--c-b2);
        width: 100%;
        height: 200px;
        top: 0;
        left: 0;
      }
    }
    .info {
      padding: 10px;
      position: absolute;
      top: 100%;
      @media (hover: hover) and (pointer: fine) {
        display: none;
      }
      p {
        text-overflow: ellipsis;
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
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
/*
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
*/
</style>
