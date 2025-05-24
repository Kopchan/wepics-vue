<script setup>
import { ref, toRefs } from 'vue'
import { storeToRefs } from 'pinia'
import { 
  FoldersIcon, ArrowRightIcon, ChevronDownIcon, SaveIcon, PenIcon, EyeIcon, 
  EyeOffIcon, VideoIcon, ImageIcon, Music2Icon, Hourglass
} from 'lucide-vue-next'

import { urls } from '@/api'
import { 
  fetchWrapper, humanDate, humanCount, humanFileSize, routeNameViewer,
  routeViewerType, humanSI, humanDuration, reverseCheckInSortType, 
  sleep
} from '@/helpers'
import { useAlbumParamsStore, useSettingsStore, useServerSetupsStore, useAuthStore } from '@/stores'
import AlbumsLines from '@/components/AlbumsLines.vue'
import AgeRatingLabel from './AgeRatingLabel.vue'
import { useRoute, useRouter } from 'vue-router'
import vIntersectVideo from '@/directives/vIntersectVideo'

// Параметры компонента
const props = defineProps({
  album: Object,
  loading: Boolean,
})

// Параметры компонента в переменные
const { album } = toRefs(props)

// Вызов события
const emit = defineEmits(['edit-album'])

// Данные об текущем пользователе
const { user } = storeToRefs(useAuthStore())

// Параметры в ссылке
const  {
  limit, sort, isReverse, tags, nested, imageData, sortAlbums,
  disrespect, isReverseAlbums, sortType, albumData, targetUser, targetAlbum,
} = storeToRefs(useAlbumParamsStore())

// Косметические параметры
const {
  size, gap, radius, ambient, albumsLayout, lineWidth, albumPreviewSize
} = storeToRefs(useSettingsStore())

// Параметры предустановок
const { ageRatings } = storeToRefs(useServerSetupsStore())

const ratingPreset = (albumRating, imgRating) => {
  if (!albumRating && !imgRating) 
    return false

  const rating = ageRatings.value?.find(r => 
    r.id === (imgRating ?? albumRating)
  )

  const preset = rating?.preset

  if (!preset)
    return

  if (preset === 'hide' || preset === 'blur')
    return preset
}

// Обработка нажатия на расширения ребёнка
const handleChildExpand = async (child) => {
  child.vueExpanded = !child?.vueExpanded
  if (child.vueExpanded && !child?.data) {
    child.vueLoading = true
    await fetchWrapper.get(
      urls.albumInfo(child.hash, { 
        sort: sort.value, 
        sortAlbums: sortAlbums.value, 
        isReverse: reverseCheckInSortType(sortType, isReverse, sort),
        isReverseAlbums: isReverseAlbums.value,
        disrespect: disrespect.value,
        tags: tags.value,
        images: Math.max(limit.value, 4),
        nested: nested.value,
      })
    ).then(data => {
      child.vueLoading = false
      child.data = data
      child.data.contentSortField = sortAlbums.value === 'content' ? sort.value : null
    }).catch(err => {
      child.vueLoading = false
      child.vueLoadErr = err
      console.error(err)
    })
  }
}

const formatContentSort = value => {
  switch (album.value?.contentSortField) {
  case 'date':      return humanDate(value)
  case 'size':      return humanFileSize(value)
  case 'duration':  return humanDuration(value / 1000)
  case 'bitrate':   return humanSI(Math.floor(value)) + 'bps'
  case 'framerate': return Math.floor(value) + ' fps'
  default:          return value
  }
}

const router = useRouter()
const route = useRoute()
const videoRefs = ref([])

const openViewer = (image) => {
  const watchedToNow = videoRefs.value[image.hash]?.currentTime

  if (!image?.watchedTo || image.watchedTo < watchedToNow)
    image.watchedTo = watchedToNow

  imageData.value = image

  router.push({
    name: routeNameViewer(!!targetUser.value, image),
    query: route.query,
    params: {
      user: targetUser.value, 
      type: routeViewerType(image?.type), 
      album: albumData.value?.alias ?? targetAlbum.value,
      trueAlbum: image?.album?.alias ?? image?.album?.hash,
      image: image?.hash,
    },
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

</script>

<template>
  <div class="lines" v-if="albumsLayout == 'lines'">
    <div 
      v-for="(child, index) in album?.children" 
      :key="index"
      class="line"
      :class="{expanded: child?.vueExpanded}">

      <RouterLink class="hidden-link" :to="{ 
        name: 'openAlbum',
        params: { album: child?.alias ?? child.hash }, 
        query: $route.query 
      }"/>

      <div class="title">
        <div class="left">
          <div v-if="child.orderLevel" class="level">
            <p>{{ child.orderLevel }}</p>
          </div>
          <div v-if="child.guestAllow != null" class="visibility">
            <EyeIcon size="24" v-if="child.guestAllow"/>
            <EyeOffIcon size="24" v-else/>
          </div>
          <h3 class="name">{{ child.name }}</h3>
          <button v-if="user.isAdmin"
            class="btn btn--circle edit-btn" 
            title="Edit this album"
            @click="emit('edit-album', $event, child)">
            <PenIcon size="20" />
          </button>
        </div>
        <div class="right">
          <div class="inline" v-if="child?.contentSort">
            <span class="badge" :title="child.contentSort">
              {{ formatContentSort(child.contentSort) }}
            </span>
          </div>
          <AgeRatingLabel class="inline"
            :ratingId="child?.ratingId"
            v-if="child?.ratingId"
          />
          <div class="inline" v-if="child?.audiosCount">
            <Music2Icon size="18"/>
            <span>{{ humanCount(child.audiosCount) }}</span>
          </div>
          <div class="inline" v-if="child?.videosCount">
            <VideoIcon size="18"/>
            <span>{{ humanCount(child.videosCount) }}</span>
          </div>
          <div class="inline" v-if="child?.imagesCount">
            <ImageIcon size="18"/>
            <span>{{ humanCount(child.imagesCount) }}</span>
          </div>
          <div class="inline" v-if="child?.albumsCount">
            <FoldersIcon size="18"/>
            <span>{{ humanCount(child.albumsCount) }}</span>
          </div>
          <div class="inline" v-if="child?.duration">
            <Hourglass size="18"/>
            <span>{{ humanDuration(child.duration) }}</span>
          </div>
          <div class="inline" v-if="child?.size">
            <SaveIcon size="18"/>
            <span>{{ humanFileSize(child.size) }}</span>
          </div>

          <button class="btn btn--quad expand-btn"
            v-if="child.albumsCount || child.mediasCount || !child.indexedAt"
            :class="{'btn--inverse': child.vueExpanded}"
            @click.stop="handleChildExpand(child)">
            <ChevronDownIcon size="24"/>
          </button>
        </div>
      </div>

      <AlbumsLines class="internal" 
        :album="child?.data" 
        v-if="child?.vueExpanded && child?.albumsCount"
        @edit-album="(event, album) => emit('edit-album', event, album)"
      />
      <!-- @edit-album="showEditOverlay" -->
       
      <div class="loading" v-if="child?.vueLoading">
        <p class="text">Loading...</p>
      </div>

      <div class="previews" v-if="child?.images?.length">
        <div class="img-wrapper" 
          v-for="img, key in child?.images"
          :key="key"
          :class="ratingPreset(child?.ratingId, img?.ratingId)"
          @click="() => {
            img.album = child
            openViewer(img)
        }">
          <img
            :src="urls.imageThumb(child.hash, img.hash, child?.sign, 'h', albumPreviewSize)" 
            :width="img.width"
            :height="img.height"
            :alt="img.name" 
            loading="lazy"
            @error="onErrorImgLoad"
          >
          <video
            v-if="img.type === 'video' || img.type === 'imageAnimated'"
            :src="urls.imageThumb(child.hash, img.hash, child?.sign, 'h', albumPreviewSize, true)" 
            loading="lazy"
            muted
            playsinline
            loop
            preload="none"
            v-intersect-video
            :ref="el => videoRefs[img.hash] = el"
            @error="onErrorImgLoad"
          ></video>
          <div class="overlay">
            <div class="top"></div>
            <div class="center">
              <AgeRatingLabel class="rating"
                :ratingId="img?.ratingId"
                v-if="img?.ratingId"
              />
            </div>
            <div class="bottom"></div>
          </div>
        </div>
        <RouterLink class="more" 
          v-if="child.imagesCount > child?.images?.length"
          :to="{ 
            name: 'openAlbum',
            params: { album: child?.alias ?? child.hash }, 
            query: $route.query 
        }">
          <p>Explore {{ child.imagesCount - child?.images?.length }} remaining images</p>
          <ArrowRightIcon/>
        </RouterLink>
      </div>

      <div class="messages" v-else-if="!child.vueExpanded">
        <span class="text" v-if="!child.albumsCount && !child.imagesCount && child.indexedAt">
          Empty as of {{child.indexedAt}}
        </span>
        <span class="text" v-if="!child.indexedAt">
          Not indexed, maybe has media
        </span>
        <span class="text" v-if="!child.imagesCount && child.albumsCount && !child.vueExpanded">
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
    align-items: center;
    justify-content: space-between;
    .left {
      min-width: 0;
      display: flex;
      align-items: center;
    }
    .level {
      color: var(--c-t7);
      max-height: 24px;
      min-width: 24px;
      margin: 8px;
      margin-right: 0;
      height: 32px;
      font-size: 12px;
      font-weight: bold;
      border: 2px solid var(--c-t7);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .visibility {
      margin: 8px;
      margin-right: 0;
      color: var(--c-t7);
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .edit-btn {
      color: var(--c-t7);
      margin: 0 2px;
      &:hover {
        color: var(--c-t0);
      }
    }
    .name {
      color: var(--c-t0);
      font-size: 24px;
      padding: 0;
      min-width:0;
      margin: 0;
      //align-self: flex-start;
      font-weight: 200;
      padding-left: 10px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .right {
      display: flex;
      gap: 10px;
      align-content: center;
      .inline:last-child {
        margin-right: 10px;
      }
    }
    .rating {
      z-index: 10;
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
    height: 40px;
    text-align: center;
    position: absolute;
    top: v-bind('gap / 2 +"px"');
    left: 0;
    right: 0;
    padding: calc(v-bind('gap / 2 +"px"') + 10px);
  }
  .previews {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    justify-items: center;
    align-items: center;
    gap:     v-bind('gap / 2 +"px"');
    padding: v-bind('gap / 2 +"px"');
    height:  v-bind('size / 2 +"px"');
    z-index: 10;
    position: relative;
    /* Если все .child, кроме последнего, скрыты, то скрываем родителя */
    .img-wrapper {
      height: 100%;
      width: auto;
      position: relative;
      &.blur .overlay {
        backdrop-filter: blur(v-bind('size / 20 +"px"')) saturate(.5);
        .rating {
          display: unset;
        }
        &:active {
          backdrop-filter: unset;
          .rating {
            display: none;
          }
        }
      }
      &.hide {
        display: none;
      }
      &:hover {
        .overlay {
          outline: 1px solid var(--c-t0a);
        }
      }
      .overlay {
        position: absolute;
        content: '';
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        overflow: hidden;
        border-radius: v-bind('radius +"px"');
        z-index: 20;
        filter:
          drop-shadow(0 0 10px #000) 
          drop-shadow(0 0 3px #000);
        .center {
          display: flex;
          justify-content: center;
        }
      }
      .rating {
        display: none;
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
        z-index: 9;
      }
    }
    video {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 100%;
      object-fit: cover;
      border-radius: v-bind('radius +"px"');
      z-index: 1;
      &:hover {
        //filter: v-bind('ambient ? "url(#ambient-light)" : "unset"');
        // z-index: 1;
        z-index: 10;
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
.badge {
  flex-grow: 0;
  font-size: 10px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 2px 4px;
  background-color: #fffa;
  border-radius: var(--border-r);
  color: #000;
  display: flex;
  justify-items: center;
  align-items: center;
}
</style>