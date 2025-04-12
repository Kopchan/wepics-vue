<script setup>
import { ref, watch, computed, toRefs } from 'vue'
import { storeToRefs } from 'pinia'
import { FoldersIcon, ImagesIcon, ArrowRightIcon, ChevronDownIcon } from 'lucide-vue-next'

import { urls } from '@/api'
import { fetchWrapper } from '@/helpers'
import { useAlbumParamsStore, useSettingsStore } from '@/stores'
import AlbumsLines from '@/components/AlbumsLines.vue'
import { getThumbUrlOnAlbum } from '@/helpers/thumb'

// Параметры компонента
const props = defineProps({
  album: Object,
  loading: Boolean,
})

// Параметры компонента в переменные
const { album } = toRefs(props)

// Параметры в ссылке
const  {
  limit, sort, isReverse, tags, nested, targetImage
} = storeToRefs(useAlbumParamsStore())


// Косметические параметры
const {
  size, gap, radius, ambient, albumsLayout, lineWidth, albumPreviewSize
} = storeToRefs(useSettingsStore())

// Обработка нажатия на расширениея ребёнка
const handleChildExpand = async (childParams) => {
  childParams.vueExpanded = !childParams?.vueExpanded
  if (childParams.vueExpanded && !childParams?.data) {
    childParams.vueLoading = true
    await fetchWrapper.get(
      urls.albumInfo(childParams.hash, { 
        sort: sort.value, 
        images: Math.max(limit.value, 4),
        isReverse: isReverse.value,
        tags: tags.value, 
        nested: nested.value,
      })
    ).then(data => {
      childParams.vueLoading = false
      childParams.data = data
    }).catch(err => {
      childParams.vueLoading = false
      childParams.vueLoadErr = err
      console.error(err)
    })
  }
}

</script>

<template>
  <div class="lines" v-if="albumsLayout == 'lines'">
    <div 
      v-for="(childParams, childName) in album?.children" 
      :key="childName"
      class="line"
      :class="{expanded: childParams?.vueExpanded}">

      <RouterLink
        class="hidden-link"
        :key="childName"
        :to="{ path: '/album/'+childParams.hash, query: $route.query }"
      />

      <div class="title">
        <h3 class="name">{{ childName }}</h3>
        <div class="params">
          <div class="inline" v-if="childParams.albums_count">
            <FoldersIcon size="16"/>
            <span>{{ childParams.albums_count }}</span>
          </div>
          <div class="inline" v-if="childParams.images_count">
            <ImagesIcon size="16"/>
            <span>{{ childParams.images_count }}</span>
          </div>
          <button class="btn btn--quad btn--gray expand-btn"
            v-if="childParams.albums_count || childParams.images_count || !childParams.last_indexation"
            :class="{'btn--inverse': childParams.vueExpanded}"
            @click.stop="handleChildExpand(childParams)">
            <ChevronDownIcon size="24" :class="{}"/>
          </button>
        </div>
      </div>

      <AlbumsLines class="internal" 
        :album="childParams?.data" 
        v-if="childParams?.vueExpanded && childParams?.albums_count"
      />
      <div class="messanges loading" v-if="childParams?.vueLoading">
        <p class="text">Loading...</p>
      </div>

      <div class="previews" v-if="childParams?.images?.length">
        <div class="img-wrapper" 
          v-for="img, key in childParams?.images"
          :key="key"
          @click="() => {
            img.album = childParams
            targetImage = img
        }">
          <img
            :src="getThumbUrlOnAlbum(childParams, img, albumPreviewSize)" 
            :width="img.width"
            :height="img.height"
            alt="" 
            loading="lazy"
            @error="onErrorImgLoad"
          >
        </div>
        <RouterLink class="more" 
          :to="{ path: '/album/'+childParams.hash, query: $route.query }"
          v-if="childParams.images_count > childParams?.images?.length">
          <p>Explore {{ childParams.images_count - childParams?.images?.length }} remaining images</p>
          <ArrowRightIcon/>
        </RouterLink>
      </div>

      <div class="messages" v-else-if="!childParams.vueExpanded">
        <span class="text" v-if="!childParams.albums_count && !childParams.images_count && childParams.last_indexation">
          Empty as of {{childParams.last_indexation}}
        </span>
        <span class="text" v-if="!childParams.last_indexation">
          Not indexed, maybe has media
        </span>
        <span class="text" v-if="!childParams.images_count && childParams.albums_count && !childParams.vueExpanded">
          Open or expand to see sub-albums
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
          .inline:last-child {
            margin-right: 10px;
          }
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
          &.btn--inverse > * {
            rotate: 180deg;
          }
        }
      }
      &:hover:not(:has(.previews:hover)):not(:has(.btn:hover)):not(:has(.internal:hover)) {
        background-color: var(--c-b4a);
        z-index: 1;
        filter: v-bind('ambient ? "url(#ambient-light)" : "unset"');
        .overlay .block {
          background-color: transparent !important;
          backdrop-filter: none !important;
          box-shadow: unset !important;
        }
      }
      &:active:not(:has(.previews:hover)):not(:has(.btn:hover)):not(:has(.internal:hover)) {
        background-color: var(--c-b4);
      }
      .internal {
        padding: v-bind('gap / 2 +"px"');
        width: unset;
      }
      .loading {
        text-align: center;
        padding: calc(v-bind('gap / 2 +"px"') + 10px);
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
          flex-direction: column;
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
</style>