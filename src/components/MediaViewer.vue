<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useEventListener } from '@vueuse/core'
import type { ImageItem } from '@/types'
import { XIcon } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { useAlbumParamsStore, useSettingsStore } from '@/stores'
import { urls } from '@/api'
import { useRouter, useRoute } from 'vue-router'

// Параметры в ссылке
const {
  targetUser: userName,
  targetAlbum: albumHash,
  targetImage2: imageHash,
  imageTrueAlbum: trueAlbumHash,
  albumData: album,
  imageData: image,
  targetImageType: type,
} = storeToRefs(useAlbumParamsStore())

const {
  radius, gap, openPreviewTo,
} = storeToRefs(useSettingsStore())

const isScope = ref(0)
const isFill = ref(false)
const fullscreenMedia = window.matchMedia('(display-mode: fullscreen)').matches
const wasFullscreenBeforeMount = !!document.fullscreenElement || fullscreenMedia
const isBrowserFullscreen = ref(wasFullscreenBeforeMount)

const pxRatio = ref(window.devicePixelRatio || 1)

const router = useRouter()
const route = useRoute()

const close = async () => {
  if (document.fullscreenElement && !wasFullscreenBeforeMount) {
    try {
      await document.exitFullscreen()
    } catch (e) {
      console.warn('Exit fullscreen error:', e)
    }
  }

  if (image.value)
    image.value.watchedTo = videoPlayer.value?.currentTime

  image.value = null as unknown as ImageItem

  router.push({
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

const videoPlayer = ref()

const onVideoLoaded = () => {
  if (videoPlayer.value
    && image.value?.watchedTo
    && image.value.watchedTo > 10
  ) videoPlayer.value.currentTime = image.value.watchedTo
}

useEventListener(window, 'keydown', (event: KeyboardEvent) => {
  if (event.key === 'Escape' && !document.fullscreenElement)
    close()
})

// Полноэкранный режим браузера
const place = ref<HTMLElement>()

const toggleBrowserFullscreen = async () => {
  try {
    if (!document.fullscreenElement) {
      console.log(place.value)
      await place.value?.requestFullscreen()
    }
    else
      await document.exitFullscreen()
  } catch (e) {
    console.warn('Fullscreen error:', e)
  }
}

// Следим за состоянием fullscreen
useEventListener(document, 'fullscreenchange', () => {
  isBrowserFullscreen.value = !!document.fullscreenElement
})

// Обработка дабл-тапа для тач-устройств
let tapTimer: ReturnType<typeof setTimeout> | null = null
const DOUBLE_TAP_DELAY = 300

const handleContentTap = (event: Event) => {
  event.stopPropagation()

  if (tapTimer) {
    // Второй тап — отменяем одиночное действие и уходим в fullscreen
    clearTimeout(tapTimer)
    tapTimer = null
    toggleBrowserFullscreen()
  } else {
    // Первый тап — откладываем одиночное действие
    tapTimer = setTimeout(() => {
      tapTimer = null
      if (type.value === 'i') isScope.value ^= 1
    }, DOUBLE_TAP_DELAY)
  }
}

const currentAlbumHash = ref(image.value?.album?.hash ?? trueAlbumHash.value ?? albumHash.value)
const currentMediaHash = ref(image.value?.hash ?? imageHash.value)
const currentSign      = ref(image.value?.album?.sign ?? album.value?.sign ?? null)

onMounted(() => {
  if (openPreviewTo.value === 'screen' && !isBrowserFullscreen.value) {
    console.log('open fullsceen because settings')
    toggleBrowserFullscreen()
  }
})

</script>

<template>
  <div
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
      :height="isScope ? (image?.height ?? 0) / pxRatio : 'none'"
      :src="urls.imageOrig(currentAlbumHash, currentMediaHash, currentSign)"
      :poster="urls.imageThumb(currentAlbumHash, currentMediaHash, currentSign, 'h', 1080)"
    />
    <img class="content" v-else
      @click.stop="handleContentTap"
      :alt="image?.name ?? 'fullscreen image'"
      :height="isScope ? (image?.height ?? 0) / pxRatio : 'none'"
      :src="urls.imageOrig(currentAlbumHash, currentMediaHash, currentSign)"
    />
    <button class="btn close" @click="close()">
      <XIcon :size="32"/>
    </button>
  </div>
</template>

<style lang="scss">
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
    filter: drop-shadow(0 0 4px black);
    // предотвращаем выделение/зум по дабл-тапу на мобилках
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
  }
  &:not(.scoped):not(.fill):not(.fullscreen) {
    background-color: var(--c-b0aa);
    .content {
      border-radius: v-bind("radius + 'px'");
      max-width:  calc(100% - v-bind("gap*2 +'px'"));
      max-height: calc(100% - v-bind("gap*2 +'px'"));
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
</style>
