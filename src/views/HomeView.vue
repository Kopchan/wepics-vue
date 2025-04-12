<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { vInfiniteScroll } from '@vueuse/components'
import OverlayPanel from 'primevue/overlaypanel'
import { SmilePlusIcon, DownloadIcon, FoldersIcon, ImagesIcon } from 'lucide-vue-next'

import { urls } from '@/api'
import { fetchWrapper, sleep, debounceImmediate, humanFileSize } from '@/helpers'
import { useAlbumParamsStore, useSettingsStore, useAuthStore } from '@/stores'
import { AuthPanel } from '@/components/panels'
import { ImageViewer } from '@/components'
import AlbumsLines from '@/components/AlbumsLines.vue'
import { getThumbMultiURL } from '@/helpers/thumb'

// Параметры в ссылке
const  {
  targetAlbum, targetImage, albumData, limit, sort, isReverse, tags, nested
} = storeToRefs(useAlbumParamsStore())
  
const route = useRoute()
// Функция очистки всех картинок
const cleanUpWall = () => {
  canLoadMore.value = false
  isLoading  .value = false
  images     .value = []
  retries = 0
  imgRetryCounts.value = {}
  currentPage = 1
  canLoadMore.value = true
}
// Наблюдение за изменением в роуте, если они есть, то перезагружаются картинки
watch(
  () => route,
  debounceImmediate(() => {
    if (isLoading.value) watch(
      () => isLoading.value, 
      cleanUpWall, 
      { once: true }
    )
    else 
      cleanUpWall()
  }, 500),
  { deep: true }
)

// Косметические параметры и URL на превью
const {
  size, gap, extGap, radius, orientation, scroll, ambient, albumsLayout, lineWidth, albumPreviewSize
} = storeToRefs(useSettingsStore())

const imgSign = ref(null)

// Порционный запрос картинок
let currentPage = 1
let retries = 0
const isLoading   = ref(null)
const canLoadMore = ref(true)
const images      = ref([])
const loadMore = async () => {
  if (!canLoadMore.value || isLoading.value) return
  isLoading.value = true

  await fetchWrapper.get(
    urls.albumImages(targetAlbum.value, {
      page: currentPage, 
      limit: limit.value,
      tags: tags.value,
      sort: sort.value,
      isReverse: isReverse.value,
      nested: nested.value,
    })
  ).then((data) => {
    if (!canLoadMore.value) return
    canLoadMore.value = !(data.total < currentPage * limit.value)

    imgSign.value = data.sign
   
    const newImages = data.pictures
    newImages.forEach(element => {
      const parts = element.name.split('.')
      element.ext = parts.length === 1 ? 'no ext' : parts.at(-1)
      element.name = parts.slice(0, -1).join('.')
      element.ratio = element.width / element.height
      element.thumbURL = element.ext != 'gif'
        ? urls.imageThumb(element?.album?.hash ?? targetAlbum.value, element.hash, element?.album?.sign ?? imgSign.value, orientation.value, size.value) 
        : urls.imageOrig (element?.album?.hash ?? targetAlbum.value, element.hash, element?.album?.sign ?? imgSign.value) 
    })

    // FIXME: Сжирает производительность как чудовище, но нужно для @yeger/vue-masonry-wall
    //images.value = images.value.concat(data.pictures)

    images.value.push(...newImages)

    currentPage++
    isLoading.value = false
  }).catch(async (error) => {
    isLoading.value = false
    switch (error.status) {
    case 500:
    case 504:
      retries++
      if (retries > 10000) canLoadMore.value = false
      await sleep(1000)
      return
    case 429: // TODO: Вывести уведомление о частых запросов
      alert(error.message)
      return
    case 404:
      //router.replaceView(PageNotExist)
      canLoadMore.value = false
      alert(error.message || 'Not Found')
      return // TODO: Сделать красивую страницу
    case 403: // TODO: Вывести окно входа (с инфой о заблокированном альбоме)
    default:
      retries++
      if (retries > 10000) canLoadMore.value = false
      await sleep(1000)
      return
    }
  })
}

// Перезагрузка превьюшек с ошибками
const maxImgRetries = 4
const imgRetryCounts = ref({})
const onErrorImgLoad = async (event) => {
  // FIXME: не всегда срабатывает (второй раз?)
  const src = event.target.attributes.src.value
  imgRetryCounts.value[src] ||= 0
 
  if (imgRetryCounts.value[src] <= maxImgRetries) {
    await sleep(1000)
    imgRetryCounts.value[src]++
    event.src = event.src + ''
  }
}

const downloadOriginal = (img) =>
  window.location.href = urls.imageDownload(img.album?.hash ?? targetAlbum.value, img.hash, img.album?.sign ?? imgSign.value)

// Получение разрешённых реакций
const allowedReactions = ref(null)
fetchWrapper.get(urls.reactions()).then(data => 
  allowedReactions.value = data.map(el => el.value)
)

const authCard = ref()
const toggleAuthCard = (e) => authCard.value.toggle(e)

// Загрузчик оригинала картинки
const { user } = storeToRefs(useAuthStore())
// Переключение реакции на картинке
const toggleReaction = (image, reaction, e) => {
  if (!user.value.token) {
    toggleAuthCard(e)
    return
  }
  const isYouSetted = image.reactions?.[reaction]?.isYouSet || false

  fetchWrapper[isYouSetted ? 'delete' : 'post'](
    urls.imageReaction(targetAlbum.value, image.hash, reaction)
  ).then(() => {
    if (!image.reactions)
      image.reactions = {}
    
    if (!image.reactions[reaction])
      image.reactions[reaction] = {
        isYouSet: !isYouSetted,
        count: isYouSetted ? -1 : 1,
      }
    else {
      image.reactions[reaction].isYouSet = !isYouSetted
      image.reactions[reaction].count += isYouSetted ? -1 : 1
    }
  })
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

watch(targetImage, () => scroll.value = !(targetImage.value != null))

</script>

<template>
  <main>
    <div class="grid_outer">
      <section class="albums" v-if="albumData?.children">
        <AlbumsLines :album="albumData" v-if="albumsLayout == 'lines'"/>
        <div class="grid" v-else-if="albumsLayout == 'grid'">
          <RouterLink 
            v-for="(childParams, childName) in albumData?.children" 
            :key="childName"
            :to="{ path: '/album/'+childParams.hash, query: $route.query }"
            class="square">
            <div class="previews">
              <img 
                v-for="img in childParams?.images?.slice(0, 4)" 
                :key="img"
                :src="getThumbUrlOnAlbum(childParams, img, albumPreviewSize)" 
                alt="" 
                loading="lazy"
                @error="onErrorImgLoad"
              >
            </div>
            <div class="overlay">
              <div class="center">
                <div class="block">
                  <p class="name">{{ childName }}</p>
                  <div class="inline" v-if="childParams.albums_count">
                    <FoldersIcon size="16"/>
                    <span>{{ childParams.albums_count }}</span>
                  </div>
                  <div class="inline" v-if="childParams.images_count">
                    <ImagesIcon size="16"/>
                    <span>{{ childParams.images_count }}</span>
                  </div>
                  <span class="text" v-if="!childParams.albums_count && !childParams.images_count">EMPTY</span>
                  <span class="text" v-if="!childParams.last_indexation">NOT INDEXED</span>
                </div>
              </div>
            </div>
          </RouterLink>
        </div>
      </section>
      <section class="wall" :style="'--size:'+ size">
        <div 
          v-for="img in images" 
          :key="img" 
          class="img"
          :style="'--ratio:'+ img.ratio">

          <i></i>
          <img 
            :src="img.thumbURL" 
            alt="" 
            loading="lazy"
            @error="onErrorImgLoad"
            :srcset="img.ext != 'gif' 
            ? getThumbMultiURL(img?.album?.hash ?? targetAlbum, img, img?.album?.sign ?? imgSign) 
            : undefined
            ">

          <div class="reactions">
            <template 
              v-for="(reactionParams, reaction) in img.reactions" 
              :key="reaction">
              <div 
                v-if="reactionParams.count > 0"
                class="reaction"
                :class="{setted: reactionParams.isYouSet}"
                @click.stop="toggleReaction(img, reactionParams, $event)">
                {{ reaction }}
                {{ reactionParams.count }}
              </div>
            </template>
          </div>
          
          <div class="overlay" @click="targetImage = img">
            <div class="top-group">
              <span class="name">{{ img.name }}</span>
              <div class="badges">
                <span class="badge up">{{ img.ext }}</span>
                <span class="badge">{{ formatDate(img.date) }}</span>
                <span class="badge">{{ img.width }}×{{ img.height }}</span>
                <RouterLink 
                  v-if="img.album?.name && img.album?.hash != targetAlbum" 
                  class="badge wide" 
                  :to="{ path: '/album/'+img.album?.hash, query: $route.query }" @click.stop>
                  {{ img.album?.name }}
                </RouterLink>
              </div>
            </div>

            <div class="bottom-group">
              <input @click.stop type="checkbox" :id="img.hash" @change="checkboxChange" >
              <label @click.stop
                v-if="user.token"
                class="btn btn--reaction"
                :for="img.hash">
                  <div class="options">
                  <label 
                    :for="img.hash"
                    :key="option"
                    :class="{'btn--inverse': img?.reactions?.[option]?.isYouSet}"
                    class="btn btn--circle option"
                    v-for="option in allowedReactions"
                    @click.stop="toggleReaction(img, option, $event)">
                    {{ option }}
                  </label>
                </div>
                <SmilePlusIcon size="20"/>
              </label>

              <button class="btn btn--download" @click.stop="downloadOriginal(img)">
                <span class="size">{{ humanFileSize(img.size) }}</span>
                <DownloadIcon size="20"/>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div class="message message--download"
        v-if="isLoading">
        <p>Loading...</p>
      </div>
      <div class="message message--end"
        v-else-if="!isLoading && !canLoadMore && images.length">
        <p>End</p>
      </div>
      <div class="inf-handler-position" v-if="canLoadMore && !isLoading">
        <!-- 
          // FIXME: Если пользователь опустится моментально в самый низ и экран по высоте будет меньше
                    3000px, то подгружаться будет если опустится в самый конец 
        -->
        <div style="height: 1px" v-infinite-scroll="[loadMore, {interval: 500}]"></div>
        <div style="min-height: 0; height: 3000px;"></div>
        <div style="height: 1px" v-infinite-scroll="[loadMore, {interval: 500}]"></div>
      </div>
    </div>
    
    <OverlayPanel ref="authCard" class="popup popup--fixed">
      <AuthPanel/>
    </OverlayPanel>

    <ImageViewer 
      v-if="targetImage" 
      :album="targetAlbum" 
      :image.sync="targetImage" 
      :sign="imgSign"
      @targetImage="t => targetImage = t"
    />
  </main>
</template>

<style lang="scss" scoped>
.grid_outer {
  padding: calc(var(--header-height) + 1px) v-bind('extGap ? (gap +"px") : 0') v-bind('gap +"px"');
  overflow-x: hidden;
  transition: 0.1s;
  position: relative;
  min-height: calc(100vh - var(--header-height) - v-bind('gap +"px"') - 1px);
  .grid {
    justify-content: center;
    margin: 0 auto;
  }
}

.inf-handler-position {
  position: absolute;
  bottom: 0;
  height: 100%;
  display: flex;
  flex-direction: column-reverse;
}


.albums {
  .lines {
    display: grid;
    grid-template-columns: v-bind("lineWidth ? 'repeat(auto-fill, minmax(min(100%,'+ lineWidth +'px), 1fr))' : '100%'");
    gap: v-bind('gap +"px"');
    padding-bottom: v-bind('gap * 2 +"px"');
    width: 100%;
    .hidden-link {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1;
    }
    .line {
      max-width: 100%;
      background-color: var(--c-b2a);
      border-radius: v-bind('radius +"px"');
      text-decoration: none;
      position: relative;
      z-index: 2;
      &.expanded {
        grid-column: 1 / -1;
        .rotate {
          rotate: 180deg;
        }
      }
      .title {
        display: flex;
        min-height: 40px;
        gap: 10px;
        padding: v-bind('gap / 2 +"px"');
        padding-bottom: 0;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        .name {
          color: var(--c-t0);
          font-size: 24px;
          padding: 0;
          min-width:0;
          margin: 0;
          //align-self: flex-start;
          text-align: center;
          font-weight: 200;
          padding-left: 10px;
        }
        .params {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-content: center;
        }
        .inline {
          display: flex;
          justify-items: center;
          align-items: center;
          gap: 2px;
          text-align: center;
          color: var(--c-t2a);
        }
        .btn {
          height: 40px;
          width: 40px;
          z-index: 10;
          position: relative;
        }
      }
      &:hover:not(:has(.previews:hover)):not(:has(.btn:hover)) {
        background-color: var(--c-b4a);
        z-index: 1;
        filter: v-bind('ambient ? "url(#ambient-light)" : "unset"');
        .overlay .block {
          background-color: transparent !important;
          backdrop-filter: none !important;
          box-shadow: unset !important;
        }
      }
      &:active:not(:has(.previews:hover)):not(:has(.btn:hover)) {
        background-color: var(--c-b4);
      }
      .previews {
        display: flex;
        overflow-y: auto;
        justify-items: center;
        align-items: center;
        gap:     v-bind('gap / 2 +"px"');
        padding: v-bind('gap / 2 +"px"');
        height:  v-bind('size / 2 +"px"');
        z-index: 10;
        position: relative;
        .img-wrapper {
          height: 100%;
          width: auto;
          position: relative;
          &.blur:after {
            position: absolute;
            content: '';
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            backdrop-filter: blur(24px);
            overflow: hidden;
            border-radius: v-bind('radius +"px"');
          }
          &:active:after {
            backdrop-filter: unset;
          }
        }
        img {
          height: 100%;
          width: auto;
          object-fit: cover;
          border-radius: v-bind('radius +"px"');
          &:hover {
            //filter: v-bind('ambient ? "url(#ambient-light)" : "unset"');
            // z-index: 1;

            outline : 1px solid var(--c-t0a);
            z-index: 9;
          }
        }
        .more {
          border-radius: v-bind('radius +"px"');
          height: 100%;
          aspect-ratio: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          color: var(--c-t0);
          background: var(--c-b2a);
          &:hover {
            background: var(--c-b2);
          }
          &:active {
            background: var(--c-b4a);
          }
        }
      }
      .messages {
        padding: calc(v-bind('gap / 2 +"px"') + 10px);
        .text {
          color: var(--c-t2a);
          //justify-self: end;
          //align-self: last baseline;
        }
      }
    }
  } 

  
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(v-bind('size / 2 +"px"'), 1fr));
    padding-bottom: v-bind('gap * 2 +"px"');
    gap: v-bind('gap + "px"');
    .square {
      background-color: var(--c-b2a);
      aspect-ratio: 1 / 1;
      border-radius: v-bind('radius +"px"');
      position: relative;
      z-index: 3;
      &:hover {
        background-color: var(--c-b4a);
        filter: v-bind('ambient ? "url(#ambient-light)" : "unset"');
        img {
          z-index: 2;
        }
        .overlay .block {
          background-color: transparent !important;
          backdrop-filter: none !important;
          box-shadow: unset !important;
        }
      }
      &:active {
        background-color: var(--c-b4);
      }
      .previews {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows:    repeat(2, 1fr);
        padding: 10px;
        gap: 6px;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 6px;
          aspect-ratio: 1 / 1;
        }
      }
      .overlay {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        .center {
          height: 100%;
          display: grid;
          align-content: center;
          justify-items: center;
          .block {
            background: var(--c-b2a);
            backdrop-filter: blur(var(--div-blur));
            box-shadow: #0006 0px 10px 20px;
            padding: 6px 16px;
            overflow: hidden;
            border-radius: 8px;
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
            justify-content: center;
            align-content: center;
            p {
              color: var(--c-t0);
              font-size: 24px;
              padding: 0;
              min-width:0;
              margin: 0;
              text-align: center;
            }
            .text {
              color: var(--c-t2a);
              justify-self: end;
              align-self: last baseline;
              padding: 1px
            }
            .inline {
              display: flex;
              justify-items: center;
              align-items: center;
              gap: 2px;
              color: var(--c-t0);
              text-align: center;
              color: var(--c-t2a);
            }
          }
        }
      }
    }
  } 
}


.wall {
  display: flex;
  flex-wrap: wrap;
  gap: v-bind('gap +"px"');
  &:after {
    content: '';
    flex-grow: 1e4;
    //min-width: 20%;
  }
  .img {
    position: relative;
    width:     calc(var(--ratio) * var(--size) * 1px);
    flex-grow: calc(var(--ratio) * var(--size));
    &:hover {
      border-radius: v-bind('radius * 2 +"px"');
      .reactions {
        opacity: 0;
      }
      .overlay {
        opacity: 1;
        border: 1px solid v-bind('ambient ? "transparent" : "var(--c-t0a)"');
      }
      img {
        z-index: -1;
        filter: v-bind('ambient ? "url(#ambient-light)" : "unset"');
      }
    }
    i {
      display: block;
      padding-bottom: calc(1 / var(--ratio) * 100%)
    }
    img {
      position: absolute;
      top: 0;
      width: 100%;
      vertical-align: bottom;
      border-radius: v-bind('radius +"px"');
    }
    .reactions {
      transition: opacity .2s;
      position: absolute;
      padding: 6px; 
      display: flex;
      flex-wrap: wrap-reverse;
      gap: 6px;
      bottom: 0;
      right: 0;
      left: 0;
      .reaction {
        background-color: var(--c-b0a);
        height: 24px;
        padding: 2px 8px;
        border-radius: 24px;
        &.setted {
          background-color: var(--c-t0);
          color: var(--c-b0);
        }
      }
    }
    .overlay {
      z-index: 20;
      border-radius: v-bind('radius +"px"');
      //display: none;
      display: flex;
      opacity: 0;
      transition: opacity .2s, border .2s;
      position: absolute;
      bottom: 0;
      right: 0;
      left: 0;
      top: 0;
      border: 1px solid transparent;
      padding: calc(v-bind('radius +"px"') / 4 + 6px);
      flex-direction: column;
      justify-content: space-between;
      .top-group {
        display: flex;
        //justify-content: end;
        flex-wrap: wrap;
        justify-content: space-between;
        filter:
          drop-shadow(0 0 10px #000) 
          drop-shadow(0 0 3px #000);
        .name {
          justify-self: flex-start;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          color: #fff;
        }
        .badges {
          display: flex;
          gap: 6px;
          align-items: flex-start; 
          flex-wrap: wrap;
        }
        .badge {
          flex-grow: 0;
          font-size: 10px;
          padding: 2px 4px;
          background-color: #fffa;
          border-radius: var(--border-r);
          color: #000;
          display: flex;
          justify-items: center;
          align-items: center;
        }
        .up {
          text-transform: uppercase;
        }
        .wide {
          padding: 2px 8px;
          font-weight: bold;
        }
      }
      .bottom-group {
        display: flex;
        align-items: flex-end;
        gap: 6px;
        height: calc(100% - 32px);
        input[type='checkbox'] {
          position: absolute;
          z-index: -1;
          opacity: 0;
        }
        .btn--reaction {
          transition: background 0s, color 0s;
          backdrop-filter: none;
          height: unset;
          min-height: 32px;
          min-width: 32px;
          max-height: 100%;
          padding: 0;
          color: #fff;
          flex-direction: column;
          filter:
            drop-shadow(0 0 10px #000) 
            drop-shadow(0 0 3px #000);
          .options {
            transition: .5s;
            display: flex;
            flex-direction: column;
            max-height: 0;
            opacity: 0;
            gap: 8px;
            overflow-x: auto;
          }
          .lucide {
            min-height: 20px;
            margin: 8px;
          }
          &:hover,
          &:active {
            transition: background .2s, color .2s;
            background-color: var(--c-b0a);
            color: var(--c-t0);
            backdrop-filter: blur(var(--div-blur));
            filter: none;
            &:active {
              background-color: var(--c-b0);
              color: var(--c-t0);
            }
          }
          &:active {
            background-color: var(--c-b0);
            color: var(--c-t0);
          }
        }
        input[type='checkbox']:checked + .btn--reaction {
          background-color: var(--c-b0a);
          color: var(--c-t0);
          backdrop-filter: blur(var(--div-blur));
          filter: none;
          .options {
            max-height: 500px;
            opacity: unset;
          }
        }
        .btn--download {
          transition: background 0s, color 0s;
          margin-left: auto;
          font-size: 14px;
          color: #fff;
          backdrop-filter: none;
          gap: 6px;
          filter:
            drop-shadow(0 0 10px #000) 
            drop-shadow(0 0 3px #000);
          .size {
            color: transparent;
            transition: max-width .5s;
            max-width: 0;
            opacity: 0;
            overflow: hidden;
            text-wrap: nowrap;
          }
          &:hover,
          &:active {
            transition: background .2s, color .2s;
            background-color: var(--c-b0a);
            backdrop-filter: blur(var(--div-blur));
            color: var(--c-t0);
            filter: unset;
            &:active {
              background-color: var(--c-b0);
            }
            .size {
              transition: max-width .5s, color .5s;
              color: var(--c-t0);
              max-width: 150px;
              opacity: unset;
            }
          }
        }
      }
    }
  }
}
.message {
    margin: 0 auto;
    width: 150px;
    background-color: var(--c-b2);
    border-radius: var(--border-r);
    text-align: center;
  p {
    padding: 10px 0;
  }
  &--download {
    position: fixed;
    bottom: 32px;
    background-color: var(--c-b2a);
    backdrop-filter: blur(var(--div-blur));
    bottom: 16px;
    left: 0;
    right: 0;
    margin: 0 auto;
  }
  &--end {
    margin: 20px auto;
    background-color: var(--c-b2);
  }
}
</style>
