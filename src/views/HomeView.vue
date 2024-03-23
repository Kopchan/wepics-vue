<script setup>
import { ref } from 'vue'
import { vInfiniteScroll } from '@vueuse/components'
import { fetchWrapper } from '@/helpers/fetch-wrapper'
import { API_PATH } from '@/config'
import MasonryWall from '@yeger/vue-masonry-wall'

const targetAlbum = 'root'
const perPage = 5
const sort = 'width'
const isReverse = true

function getAlbumURL(page) {
  return `/albums/${targetAlbum}` + 
    `/images?page=${page}` + 
    `&per_page=${perPage}` + 
    `&sort=${sort}` + 
    `${isReverse ? '&reverse' : null}`
}

const orien = 'w'
const size = 400

function getThumbURL(hash) {
  return `${API_PATH}/albums/` +
    `${targetAlbum}/images/` +
    `${hash}/thumb/` +
    `${orien}${size}`
}

const isLoading = ref(null)
const canLoadMore = ref(true)
const images = ref([])

let currentPage = 1

async function onLoadMore() {
  if (!canLoadMore.value) return
  isLoading.value = true

  await fetchWrapper.get(getAlbumURL(currentPage))
    .then((data) => {
      canLoadMore.value = !(data.total < currentPage * perPage)
      images.value = [...images.value, ...data.pictures]
      isLoading.value = false

      console.log([
        data.total,
        currentPage,
        perPage,
        canLoadMore.value,
      ])
      
      currentPage++
    })
  
}
</script>

<template>
  <main>
    <div class="grid_outer">
      <MasonryWall 
        :items="images" 
        :column-width="size" 
        :gap="8" 
        class="grid"
        v-infinite-scroll="[onLoadMore, { distance: 0, throttle: 250, canLoadMore: () => canLoadMore }]">
        <template #default="{item}">
          <div class="grid-item">
            <img 
              loading="lazy" 
              :src="getThumbURL(item.hash)" 
              :alt="item.name" 
              :width="size" 
              :height="`${Math.round(size / item.width * item.height)}`">
          </div>
        </template>
      </MasonryWall>
      <button @click="onLoadMore">MORE</button>
      <div v-if="isLoading">
        <p>Загрузка...</p>
      </div>
    </div>
  </main>
</template>

<style lang="scss">
.grid_outer {
  //transition: margin 0.1s, left 0.1s;
  padding: var(--header-height) var(--cards-gap) 0;
  overflow-x: hidden;
  transition: 0.1s;
}
body.sidebar--resize-active .grid_outer {
  transition: none;
}
.grid {
  justify-content: center;
  margin: 0 auto;
  .masonry-column {
    max-width: var(--card-width);
  }
  .grid-item {
    width: var(--card-width);
    height: auto;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: calc(var(--border-r) * 2);
    }
  }
}
body.sidebar--open.sidebar--pin .grid_outer {
}
/*  = =  Кладка картинок-карточек (горизонтально)  = =  */
body.grid--horizontal {
  body.sidebar--open.sidebar--pin .grid_outer {
  }
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
