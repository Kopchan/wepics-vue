<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { debouncedWatch, useWindowScroll } from '@vueuse/core'
import OverlayPanel from 'primevue/overlaypanel'
import {
  MenuIcon, ChevronRightIcon, PaletteIcon, LogInIcon, UserIcon, PlusCircleIcon, PenIcon,
  ArrowDownAZIcon, ArrowUpAZIcon, ArrowDown01Icon, ArrowUp01Icon, Share2Icon, RefreshCcwIcon
} from 'lucide-vue-next'

import { fetchWrapper, sleep } from '@/helpers';
import { useAlbumParamsStore, useAuthStore, useSidebarStore } from '@/stores'
import { urls } from '@/api'
import {
  AuthPanel, UserPanel, SettingsPanel, AlbumRenamePanel,
  SubAlbumsPanel, AlbumSharePanel, ObjCreatePanel
} from '@/components/panels'

// Попапы
const { isOpened } = storeToRefs(useSidebarStore())

// Данные об текущем открытом альбоме
const {
  targetAlbum, sort, isReverse, albumData
} = storeToRefs(useAlbumParamsStore())

// Данные об текущем пользователе
const { user } = storeToRefs(useAuthStore())

// Попапы
const authCard = ref()
const userCard = ref()
const customizCard = ref()
const subAlbumsCard = ref()
const albumShareCard = ref()
const objCreateCard = ref()
const albumRenameCard = ref()

// Логика переключение попапа со списком дочерних альбомов
const albumChildren = ref(null)
const albumChildrenNextName = ref(null)
const toggleSubAlbumsCard = (e, hash, nextName) => {
  albumChildren.value = hash
  albumChildrenNextName.value = nextName
  subAlbumsCard.value.toggle(e)
}

const isLoading = ref(null)
const isError = ref(false)
const { y: yScroll } = useWindowScroll();
const isScrolledDown = computed(() => yScroll.value !== 0)

// Запрос данных об альбоме
const getAlbumData = async () => {
  isLoading.value = true
  isError.value = false

  await fetchWrapper.get(
    urls.albumInfo(targetAlbum.value)
  ).then(data => {
    albumData.value = data
  }).catch(() => {
    isError.value = true
  })

  isLoading.value = false
}

// Запрос на переиндексацию
const reindexAlbum = () => {
  isLoading.value = true
  fetchWrapper.get(
    urls.albumReindex(targetAlbum.value)
  ).then(async () => {
    const temp = targetAlbum.value
    targetAlbum.value = null // FIXME: успевает за это время загрузить root альбом
    await sleep(10)
    targetAlbum.value = temp
  })
}

function getNextFieldValue(obj, currentKey) {
  const keys = Object.keys(obj?.parentsChain || {});
  const currentIndex = keys.indexOf(currentKey);

  if (currentIndex === keys.length - 1) {
    return obj.name;
  }
  if (currentIndex === -1) {
    return;
  }

  const nextKey = keys[currentIndex + 1];
  return nextKey;
}

// Заполнение данных об альбоме при изменении открытого альбома
onMounted(() => {
  debouncedWatch(
    () => targetAlbum.value,
    () => getAlbumData(),
    { debounce: 250, immediate: true }
  )
})
</script>

<template>
  <header>
    <div class="header_inner">
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
            @click="toggleSubAlbumsCard($event, 'root', getNextFieldValue(albumData, '/'))">
            <ChevronRightIcon size="20" />
          </button>
        </span>
        <span 
          v-for="(parentParams, parent) in albumData?.parentsChain"
          :key="parent"
          class="section">
          <template v-if="parent !== '/'">
            <RouterLink class="btn" :to="{ path: parentParams.hash, query: $route.query }">
              {{ parent }}
            </RouterLink>
            <button 
              class="btn btn--circle folder-select-btn" 
              title="Show subfolders"
              @click="toggleSubAlbumsCard($event, parentParams.hash, getNextFieldValue(albumData, parent))">
              <ChevronRightIcon size="20" />
            </button>
          </template>
        </span>
        <span
          v-if="targetAlbum !== 'root'" 
          class="section">
          <RouterLink class="btn" :to="{ path: targetAlbum, query: $route.query }">
            {{ albumData?.name ?? '...' }}
          </RouterLink>
          <button v-if="user.isAdmin"
            class="btn btn--circle folder-select-btn" 
            title="Rename current album"
            @click="albumRenameCard.toggle">
            <PenIcon size="20" />
          </button>
          <button v-if="albumData?.children"
            class="btn btn--circle folder-select-btn" 
            title="Show subfolders"
            @click="toggleSubAlbumsCard($event, targetAlbum, null)">
            <ChevronRightIcon size="20" />
          </button>
        </span>
      </div>
      <!--    =  Панель переименования  =    -->
      <OverlayPanel ref="albumRenameCard" class="popup popup--fixed">
        <AlbumRenamePanel :hash="targetAlbum"/>
      </OverlayPanel>
      <!--    =  Панель выбора дочернего альбома  =    -->
      <OverlayPanel ref="subAlbumsCard" class="popup popup--fixed">
        <SubAlbumsPanel :hash="albumChildren" :nextName="albumChildrenNextName"/>
      </OverlayPanel>
      <!-- Сдвиг -->
      <div style="margin-left: auto"></div>
      <!--    =  Кнопка переиндексации  =    -->
      <button
        class="btn btn--quad"
        title="Reindex this album"
        :disabled="isLoading"
        :class="{spin: isLoading, error: isError}"
        @click="reindexAlbum">
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
        <ObjCreatePanel :hash="targetAlbum"/>
      </OverlayPanel>
      <!--    =  Панель поделится  =    -->
      <button
        class="btn btn--quad"
        title="Open share panel"
        v-if="user.isAdmin"
        @click="albumShareCard.toggle">
        <Share2Icon size="20"/>
      </button>
      <OverlayPanel ref="albumShareCard" class="popup popup--fixed">
        <AlbumSharePanel :hash="targetAlbum"/>
      </OverlayPanel>
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
  </header>
</template>

<style lang="scss" scoped>
header {
  top: 0;
  background: linear-gradient(180deg, var(--c-b0), v-bind("isScrolledDown ? 'var(--c-b0a)' : 'transparent'"));
  position: fixed;
  width: 100%;
  z-index: 100;
  height: var(--header-height);
  backdrop-filter: v-bind("isScrolledDown ? 'blur(var(--div-blur))' : 'none'");
  -webkit-app-region: drag;
  .header_inner {
    overflow-x: auto;
    display: flex;
    align-items: center;
    height: 32px;
    padding: 8px;
    left: env(titlebar-area-x, 0);
    top: env(titlebar-area-y, 0);
    width: calc(env(titlebar-area-width, 100%) - 16px);
    gap: 8px;
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