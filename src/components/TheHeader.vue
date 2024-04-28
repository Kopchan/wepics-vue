<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { debouncedWatch } from '@vueuse/core'
import OverlayPanel from 'primevue/overlaypanel'
import {
  MenuIcon, ChevronRightIcon, PaletteIcon, LogInIcon, UserIcon, PlusCircleIcon,
  ArrowDownAZIcon, ArrowUpAZIcon, ArrowDown01Icon, ArrowUp01Icon, Share2Icon,
} from 'lucide-vue-next'

import { fetchWrapper } from '@/helpers'
import { useAlbumParamsStore, useAuthStore, useSidebarStore } from '@/stores'
import {
  AuthPanel, UserPanel, SettingsPanel, 
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

// Логика переключение попапа со списком дочерних альбомов
const albumChildren = ref(null)
const toggleSubAlbumsCard = (e, hash) => {
  albumChildren.value = hash
  subAlbumsCard.value.toggle(e)
}

// Заполнение данных об альбоме
onMounted(() => {
  debouncedWatch(
    () => targetAlbum.value,
    () => {
      fetchWrapper.get(
        '/albums/' + targetAlbum.value
      ).then(data => {
        console.log({albumData: data})
        albumData.value = data
      })
    },
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
          <a class="btn" @click="targetAlbum = undefined">Home</a>
          <button 
            class="btn btn--circle folder-select-btn" 
            title="Show subfolders"
            @click="toggleSubAlbumsCard($event, 'root')">
            <ChevronRightIcon size="20" />
          </button>
        </span>
        <span 
          v-for="(parentParams, parent) in albumData?.parentsChain"
          :key="parent"
          class="section">
          <template v-if="parent !== '/'">
            <a class="btn" @click="targetAlbum = parentParams.hash">
              {{ parent }}
            </a>
            <button 
              class="btn btn--circle folder-select-btn" 
              title="Show subfolders"
              @click="toggleSubAlbumsCard($event, parentParams.hash)">
              <ChevronRightIcon size="20" />
            </button>
          </template>
        </span>
        <span
          v-if="targetAlbum !== 'root'" 
          class="section">
          <a class="btn">
            {{ albumData?.name ?? '...' }}
          </a>
          <button 
            class="btn btn--circle folder-select-btn" 
            title="Show subfolders"
            @click="toggleSubAlbumsCard($event, targetAlbum)">
            <ChevronRightIcon size="20" />
          </button>
        </span>
      </div>
      <OverlayPanel ref="subAlbumsCard" class="popup popup--fixed">
        <SubAlbumsPanel :hash="albumChildren"/>
      </OverlayPanel>
      <!-- Сдвиг -->
      <div style="margin-left: auto"></div>
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
  background: linear-gradient(180deg, var(--c-b0), var(--c-b0a));
  position: fixed;
  width: 100%;
  z-index: 100;
  height: var(--header-height);
  backdrop-filter: blur(var(--div-blur));
  .header_inner {
    display: flex;
    align-items: center;
    height: 32px;
    padding: 8px;
    gap: 8px;
  }
  // Путь
  .breadcrumb {
    display: flex;
    height: 32px;
    align-items: center;
    overflow: hidden;
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
}
</style>