<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { debouncedWatch, useWindowScroll } from '@vueuse/core'
import OverlayPanel from 'primevue/overlaypanel'
import { useRoute, useRouter } from 'vue-router'
import {
  MenuIcon, ChevronRightIcon, PaletteIcon, LogInIcon, UserIcon, PlusCircleIcon, PenIcon,
  ArrowDownAZIcon, ArrowUpAZIcon, ArrowDown01Icon, ArrowUp01Icon, Share2Icon, RefreshCcwIcon, WorkflowIcon,
  ViewIcon, FoldersIcon, ImagesIcon, SaveIcon
} from 'lucide-vue-next'

import { fetchWrapper, humanCount, humanFileSize, sleep } from '@/helpers'
import { useAlbumParamsStore, useAuthStore, useSidebarStore } from '@/stores'
import { urls } from '@/api'
import {
  AuthPanel, UserPanel, SettingsPanel, AlbumEditPanel,
  SubAlbumsPanel, AlbumSharePanel, ObjCreatePanel, SetupsPanel
} from '@/components/panels'
import AgeRatingLabel from './AgeRatingLabel.vue'

// Попапы
const { isOpened } = storeToRefs(useSidebarStore())

// Данные об текущем открытом альбоме
const {
  targetAlbum, albumData, 
  sort, sortAlbums, isReverse, isReverseAlbums, disrespect,
  tags, nested, limit
} = storeToRefs(useAlbumParamsStore())

// Данные об текущем пользователе
const { user } = storeToRefs(useAuthStore())

// Попапы
const authCard = ref()
const userCard = ref()
const customizCard = ref()
const subAlbumsCard = ref()
const setupsCard = ref()
const albumShareCard = ref()
const objCreateCard = ref()
const albumRenameCard = ref()

// Логика переключение попапа со списком дочерних альбомов
const albumChildren = ref(null)
const albumChildSelect = ref(null)
const toggleSubAlbumsCard = (e, hash, selectedHash) => {
  console.log('toggleSubAlbumsCard', selectedHash)
  albumChildren.value = hash
  albumChildSelect.value = selectedHash
  subAlbumsCard.value.toggle(e)
}

const isLoading = ref(null)
const isError = ref(false)
const { y: yScroll } = useWindowScroll()
const isScrolledDown = computed(() => yScroll.value !== 0)


const router = useRouter()
const route = useRoute()

// Запрос данных об альбоме
const getAlbumData = async (newHash = null, oldHash = null) => {
  isLoading.value = true
  isError.value = false
  albumData.value.hash = null

  //console.log(newHash, oldHash, albumData.value, albumData.value != null, !!albumData.value)

  // Перемещение уже известных данных
  let canFind = oldHash != null && (
    newHash != albumData.value?.alias || newHash != oldHash
  )
  // Если переместились на предка
  if (canFind)
    albumData.value?.ancestors?.forEach((ancestor, index) => {
      //console.log(ancestor, index)
      if (ancestor.hash === newHash || ancestor?.alias === newHash) {
        canFind = false
        //console.log('ans', albumData.value.ancestors?.slice(0, index))
        albumData.value = {
          ...ancestor, 
          ancestors: albumData.value.ancestors?.slice(0, index),
          children: (index + 1) in albumData.value.ancestors ? [
            albumData.value.ancestors[index + 1]
          ] : undefined,
        }
      }
    })

  // Если переместились на ребёнка
  if (canFind)
    albumData.value?.children?.forEach(child => {
      if (child.hash === newHash || child?.alias === newHash) {
        canFind = false
        //console.log('chd', child)
        albumData.value = {
          ...child, 
          ancestors: [...albumData.value.ancestors, albumData.value],
        }
      }
    })
  

  // Основной запрос информации об альбоме
  await fetchWrapper.get(
    urls.albumInfo(newHash ?? targetAlbum.value, { 
      sort: sort.value, 
      sortAlbums: sortAlbums.value, 
      isReverse: isReverse.value,
      isReverseAlbums: isReverseAlbums.value,
      disrespect: disrespect.value,
      tags: tags.value,
      images: Math.max(limit.value, 4),
      nested: nested.value,
    })
  ).catch(err => {
    isError.value = true
    isLoading.value = false
    console.log(err)
  }).then(data => {
    if  (targetAlbum.value && (
      targetAlbum.value != data?.alias && 
      targetAlbum.value != data?.hash
    )) return

    if (data?.alias && targetAlbum.value != data?.alias) {
      router.replace({
        name: 'openAlbum',
        params: { album: data.alias },
        query: route.query
      })
    }

    albumData.value = {
      ...albumData.value, 
      ...data, 
      contentSortField: sortAlbums.value === 'content' ? sort.value : null
    }
    isError.value = false
    isLoading.value = false
  }).catch(err => {
    isError.value = true
    isLoading.value = false
    console.log(err)
  })
}

// Запрос на переиндексацию
const reindexAlbum = () => {
  isLoading.value = true
  fetchWrapper.get(
    urls.albumReindex(albumData.value?.hash ?? targetAlbum.value)
  ).then(async () => {
    const temp = albumData.value?.hash ?? targetAlbum.value
    targetAlbum.value = null // FIXME: успевает за это время загрузить root альбом
    await sleep(10)
    targetAlbum.value = temp
  })
}

// Заполнение данных об альбоме при изменении открытого альбома
onMounted(() => {
  debouncedWatch(
    targetAlbum,
    getAlbumData,
    { debounce: 250, immediate: true }
  )
})
</script>

<template>
  <header>
    <div class="header_inner">
      <div class="left">
        <!--    =  Кнопка меню  =    -->
        <div class="menu-btn-place">
          <button 
            class="btn btn--quad menu-btn" 
            title="Toggle menu" 
            @click="isOpened = !isOpened">
            <MenuIcon size="20"/>
          </button>
        </div>
        <!--    =  Навигационная цепочка  =    -->
        <div class="breadcrumb">
          <span class="section">
            <RouterLink class="btn" :to="{ path: '/', query: $route.query }">Home</RouterLink>
            <button
              class="btn btn--circle folder-select-btn" 
              title="Show subfolders"
              @click="toggleSubAlbumsCard($event, 'root', albumData?.ancestors[1]?.hash)">
              <ChevronRightIcon size="20" />
            </button>
          </span>
          <span 
            v-for="(ancestor, index) in albumData?.ancestors?.slice(1)"
            :key="index"
            class="section">
            <template v-if="index !== '/'">
              <RouterLink class="btn" :to="{ 
                name: 'openAlbum',
                params: { album: ancestor?.alias ?? ancestor.hash }, 
                query: $route.query 
              }">
                {{ ancestor.name }}
              </RouterLink>
              <button 
                class="btn btn--circle folder-select-btn" 
                title="Show subfolders"
                @click="toggleSubAlbumsCard(
                  $event, 
                  ancestor.hash, 
                  albumData?.ancestors[index + 2]?.hash ?? albumData?.hash
                )">
                <ChevronRightIcon size="20" />
              </button>
            </template>
          </span>
          <span
            v-if="targetAlbum !== 'root'" 
            class="section">
            <RouterLink class="btn" :to="{ 
              name: 'openAlbum',
              params: { album: albumData?.alias ?? targetAlbum }, 
              query: $route.query 
            }">
              {{ albumData?.name ?? '...' }}
            </RouterLink>
            <button v-if="user.isAdmin"
              class="btn btn--circle folder-select-btn" 
              title="Edit current album"
              @click="albumRenameCard.toggle">
              <PenIcon size="20" />
            </button>
            <button v-if="albumData?.children?.length"
              class="btn btn--circle folder-select-btn" 
              title="Show subfolders"
              @click="toggleSubAlbumsCard($event, albumData.value?.hash ?? targetAlbum, null)">
              <ChevronRightIcon size="20" />
            </button>
          </span>
        </div>
        <!--    =  Панель редактирования  =    -->
        <OverlayPanel ref="albumRenameCard" class="popup popup--fixed">
          <AlbumEditPanel :album="albumData"/>
        </OverlayPanel>
        <!--    =  Панель выбора дочернего альбома  =    -->
        <OverlayPanel ref="subAlbumsCard" class="popup popup--fixed">
          <SubAlbumsPanel :hash="albumChildren" :selectedAlbumHash="albumChildSelect"/>
        </OverlayPanel>
      </div>

      <div class="center">
        <AgeRatingLabel class="inline"
          :ratingId="albumData?.ratingId"
          v-if="albumData?.ratingId"
        />
        <div class="inline" v-if="albumData?.albumsCount">
          <FoldersIcon size="18"/>
          <span>{{ albumData.albumsCount }}</span>
        </div>
        <div class="inline" v-if="albumData?.imagesCount || albumData?.nestedImagesCount">
          <ImagesIcon size="18"/>
          <span>
            <template v-if="albumData?.imagesCount">
              {{ albumData.imagesCount.toLocaleString() }}
              <template v-if="albumData?.nestedImagesCount && albumData.nestedImagesCount > albumData.imagesCount">
                (+{{ (albumData.nestedImagesCount - albumData.imagesCount).toLocaleString() }})
              </template>
            </template>
            <template v-else>
              ({{ albumData.nestedImagesCount.toLocaleString() }})
            </template>
          </span>
        </div>
        <div class="inline" v-if="albumData?.size">
          <SaveIcon size="18"/>
          <span>{{ humanFileSize(albumData.size) }}</span>
        </div>
      </div>

      <div class="right">
        <!--    =  Панель переиндексации  =    -->
        <button
          class="btn btn--quad"
          title="Reindex this album"
          :disabled="isLoading"
          :class="{spin: isLoading, error: isError}"
          @click="isError ? getAlbumData : reindexAlbum">
          <RefreshCcwIcon size="20"/>
        </button>
        <!--    =  Панель создания  =    -->
        <button
          class="btn btn--quad"
          title="Open creation panel"
          v-if="user.isAdmin"
          @click="objCreateCard.toggle">
          <PlusCircleIcon size="20"/>
        </button>
        <OverlayPanel ref="objCreateCard" class="popup popup--fixed">
          <ObjCreatePanel :hash="albumData.value?.hash ?? targetAlbum"/>
        </OverlayPanel>
        <!--    =  Панель предустановок  =    -->
        <button
          class="btn btn--quad"
          title="Open setups panel"
          @click="setupsCard.toggle">
          <ViewIcon size="20"/>
        </button>
        <OverlayPanel ref="setupsCard" class="popup popup--fixed">
          <SetupsPanel :hash="albumData.value?.hash ?? targetAlbum"/>
        </OverlayPanel>
        <!--    =  Панель поделиться  =    -->
        <button
          class="btn btn--quad"
          title="Open share panel"
          v-if="user.isAdmin"
          @click="albumShareCard.toggle">
          <Share2Icon size="20"/>
        </button>
        <OverlayPanel ref="albumShareCard" class="popup popup--fixed">
          <AlbumSharePanel :hash="albumData.value?.hash ?? targetAlbum"/>
        </OverlayPanel>
        <!--    =  Переключатель   =    -->
        <button
          class="btn btn--quad"
          :class="{'btn--inverse': nested}"
          title="Switch nested"
          @click="nested = !nested">
          <WorkflowIcon size="20"/>
        </button>
        <!--    =  Сортировка =     -->
        <button
          class="btn btn--quad change-direction-btn"
          title="Change sort direction"
          @click="isReverse = !isReverse">
          <template v-if="sort == 'name'">
            <ArrowUpAZIcon size="20" v-if="isReverse"/>
            <ArrowDownAZIcon size="20" v-else/>
          </template>
          <template v-else>
            <ArrowUp01Icon size="20" v-if="isReverse"/>
            <ArrowDown01Icon size="20" v-else/>
          </template>
        </button>
        <select class="droplist sort-droplist" title="Sort type" v-model="sort">
          <option value="name">Name</option>
          <option value="date">Date</option>
          <option value="size">Size</option>
          <option value="height">Height</option>
          <option value="width">Width</option>
          <option value="ratio">Ratio</option>
          <option value="square">Square</option>
          <option value="reacts">Reacts</option>
        </select>
        <!--    =  Панель кастомизации =     -->
        <button
          class="btn btn--quad"
          title="Open customization panel"
          @click="customizCard.toggle">
          <PaletteIcon size="20"/>
        </button>
        <OverlayPanel ref="customizCard" class="popup popup--fixed">
          <SettingsPanel/>
        </OverlayPanel>
        <!--    =  Панель пользователя  =    -->
        <button
          class="btn btn--quad"
          title="Open user panel"
          v-if="user.nickname"
          @click="userCard.toggle">
          <UserIcon size="20"/>
        </button>
        <OverlayPanel ref="userCard" class="popup popup--fixed" v-if="user.nickname">
          <UserPanel/>
        </OverlayPanel>
        <!--    =  Авторизация  =    -->
        <button
          class="btn btn--quad"
          title="Open authorization form"
          v-else
          @click="authCard.toggle">
          <LogInIcon size="20"/>
        </button>
        <OverlayPanel ref="authCard" class="popup popup--fixed" v-if="!user.nickname">
          <AuthPanel/>
        </OverlayPanel>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
header {
  background: linear-gradient(180deg, var(--c-b0), v-bind("isScrolledDown ? 'var(--c-b0a)' : 'transparent'"));
  position: fixed;
  width: 100%;
  z-index: 100;
  height: var(--header-height);
  backdrop-filter: v-bind("isScrolledDown ? 'blur(var(--div-blur))' : 'none'");
  -webkit-app-region: drag;
  overflow-x: auto;
  .header_inner {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    left: env(titlebar-area-x, 0);
    top: env(titlebar-area-y, 0);
    width: calc(env(titlebar-area-width, 100%) - 16px);
    min-width: max-content;
    gap: 8px;
    padding: 8px;
  }
  .left, .right {
    display: flex;
    gap: 8px;
    flex: 1;
  }
  .right {
    justify-content: flex-end;
  }
  .center {
    flex: 0 0 auto;
    display: flex;
    gap: 8px;
    .inline {
      display: flex;
      justify-items: center;
      align-items: center;
      gap: 2px;
      text-align: center;
      color: var(--c-t2a);
    }
  }
  // Путь
  .breadcrumb {
    display: flex;
    height: 32px;
    align-items: center;
    //overflow: hidden;
    .section {
      display: flex;
      align-items: center;
    }
    a {
      height: 24px;
      padding: 0 6px;
      border-radius: var(--border-r);
      overflow: hidden;
      text-overflow: ellipsis;
      text-wrap: nowrap;
    }
    .folder-select-btn {
      color: var(--c-t7);
      margin: 0 2px;
      &:hover {
        color: var(--c-t0);
      }
    }
  }
  .spin > *:first-child {
    animation: spin 4s linear infinite;
  }
  @keyframes spin { 
    100% {
      transform:rotate(360deg); 
    } 
  }
  .error > *:first-child {
    color: red;
  }
  .btn,
  .droplist  {
    -webkit-app-region: none;
  }
}
</style>