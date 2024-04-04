<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAlbumParamsStore, useAuthStore } from '@/stores'
import OverlayPanel from 'primevue/overlaypanel'
import { AuthPanel, UserPanel, SettingsPanel } from '@/components/panels'
import {
  Menu, ChevronRight, Palette, LogIn, User,
  ArrowDownAZ, ArrowUpAZ, ArrowDown01, ArrowUp01,
} from 'lucide-vue-next'

const {
  targetAlbum, sort, isReverse
} = storeToRefs(useAlbumParamsStore())

const { user } = storeToRefs(useAuthStore())

const authCard = ref()
const userCard = ref()
const customizCard = ref()
const toggleAuthCard     = (e) =>     authCard.value.toggle(e)
const toggleUserCard     = (e) =>     userCard.value.toggle(e)
const toggleCustomizCard = (e) => customizCard.value.toggle(e)
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
        <!--
        <span class="section"><RouterLink class="btn" to="/">Home</RouterLink></span>
        -->
        <span class="section" @click="targetAlbum = undefined"><a class="btn">Home</a></span>
        <span class="section" @click="targetAlbum = 'ySzskg9sYx2QolqlW62rBsQam'"><a class="btn">ATyans</a></span>
        <span class="section" @click="targetAlbum = 'nQVSxuzLxP2iKVP7AUdxqBb8o'"><a class="btn">Port</a></span>
        <button class="btn btn--circle folder-select-btn" title="Show subfolders">
          <ChevronRight size="20" />
        </button>
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
        @click="toggleCustomizCard">
        <Palette size="20"/>
      </button>
      <!--    =  Панель пользователя  =    -->
      <button
        class="btn btn--quad"
        title="Open user panel"
        v-if="user.nickname"
        @click="toggleUserCard">
        <User size="20"/>
      </button>
      <!--    =  Авторизация  =    -->
      <button
        class="btn btn--quad"
        title="Open authorization form"
        v-else
        @click="toggleAuthCard">
        <LogIn size="20"/>
      </button>
    </div>
  </header>
 
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
    .section {
      display: flex;
      align-items: center;
      &:not(:first-child)::before {
        content: '/';
        color: var(--c-t7);
        font-size: 24px;
        padding: 0 4px;
      }
    }
    a {
      height: 24px;
      padding: 0 6px;
      border-radius: var(--border-r);
      overflow: hidden;
      text-overflow: ellipsis;
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