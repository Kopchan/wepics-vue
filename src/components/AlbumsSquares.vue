<script setup lang="ts">
import { toRefs } from 'vue'
import { storeToRefs } from 'pinia'
import { FileIcon, FoldersIcon } from '@lucide/vue'

import { urls } from '@/api'
import { humanCount } from '@/helpers'
import { useSettingsStore, useServerSetupsStore } from '@/stores'
import type { AlbumItem } from '@/types'
import { useMediaRetry } from '@/composables'

// Параметры компонента
const props = defineProps<{
  album?: AlbumItem
}>()

// Параметры компонента в переменные
const { album } = toRefs(props)

// Косметические параметры
const { albumPreviewSize } = storeToRefs(useSettingsStore())

// Серверные предустановки
const setupsStore = useServerSetupsStore()
const { getRatingPreset } = setupsStore

// Хук для медиа для повторной загрузки при ошибке
const { onErrorMediaLoad } = useMediaRetry()

</script>

<template>
  <div class="grid">
    <RouterLink
      class="square"
      v-for="(child, index) in album?.children"
      :key="index"
      :to="{
        name: 'openAlbum',
        params: { album: child?.alias ?? child.hash },
        query: $route.query
    }">
      <div class="previews">
        <img
          v-for="img in child?.images?.slice(0, 4)"
          :key="img.hash"
          :class="getRatingPreset(child?.ratingId, img?.ratingId)"
          :src="urls.imageThumb(child.hash, img.hash, child?.sign, 'h', albumPreviewSize)"
          :alt="img.name"
          loading="lazy"
          @error="onErrorMediaLoad"
        />
      </div>
      <div class="overlay">
        <div class="center">
          <div class="block">
            <p class="name">{{ child.name }}</p>
            <div class="inline" v-if="child.imagesCount">
              <FileIcon :size="16"/>
              <span>{{ humanCount(child.mediasCount ?? 0) }}</span>
            </div>
            <div class="inline" v-if="child.albumsCount">
              <FoldersIcon :size="16"/>
              <span>{{ humanCount(child.albumsCount) }}</span>
            </div>
            <span class="text" v-if="!child.albumsCount && !child.mediasCount">EMPTY</span>
            <span class="text" v-if="!child.indexedAt">NOT INDEXED</span>
          </div>
        </div>
      </div>
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--size-half), 1fr));
  padding-bottom: var(--gap-double);
  gap: var(--gap);
}
.square {
  background-color: var(--c-b2a);
  aspect-ratio: 1 / 1;
  border-radius: var(--radius);
  position: relative;
  z-index: 3;
  &:hover {
    background-color: var(--c-b4a);
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
}
:global(body.ambient .grid .square:hover) {
  filter: url(#ambient-light);
}
.previews {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows:    repeat(2, 1fr);
  padding: var(--gap);
  gap: var(--gap-half);
  overflow: hidden;
  border-radius: var(--radius);
  img {
    overflow: hidden;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: min(var(--radius), max(6px, calc(var(--radius) - var(--gap))));
    aspect-ratio: 1 / 1;
    .hide {
      display: none;
    }
    &.blur {
      filter: var(--censure-filter-small)
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
</style>
