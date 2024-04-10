<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia'
import OverlayPanel from 'primevue/overlaypanel'
import {
  Menu, ChevronRight, Palette, LogIn, User,
  ArrowDownAZ, ArrowUpAZ, ArrowDown01, ArrowUp01,
} from 'lucide-vue-next'

import { fetchWrapper, debounceImmediate } from '@/helpers';
import { router } from '@/router'
import { useAlbumParamsStore, useAuthStore } from '@/stores'
import { 
  AuthPanel, UserPanel, SettingsPanel, SubAlbumsPanel 
} from '@/components/panels'
import { debouncedWatch } from '@vueuse/core';

const albumParamsStore = useAlbumParamsStore()

const {
  targetAlbum, sort, isReverse, albumData
} = storeToRefs(albumParamsStore)

const { user } = storeToRefs(useAuthStore())


const authCard = ref()
const userCard = ref()
const customizCard = ref()
const subAlbumsCard = ref()

const albumChildren = ref(null)

const toggleSubAlbumsCard = (e, hash) => {
  albumChildren.value = hash
  subAlbumsCard.value.toggle(e)
}

onMounted(() => {
  debouncedWatch(
    () => targetAlbum.value,
    () => {
      fetchWrapper.get(
        '/albums/' + targetAlbum.value
      ).then(data => {
        albumData.value = data
      })
    },
    { debounce: 250 }
  )
})
</script>

<template>
  <header>
    <div class="header_inner d-flex ai-cen">
      <!--    =  Кнопка меню  =    -->
      <div class="menu-btn-place">
        <button class="btn btn--quad menu-btn" title="Toggle menu" @click="toggleSidebar">
          <Menu size="20"/>
        </button>
      </div>
      <!--    =  Путь  =    -->
      <div class="breadcrumb">
        <span class="section">
          <a class="btn" @click="targetAlbum = undefined">Home</a>
          <button 
            class="btn btn--circle folder-select-btn" 
            title="Show subfolders"
            @click="toggleSubAlbumsCard($event, 'root')">
            <ChevronRight size="20" />
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
              <ChevronRight size="20" />
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
            <ChevronRight size="20" />
          </button>
        </span>
      </div>
      <!-- Сдвиг -->
      <div style="margin-left: auto;"></div>
      <!--    =  Сортировка  =    -->
     
      <button
        class="btn btn--quad change-direction-btn"
        title="Change sort direction"
        @click="isReverse = !isReverse">
        <template v-if="sort == 'name'">
          <ArrowUpAZ size="20" v-if="isReverse"/>
          <ArrowDownAZ size="20" v-else/>
        </template>
        <template v-else>
          <ArrowUp01 size="20" v-if="isReverse"/>
          <ArrowDown01 size="20" v-else/>
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
      <!--    =  Кастомизации =     -->
      <button
        class="btn btn--quad"
        title="Open customization panel"
        @click="customizCard.toggle">
        <Palette size="20"/>
      </button>
      <!--    =  Панель пользователя  =    -->
      <button
        class="btn btn--quad"
        title="Open user panel"
        v-if="user.nickname"
        @click="userCard.toggle">
        <User size="20"/>
      </button>
      <!--    =  Авторизация  =    -->
      <button
        class="btn btn--quad"
        title="Open authorization form"
        v-else
        @click="authCard.toggle">
        <LogIn size="20"/>
      </button>
    </div>
  </header>
 
 <OverlayPanel ref="subAlbumsCard" class="popup popup--fixed">
   <SubAlbumsPanel :hash="albumChildren"/>
 </OverlayPanel>
 
  <OverlayPanel ref="customizCard" class="popup popup--fixed">
    <SettingsPanel/>
  </OverlayPanel>
 
  <OverlayPanel ref="userCard" class="popup popup--fixed" v-if="user.nickname">
    <UserPanel/>
  </OverlayPanel>

  <OverlayPanel ref="authCard" class="popup popup--fixed" v-if="!user.nickname">
    <AuthPanel/>
  </OverlayPanel>
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