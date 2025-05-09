<script setup>
import { ref, toRefs, onMounted, onBeforeUnmount, watch } from 'vue';
import { XIcon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia';
import { useSettingsStore } from '@/stores';
import { urls } from '@/api';

// Параметры компонента
const props = defineProps({
  album: String,
  image: Object,
  sign: String|null,
})

// Параметры компонента в переменные
const { album, image, sign } = toRefs(props)

const {
  radius, gap
} = storeToRefs(useSettingsStore())

const isScope = ref(false)
const isFill = ref(false)

const pxRatio = ref(window.devicePixelRatio || 1)

const emit = defineEmits(['targetImage'])
const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    emit('targetImage', null)
  }
};

// Закрываем просмотр если альбом сменился
watch(() => album.value, () => emit('targetImage', null))

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
})
</script>

<template>
  <div class="place" 
    @click="$emit('targetImage', null)"
    :class="{'scoped': isScope, 'fill': isFill}">
    <img
      @click.stop="isScope ^= 1" 
      alt="name"
      :height="isScope ? image.height / pxRatio : 'none'"
      :src="urls.imageOrig(image?.album?.hash ?? album, image.hash, image?.album?.sign ?? sign)">
      <button class="btn close" @click="$emit('targetImage', null)">
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
  img {
    transition: border-radius .5s;
    // FIXME: широкие картинки нажимаются сверху и снизу (вместо закрытия), нету закругления
    margin: auto;
    object-fit: contain;
    filter: drop-shadow(0 0 4px black);
  }
  &:not(.scoped):not(.fill) {
    background-color: var(--c-b0aa);
    img {
      border-radius: v-bind("radius + 'px'");
      max-width:  calc(100% - v-bind("gap*2 +'px'"));
      max-height: calc(100% - v-bind("gap*2 +'px'"));
    }
  }
  &.fill {
    img {
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
