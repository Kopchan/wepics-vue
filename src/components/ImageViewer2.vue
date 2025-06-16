<script setup>
import { ref } from 'vue'
import { useEventListener } from '@vueuse/core'
import { XIcon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useAlbumParamsStore, useSettingsStore } from '@/stores'
import { urls } from '@/api'
import { useRouter, useRoute } from 'vue-router'

// Параметры компонента
//const props = defineProps({
//  album: Object,
//  image: Object,
//  sign: String,
//})

// Параметры компонента в переменные
//const { album, image, sign } = toRefs(props)

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
  radius, gap
} = storeToRefs(useSettingsStore())

const isScope = ref(false)
const isFill = ref(false)

const pxRatio = ref(window.devicePixelRatio || 1)

const router = useRouter()
const route = useRoute()

const close = () => {
  if (image.value)
    image.value.watchedTo = videoPlayer.value?.currentTime

  image.value = null

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

useEventListener(window, 'keydown', (event) => {
  if (event.key === 'Escape') 
    close()
})

</script>

<template>
  <div class="place" 
    @click="close()"
    :class="{'scoped': isScope, 'fill': isFill}">
    <video
      class="content"
      v-if="type === 'v'"
      controls 
      loop
      autoplay
      ref="videoPlayer"
      @click.stop
      @loadedmetadata="onVideoLoaded"
      :alt="image?.name ?? 'fullscreen video'"
      :height="isScope ? image.height / pxRatio : 'none'"
      :src="urls.imageOrig(
        image?.album?.hash ?? trueAlbumHash ?? albumHash, 
        image?.hash        ?? imageHash, 
        image?.album?.sign ?? album?.sign
      )"
      :poster="urls.imageThumb(
        image?.album?.hash ?? trueAlbumHash ?? albumHash, 
        image?.hash        ?? imageHash, 
        image?.album?.sign ?? album?.sign,
        'h', 
        1080
    )"></video>
    <img
      class="content"
      v-else
      @click.stop="isScope ^= 1" 
      :alt="image?.name ?? 'fullscreen image'"
      :height="isScope ? image?.height / pxRatio : 'none'"
      :src="urls.imageOrig(
        image?.album?.hash ?? trueAlbumHash ?? albumHash, 
        image?.hash        ?? imageHash, 
        image?.album?.sign ?? album?.sign
    )">
      <button class="btn close" @click="close()">
        <XIcon size="32"/>
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
  }
  &:not(.scoped):not(.fill) {
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
