<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { vInfiniteScroll } from '@vueuse/components'
import { useDevicePixelRatio, useWindowSize, watchDebounced } from '@vueuse/core'
import { SmilePlusIcon, DownloadIcon } from 'lucide-vue-next'
import OverlayPanel from 'primevue/overlaypanel'

import { API_PATH } from '@/config'
import { fetchWrapper, sleep, debounceImmediate, humanFileSize } from '@/helpers';
import { useAlbumParamsStore, useSettingsStore, useAuthStore } from '@/stores'
import { AuthPanel } from '@/components/panels'
import { ImageViewer } from '@/components'

// Параметры текущего альбома
const  {
  targetAlbum, limit, sort, isReverse, tags
} = storeToRefs(useAlbumParamsStore())
// Генерация URL для получения страницы ответа
const getAlbumURL = (page) =>
  '/albums/'  + targetAlbum.value +
  '/images?page=' +    page       +
  '&limit=' +         limit.value +
  '&sort=' +           sort.value +
  (tags.value.length ? '&tags=' + tags.value.map(elem => encodeURIComponent(elem))?.join(',') : '') +
  (isReverse.value ? '&reverse' : '')

const route = useRoute()
// Функция очистки всех картинок
const cleanUpWall = () => {
  canLoadMore.value = false
  isLoading  .value = false
  images     .value = []
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
  size, isStrictSize, isRealSize, lines, gap, radius, orientation, scroll
} = storeToRefs(useSettingsStore())

// Требуемые размеры карточек на представлении / скачиваемого изображения 
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

// Получение превью всех размеров, если устройство поддерживает srcset 
const getThumbMultiURL = (hash, ratio = 1) => {
  const srcsetItems = []
  for (const allowSize of allowedSizes) {
    const url = 
      `${API_PATH}/albums/` +
      `${targetAlbum.value}/images/` +
      `${hash}/thumb/` +
      `${orientation.value}${allowSize}` +
      ( imgSign.value ? `?sign=${imgSign.value}` : '' )

    const srcsetSize = orientation.value == 'w' 
      ? allowSize
      : Math.round(allowSize / ratio)

    srcsetItems.push(url +' '+ srcsetSize +'w')
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
let retries = 0
const isLoading   = ref(null)
const canLoadMore = ref(true)
const images      = ref([])
const loadMore = async () => {
  if (!canLoadMore.value || isLoading.value) return
  isLoading.value = true

  await fetchWrapper.get(
    getAlbumURL(currentPage)
  ).then((data) => {
    if (!canLoadMore.value) return
    canLoadMore.value = !(data.total < currentPage * limit.value)

    imgSign.value = data.sign
   
    const newImages = data.pictures
    newImages.forEach(element => {
      element.ext = element.name.split('.').at(-1).toLowerCase()
      element.thumbURL = element.ext != 'gif'
        ? getThumbURL(element.hash) 
        : `${API_PATH}/albums/` +
          `${targetAlbum.value}/images/` +
          `${element.hash}/orig`
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
    case 404: // TODO: Сделать красивую страницу
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

const downloadOriginal = (hash) => {
  window.location.href = 
    `${API_PATH}/albums/${targetAlbum.value}/images/${hash}/download${imgSign.value ? '?sign=' + imgSign.value : ''}`
}

// Получение разрешённых реакций
const allowedReactions = ref(null)
fetchWrapper.get('/reactions').then(data => 
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
    '/albums/' + targetAlbum.value + 
    '/images/' + image.hash +
    '/reactions?reaction=' + reaction
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

const targetImage = ref(null)
watch(
  () => targetImage.value,
  () => {
    scroll.value = !(targetImage.value != null)
  }
)

</script>

<template>
  <main>
    <div class="grid_outer">
      <!-- DEBUG
      <button @click="console.log({
        tags,
      })">
        get values
      </button>
      
      <button @click="console.log(images)">Тест</button>
      -->
      <section class="wall">
        <div 
          v-for="img in images" 
          :key="img" 
          class="img"
          @click="targetImage = img"
          :style="
            'width:'    + img.width*size / img.height +'px;'+
            'flex-grow:'+ img.width*size / img.height
          ">

          <i :style="'padding-bottom:'+ img.height / img.width * 100 +'%'"></i>
          <img 
            :src="img.thumbURL" 
            alt="" 
            loading="lazy"
            :srcset="img.ext != 'gif' 
            ? getThumbMultiURL(img.hash, img.width / img.height) 
            : ''
            ">

          <div class="reactions">
            <template 
              v-for="(reactionParams, reaction) in img.reactions" 
              :key="reaction">
              <div 
                v-if="reactionParams.count > 0"
                class="reaction"
                :class="{setted: reactionParams.isYouSet}"
                @click="toggleReaction(img, reactionParams, $event)">
                {{ reaction }}
                {{ reactionParams.count }}
              </div>
            </template>
          </div>
          
          <div class="overlay">
            <div>
              <div class="top-group">
                <span class="badge">{{ img.ext }}</span>
                <span class="name">{{ img.name }}</span>
              </div>  
            </div>

            <div class="bottom-group">
              <input type="checkbox" :id="img.hash" @click.stop @change="checkboxChange" >
              <label 
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
                    @click="toggleReaction(img, option, $event)">
                    {{ option }}
                  </label>
                </div>
                <SmilePlusIcon size="20"/>
              </label>

              <button class="btn btn--download" @click.stop="downloadOriginal(img.hash)">
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
      @targetImage="(target) => targetImage = target"/>
  </main>
</template>

<style lang="scss" scoped>
.grid {
  justify-content: center;
  margin: 0 auto;
  &_outer {
    padding: calc(var(--header-height) + 1px) v-bind('gap + "px"') v-bind('gap + "px"');
    overflow-x: hidden;
    transition: 0.1s;
    position: relative;
  }
}

.inf-handler-position {
  position: absolute;
  bottom: 0;
  height: 100%;
  display: flex;
  flex-direction: column-reverse;
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
    &:hover {
      border-radius: v-bind('radius * 2 + "px"');
      .reactions {
        opacity: 0;
      }
      .overlay {
        opacity: 1;
        border: 1px solid var(--c-t0a);
      }
    }
    i {
      display: block;
    }
    img {
      position: absolute;
      top: 0;
      width: 100%;
      vertical-align: bottom;
      border-radius: v-bind('radius + "px"');
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
      border-radius: v-bind('radius + "px"');
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
      padding: calc(v-bind('radius + "px"') / 4 + 6px);
      flex-direction: column;
      justify-content: space-between;
      .top-group {
        display: flex;
        gap: 6px;
        filter:
          drop-shadow(0 0 10px #000) 
          drop-shadow(0 0 3px #000);
        .name {
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          color: #fff;
        }
        .badge {
          font-size: 12px;
          padding: 2px 5px;
          background-color: #fffa;
          border-radius: var(--border-r);
          color: #000;
          display: flex;
          justify-items: center;
          align-items: center;
          text-transform: uppercase
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
