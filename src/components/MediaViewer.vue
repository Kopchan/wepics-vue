<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useDevicePixelRatio, useEventListener } from '@vueuse/core'
import { XIcon } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { useRouterHandlerStore, useSettingsStore } from '@/stores'
import { urls } from '@/api'
import { useRouter, useRoute } from 'vue-router'
import { humanFileSize } from '@/helpers'

// Параметры в маршруте
const {
  targetUser: userName,
  targetAlbum: albumHash,
  targetImage: imageHash,
  targetTrueAlbum: trueAlbumHash,
  albumData: album,
  imageData: image,
  targetImageType: type,
  openedPreviewSrc: openedPreviewSrc,
} = storeToRefs(useRouterHandlerStore())

// HTML элементы и состояния
const imageRef = ref<HTMLImageElement>()
const videoPlayer = ref<HTMLVideoElement>()
const isLoading = ref(true)
const isScope = ref(false)
const isFill = ref(false)
const { pixelRatio } = useDevicePixelRatio()

// Узнаём в каком режиме сейчас браузер
const fullscreenMedia = window.matchMedia('(display-mode: fullscreen)').matches
const wasFullscreenBeforeMount = !!document.fullscreenElement || fullscreenMedia
const isBrowserFullscreen = ref(wasFullscreenBeforeMount)

// Маршрутизатор и маршрут
const router = useRouter()
const route = useRoute()

/** Действие закрытия просмотра/фуллскрина */
const close = async () => {
  // Если в фуллскрине, то только выходим из фуллскрина
  if (document.fullscreenElement && !wasFullscreenBeforeMount) {
    try { await document.exitFullscreen() }
    catch (e) { console.warn('Exit fullscreen error:', e) }
  }
  // Сохраняем до куда досмотрели
  if (image.value)
    image.value.watchedTo = videoPlayer.value?.currentTime

  // Обнуляем все данные об открытом медиа
  image.value = {}

  // Выполняем переход назад если есть куда
  const hasPreviousRoute = window.history.state && window.history.state.back
  if (hasPreviousRoute)
    router.back()

  // Иначе выполняем переход по роуту
  else router.push({
    name: userName.value
      ? 'userAlbum'
      : albumHash.value === 'root'
        ? 'home'
        : 'openAlbum',
    query: route.query,
    params: {
      album: albumHash.value,
      user: userName.value,
    },
  })
}

// Перехватываем клавишу Esc как закрытие
useEventListener(window, 'keydown', (event: KeyboardEvent) => {
  if (event.key === 'Escape' && !document.fullscreenElement)
    close()
})

/** Как картинка подгрузилась то убираем сообщение */
const onImageLoaded = () =>
  isLoading.value = false

/** Как видео подгрузилось то убираем сообщение и перематываем на том где остановились (в сессии) */
const onVideoLoaded = () => {
  isLoading.value = false

  if (videoPlayer.value
    && image.value?.watchedTo
    && image.value.watchedTo > 10
  ) videoPlayer.value.currentTime = image.value.watchedTo
}


// Контейнер медиа
const place = ref<HTMLElement>()

/** Переключаем фуллскрин */
const toggleBrowserFullscreen = async () => {
  try {
    if (!document.fullscreenElement)
      await place.value?.requestFullscreen()
    else
      await document.exitFullscreen()
  }
  catch (e) { console.warn('Fullscreen error:', e) }
}

// Следим за состоянием fullscreen
useEventListener(document, 'fullscreenchange', () => {
  isBrowserFullscreen.value = !!document.fullscreenElement
})


let tapTimer: ReturnType<typeof setTimeout> | null = null
const DOUBLE_TAP_DELAY = 300

/** Обработка нажатий для перехода в фуллскрин */
const handleContentTap = () => {
  if (tapTimer) {
    // Второй тап — отменяем одиночное действие и уходим в фуллскрин
    clearTimeout(tapTimer)
    tapTimer = null
    toggleBrowserFullscreen()
  } else {
    // Первый тап — откладываем одиночное действие
    tapTimer = setTimeout(() => {
      tapTimer = null
      if (type.value === 'i') isScope.value = !isScope.value
    }, DOUBLE_TAP_DELAY)
  }
}

// TODO: вынести в вычисляемые парамтры routeHandle
const currentAlbumHash = ref(image.value?.album?.hash ?? trueAlbumHash.value ?? albumHash.value)
const currentMediaHash = ref(image.value?.hash ?? imageHash.value)
const currentSign      = ref(image.value?.album?.sign ?? album.value?.sign ?? null)

const { openPreviewTo } = storeToRefs(useSettingsStore())

onMounted(async () => {
  // Если найстроками было задано открывать в фуллскрине и сейчас сам браузер не в нём, то сразу же исполняем
  if (openPreviewTo.value === 'screen' && !isBrowserFullscreen.value)
    toggleBrowserFullscreen()

  // Обработка загрузки картинки (не видео)
  //if (imageRef.value) {
  //  // Ждем, пока браузер полностью скачает и распакует картинку
  //  try { await imageRef.value.decode() }
  //  catch (e) { console.error("Img decode error", e) }
  //  // Скрываем сообщение о загрузке
  //  finally { isLoading.value = false }
  //}
})

// Закрывая маршрутом зачищаем данные об картинке
onUnmounted(() => {
  image.value = {}
})

</script>

<template>
  <figure
    class="place"
    ref="place"
    @click="close()"
    :class="{'scoped': isScope, 'fill': isFill, 'fullscreen': isBrowserFullscreen}">
    <video class="content" v-if="type === 'v'"
      controls
      loop
      autoplay
      ref="videoPlayer"
      @click.stop="handleContentTap"
      @loadedmetadata="onVideoLoaded"
      :alt="image?.name ?? 'fullscreen video'"
      :height="(image?.height ?? 1) / pixelRatio"
      :width="(image?.width ?? 1) / pixelRatio"
      :src="urls.imageOrig(currentAlbumHash, currentMediaHash, currentSign)"
      :poster="openedPreviewSrc ? openedPreviewSrc : urls.imageThumb(currentAlbumHash, currentMediaHash, currentSign, 'h', 1080)"
    />
    <img class="content" v-else
      @click.stop="handleContentTap"
      @load="onImageLoaded"
      ref="imageRef"
      :alt="image?.name ?? 'fullscreen image'"
      :height="(image?.height ?? 1) / pixelRatio"
      :width="(image?.width ?? 1) / pixelRatio"
      :src="urls.imageOrig(currentAlbumHash, currentMediaHash, currentSign)"
      :style="isLoading && openedPreviewSrc ? { backgroundImage: `url(${openedPreviewSrc})` } : {}"
    />
    <button class="btn close" @click.stop="close()">
      <XIcon :size="32"/>
    </button>
  </figure>
  <div class="message message--download" v-if="isLoading">
    <p>Loading...</p>
    <span v-if="image?.size && type !== 'v'">
      ({{ humanFileSize(image?.size) }})
    </span>
  </div>
</template>

<style lang="scss" scoped>
.place {
  z-index: 1000;
  display: flex;
  overflow: auto;
  position: fixed;
  backdrop-filter: blur(12px);
  background: #000;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  .content {
    transition: border-radius .5s;
    // FIXME: широкие картинки нажимаются сверху и снизу (вместо закрытия), нету закругления
    margin: auto;
    object-fit: contain;
    filter: drop-shadow(0 0 calc(4px * var(--ext-gap)) black);
    // предотвращаем выделение/зум по дабл-тапу на мобилках
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;

    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }
  &:not(.scoped):not(.fill):not(.fullscreen) {
    background-color: var(--c-b0aa);
    .content {
      border-radius: calc(var(--radius) * var(--ext-gap));
      max-width:  calc(100% - var(--gap-doule) * var(--ext-gap));
      max-height: calc(100% - var(--gap-doule) * var(--ext-gap));
      object-fit: contain;
      height: auto;
      width: auto;
    }
  }
  &.fill {
    .content {
      width: 100%;
      object-fit: cover;
    }
  }
  &:not(.scoped):not(.fill).fullscreen {
    background: #000;
    .content {
      border-radius: 0;
      max-width: 100%;
      max-height: 100%;
      filter: none;
      object-fit: contain;
      height: auto;
      width: auto;
    }
  }
  &.scoped .btn {
    display: none;
  }
  .btn.close {
    position: fixed;
    right: 8px;
    top: calc(env(titlebar-area-height, 0px) + 8px);
    height: 64px;
    width: 64px;
    color: var(--white0);
    //transition: ;
    &:not(:hover) {
      filter: drop-shadow(0 0 3px black);
    }
  }
}

.message {
  width: 200px;
  z-index: 2000;
  background-color: var(--c-b2);
  border-radius: var(--border-r);
  text-align: center;
  padding: 10px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  &:has(> :nth-child(2)) {
    justify-content: space-between;
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
    span {
      font-size: 14px;
      color: var(--c-t4);
    }
  }
}
</style>
