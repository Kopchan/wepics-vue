<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { vInfiniteScroll } from '@vueuse/components'
import OverlayPanel from 'primevue/overlaypanel'
import { SmilePlusIcon, DownloadIcon } from '@lucide/vue'

import { urls } from '@/api'
import { useRouterHandlerStore, useSettingsStore, useAuthStore, useServerSetupsStore } from '@/stores'
import { AuthPanel, AlbumEditPanel, ReactionPanel } from '@/components/panels'
import AlbumsLines from '@/components/AlbumsLines.vue'
import AlbumsSquares from '@/components/AlbumsSquares.vue'
import AgeRatingLabel  from '@/components/AgeRatingLabel.vue'
import { vIntersectVideo } from '@/directives'
import {
  fetchWrapper, sleep, debounceImmediate, toggleReaction,
  humanFileSize, humanDate, humanSI, humanDuration,
} from '@/helpers'
import type { AlbumItem, ImageItem } from '@/types'
import { useMediaRetry } from '@/composables'

// Параметры в адресной строке
const routerHandler = useRouterHandlerStore()
const { openViewer } = routerHandler
const {
  limit, sort, trueReverse, tags, nested, ratings, types,
  targetAlbum, albumData, randomSeed,
} = storeToRefs(routerHandler)

// Хук для медиа для повторной загрузки при ошибке
const { onErrorMediaLoad, resetMediaRetries } = useMediaRetry()

// Функция очистки всех медиа
const cleanUpWall = () => {
  //console.log('clean')
  canLoadMore.value = false
  isLoading  .value = false
  images     .value = []
  retries = 0
  resetMediaRetries()
  currentPage = 1
  canLoadMore.value = true
}

// Наблюдение за параметрами в адресной строке, при изменении — перезапрашиваем медиа
watch(
  [targetAlbum, limit, sort, trueReverse, nested, tags, randomSeed],
  () => {
    //console.log(val1, val2)
    debounceImmediate(() => {
      //console.log('imgs', route, isLoading.value)
      if (isLoading.value) watch(
        isLoading,
        cleanUpWall,
        { once: true }
      )
      else
        cleanUpWall()
    }, 500)()
  }
)

// Косметические параметры и URL на превью
const { size, orientation, albumsLayout, imagePreviewSize } = storeToRefs(useSettingsStore())

const imgSign = ref<string | null>(null)

// Порционный запрос картинок
let currentPage = 1
let retries = 0
const isLoading   = ref(false)
const canLoadMore = ref(true)
const images      = ref<ImageItem[]>([])
const loadMore = async () => {
  if (!canLoadMore.value || isLoading.value) return
  isLoading.value = true

  await fetchWrapper.get<{ total: number, sign?: string, pictures: ImageItem[] }>(
    urls.albumImages(targetAlbum.value, {
      page: currentPage,
      limit: limit.value,
      tags: tags.value,
      sort: sort.value,
      isReverse: trueReverse.value,
      nested: nested.value,
      seed: sort.value === 'random' ? randomSeed.value : null,
      ratings: ratings.value,
      types: types.value,
    })
  ).then((data) => {
    albumData.value.nestedImagesCount = nested.value ? data.total : null
    if (!canLoadMore.value) return
    canLoadMore.value = !(data.total < currentPage * limit.value)

    imgSign.value = data?.sign ?? null
    albumData.value.sign = data?.sign

    const newImages = data.pictures
    newImages.forEach(element => {
      const parts = element.name!.split('.')
      element.ext = parts.length === 1 ? 'no ext' : parts.at(-1)
      element.name = parts.slice(0, -1).join('.')
      element.ratio = element.width! / element.height!
      element.thumbURLorig = urls.imageOrig (element?.album?.hash ?? albumData.value?.hash ?? targetAlbum.value,  element.hash,  element?.album?.sign ?? imgSign.value)
      element.thumbURL     = urls.imageThumb(element?.album?.hash ?? albumData.value?.hash ?? targetAlbum.value,  element.hash,  element?.album?.sign ?? imgSign.value, orientation.value, imagePreviewSize.value)
      element.thumbURLanim = (element.bitrate ?? 0) > 8_000_000 || element?.type != 'video'
        ? urls.imageThumb(element?.album?.hash ?? albumData.value?.hash ?? targetAlbum.value,  element.hash,  element?.album?.sign ?? imgSign.value, orientation.value, imagePreviewSize.value, true)
        : element.thumbURLorig
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
      if (retries > 5) canLoadMore.value = false
      await sleep(1000)
      return
    case 429: // TODO: Вывести уведомление о частых запросов
      alert(error.message)
      return
    case 403: // TODO: Вывести окно входа (с инфой о заблокированном альбоме)
    case 404: // TODO: Сделать красивую страницу
      canLoadMore.value = false
      alert(error.message || 'Not Found')
      return
    default:
      retries++
      if (retries > 5) canLoadMore.value = false
      await sleep(1000)
      return
    }
  })
}

/** Загрузка оригинала через клик на виртуальную ссылку */
const downloadOriginal = async (img: ImageItem) => {
  const url = urls.imageOrig(
    img.album?.hash ?? albumData.value?.hash ?? targetAlbum.value,
    img.hash,
    img.album?.sign ?? imgSign.value
  )
  try {
    const response = await fetch(url, { cache: 'force-cache' })
    const blob = await response.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `wpx ${img?.name} [${img?.hash}].${img?.ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('cannot download', error)
    window.location.href = url // фоллбэк
  }
}

// Всплывающие окна
const imageForReact   = ref()
const albumWhereReact = ref()
const editAlbum       = ref()
const authCard      = ref()
const reactionCard  = ref()
const editAlbumCard = ref()
const showAuthCard     = (e: Event) => authCard.value.toggle(e)
const showReactionCard = (e: Event, image: ImageItem) => {
  imageForReact.value = image
  albumWhereReact.value = albumData.value?.hash ?? targetAlbum
  reactionCard.value.toggle(e)
}
const showAlbumEditCard = (e: Event, album: AlbumItem) => {
  editAlbum.value = album
  editAlbumCard.value.toggle(e)
}

// Текущий пользователь
const { user } = storeToRefs(useAuthStore())

/** Переключение реакции на картинке */
const toggleReactionWrap = (image: ImageItem, reaction: string, e: Event) => {
  if (!user.value.token) {
    showAuthCard(e)
    return
  }
  toggleReaction(albumData.value?.hash ?? targetAlbum.value, image, reaction)
}

// Параметры предустановок
const serverSetups = useServerSetupsStore()
const { getRatingPreset } = serverSetups
const { allowedPreviewSizes } = storeToRefs(serverSetups)

// Генерация ссылок на несколько разных разрешений
const getThumbMultiURL = (albumHash: string, img: ImageItem, sign: string | null = null) => {
  const srcsetItems: string[] = []
  for (const allowSize of allowedPreviewSizes.value) {
    const urlW = urls.imageThumb(albumHash, img.hash, sign, 'w', allowSize)
    srcsetItems.push(urlW +' '+ allowSize +'w')
    const urlH = urls.imageThumb(albumHash, img.hash, sign, 'h', allowSize)
    srcsetItems.push(urlH +' '+ Math.round(allowSize * img.ratio!) +'w')
  }
  return srcsetItems.join(', ')
}

const videoRefs = ref<Record<string, HTMLVideoElement | null>>({})  // Ссылки-переменные на <video>

</script>

<template>
  <main class="page">
    <section class="albums" v-if="albumData?.children?.length">
      <AlbumsLines
        v-if="albumsLayout === 'lines'"
        :album="albumData"
        @edit-album="showAlbumEditCard"
      />
      <AlbumsSquares
        v-else-if="albumsLayout === 'grid'"
        :album="albumData"
      />
      <OverlayPanel ref="editAlbumCard" class="popup">
        <AlbumEditPanel v-model="editAlbum" :overlay="editAlbumCard"/>
      </OverlayPanel>
    </section>
    <section class="wall" :style="'--size:'+ size">
      <div class="media"
        v-for="img in images"
        @click="openViewer(img, $event, videoRefs)"
        :class="getRatingPreset(img?.album?.ratingId ?? albumData?.ratingId, img?.ratingId)"
        :key="img.hash"
        :style="'--ratio:'+ img.ratio">
        <i/>
        <img
          v-if="img.type === 'image'"
          :src="img.thumbURL"
          loading="lazy"
          alt=""
          @error="onErrorMediaLoad"
          :srcset="getThumbMultiURL(
            img?.album?.hash ?? albumData?.hash ?? targetAlbum,
            img,
            img?.album?.sign ?? imgSign
          )"
        />
        <video
          v-else
          :src="img.thumbURLanim"
          :poster="img.thumbURL"
          loading="lazy"
          muted
          playsinline
          loop
          preload="none"
          v-intersect-video
          :ref="(el) => { videoRefs[img.hash] = el as HTMLVideoElement | null }"
          @error="onErrorMediaLoad"
        />

        <div class="overlay">
          <div class="top-group">
            <span class="name">{{ img.name }}</span>
            <div class="badges">
              <span class="badge up">{{ img.ext }}</span>
              <span class="badge" :title="img.date">{{ humanDate(img.date!) }}</span>
              <span class="badge">{{ img.width }}×{{ img.height }}</span>
              <span class="badge" v-if="img.bitrate"  :title="img.bitrate .toLocaleString() + ' bit/sec'">{{ humanSI(img.bitrate) + 'bps' }}</span>
              <span class="badge" v-if="img.duration" :title="img.duration.toLocaleString() + ' seconds'">{{ humanDuration(img.duration)  }}</span>
              <RouterLink class="badge wide"
                v-if="img.album?.name
                  && !(img.album?.alias && img.album.alias === targetAlbum)
                  && !(img.album?.hash  && img.album.hash  === targetAlbum)"
                @click.stop
                :to="{
                  name: 'openAlbum',
                  params: { album: img.album?.alias ?? img.album?.hash },
                  query: $route.query
                }">
                {{ img.album.name }}
              </RouterLink>
            </div>
          </div>

          <div class="bottom-group">
            <div class="reactions-place">
              <button class="btn btn--reaction"
                v-if="user?.token"
                @click.stop="showReactionCard($event, img)">
                <SmilePlusIcon :size="20"/>
              </button>
              <div class="reactions">
                <template
                  v-for="(reactionParams, reaction) in img.reactions"
                  :key="reaction">
                  <div
                    v-if="reactionParams.count > 0"
                    class="reaction"
                    :class="{setted: reactionParams.isYouSet}"
                    @click.stop="toggleReactionWrap(img, reaction, $event)">
                    {{ reaction }}
                    {{ reactionParams.count }}
                  </div>
                </template>
              </div>
            </div>
            <button class="btn btn--download" @click.stop="downloadOriginal(img)">
              <span class="size">{{ humanFileSize(img.size ?? 0) }}</span>
              <DownloadIcon :size="20"/>
            </button>
          </div>
        </div>

        <AgeRatingLabel class="rating"
          :rating-id="img?.ratingId ?? img?.album?.ratingId"
          v-if="img?.ratingId ?? img?.album?.ratingId ?? albumData?.ratingId"
        />
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
      <div style="height: 1px" v-infinite-scroll="[loadMore, {interval: 500}]"/>
      <div style="min-height: 0; height: 3000px;"/>
      <div style="height: 1px" v-infinite-scroll="[loadMore, {interval: 500}]"/>
    </div>
    <OverlayPanel ref="authCard" class="popup popup--fixed">
      <AuthPanel/>
    </OverlayPanel>
    <OverlayPanel ref="reactionCard" class="popup popup--nopad">
      <ReactionPanel :album-hash="albumWhereReact" :image="imageForReact"/>
    </OverlayPanel>
  </main>
</template>

<style lang="scss" scoped>
.page {
  padding: calc(var(--gap) * var(--ext-gap));
  padding-top: calc(var(--header-height) + 1px);
  padding-bottom: var(--gap);
  overflow-x: hidden;
  transition: 0.1s, opacity .2s;
  position: relative;
  min-height: calc(100vh - var(--header-height) - var(--gap) - 1px);
  overflow: hidden;
}


:root:has(.sidebar_outer.opened.pinned) .page {
  padding-left: calc(var(--sidebar-width) + 8px);
}

.inf-handler-position {
  position: absolute;
  bottom: 0;
  height: 100%;
  display: flex;
  flex-direction: column-reverse;
}


.albums {
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
        .blur {
          filter: none !important;
        }
      }
      .previews {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows:    repeat(2, 1fr);
        padding: 10px;
        gap: 6px;
        overflow: hidden;
        border-radius: v-bind('radius +"px"');
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 6px;
          aspect-ratio: 1 / 1;
          .hide {
            display: none;
          }
          &.blur {
            filter: blur(v-bind('size / 30 +"px"')) saturate(.5);
          }
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
  gap: var(--gap);
  position: relative;
  z-index: 1;
  &:after {
    content: '';
    flex-grow: 1e4;
    //min-width: 20%;
  }
  .media {
    position: relative;
    width:     calc(var(--ratio) * var(--size) * 1px);
    flex-grow: calc(var(--ratio) * var(--size));
    &:hover {
      .btn--reaction {
        max-width: 32px !important;
        opacity: 1 !important;
      }
      .btn--download {
        max-width: 48px !important;
        opacity: 1 !important;
      }
      .overlay {
        --opacity: 1;
        border: 1px solid var(--c-t0a);
      }
    }
    i {
      display: block;
      padding-bottom: calc(1 / var(--ratio) * 100%)
    }
    img,
    video {
      position: absolute;
      top: 0;
      width: 100%;
      vertical-align: bottom;
      border-radius: var(--radius);
    }
    .overlay {
      z-index: 20;
      border-radius: var(--radius);
      display: flex;
      transition: opacity .2s, --opacity .2s, border .2s;
      position: absolute;
      --opacity: 0;
      bottom: 0;
      right: 0;
      left: 0;
      top: 0;
      border: 1px solid transparent;
      padding: calc(var(--radius) / 4 + 6px);
      flex-direction: column;
      justify-content: space-between;
      .top-group {
        transition: opacity .2s;
        opacity: var(--opacity);
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
        .reactions-place {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          align-items: center;
          .btn--reaction {
            transition: max-width .2s, opacity .2s, background 0s, color 0s;
            backdrop-filter: none;
            max-width: 0;
            opacity: 0;
            width: 32px;
            height: 32px;
            padding: 0;
            color: #fff;
            filter:
              drop-shadow(0 0 10px #000)
              drop-shadow(0 0 3px #000);
            &:hover,
            &:active {
              transition: max-width .2s, opacity .2s, background, .2s, color .2s;
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
          .reactions {
            //transition: opacity .2s;
            display: flex;
            flex-wrap: wrap-reverse;
            gap: 6px;
            z-index: 1;
            .reaction {
              background-color: var(--c-b0a);
              backdrop-filter: blur(var(--div-blur));
              height: 24px;
              cursor: pointer;
              padding: 2px 8px;
              border-radius: 24px;
              &.setted {
                background-color: var(--c-t0);
                color: var(--c-b0);
              }
            }
          }
        }
        .btn--download {
          max-width: 0;
          opacity: var(--opacity);
          transition: max-width .2s, opacity .2s, background 0s, color 0s;
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
            max-width: 0;
            opacity: 0;
            flex-grow: 0;
            overflow: hidden;
            text-wrap: nowrap;
          }
          &:hover,
          &:active {
            max-width: 100px !important;
            transition: max-width .2s, opacity .2s, background .2s, color .2s;
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
    .rating {
      position: absolute;
      backdrop-filter: var(--censure-filter-medium);
      border-radius: var(--radius);
      position: absolute;
      bottom: 0;
      right: 0;
      left: 0;
      top: 0;
      justify-content: center;
      align-items: center;
      //display: flex;
      display: none;
      pointer-events: none;
      > * {
        pointer-events: unset;
      }
    }
    &.blur {
      .rating {
        display: flex;
      }
      &:active .rating {
        opacity: 0;
        transition: opacity .5s ease-in;
      }
    }
    &.hide {
      display: none;
    }
  }
}

:global(body.ambient .media:hover img),
:global(body.ambient .media:hover video) {
  filter: url(#ambient-light);
  z-index: -1;
}
:global(body.ambient .media:hover .overlay) {
  border: 1px solid transparent !important;
}

.message {
  margin: 0 auto;
  width: 150px;
  z-index: 100;
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
