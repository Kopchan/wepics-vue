<script setup>
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores'
import { BtnRadios } from '@/components/ui'

// Стор с настроками кастомизации
const settings = useSettingsStore()
const {
  size, isStrictSize, isRealSize, lines, gap, extGap, radius, orientation, theme, ambient, albumsLayout, lineWidth
} = storeToRefs(settings)
</script>

<template>
  <div class="outer">
    <h4>Customization</h4>

    <!-- Выбор темы -->
    <div class="label-group">
      <label>Theme</label>
    </div>
    <BtnRadios name="theme" :options="{auto: 'Auto', light: 'Light', dark: 'Dark'}" v-model="theme"/>

    <!-- Подсветка изображений (при наведении) -->
    <div class="label-group">
      <label>Ambient</label>
      <label class="switch"><input type="checkbox" v-model.number="ambient"/><div></div></label>
    </div>

    <!-- Выбор размера карточек -->
    <div class="label-group">
      <label>{{ orientation == 'w' ? 'Width' : 'Height' }}</label>
      <input type="number" min="144" max="1080" v-model.number="size" class="text-box small" :disabled="lines && !isStrictSize">
    </div>
    <input type="range" step="2" min="144" max="1080" v-model.number="size" :disabled="lines && !isStrictSize">

    <!-- Выбор размера отступов -->
    <div class="label-group">
      <label>Gap</label>
      <input type="number" min="0" max="32" v-model.number="gap" class="text-box small">
    </div>
    <input type="range" min="0" max="32" v-model.number="gap">

    <!-- Переключение отступов по краям окна -->
    <div class="label-group">
      <label>External gap</label>
      <label class="switch"><input type="checkbox" v-model.number="extGap"/><div></div></label>
    </div>

    <!-- Выбор размера закругления -->
    <div class="label-group">
      <label>Radius</label>
      <input type="number" min="0" max="32" v-model.number="radius" class="text-box small">
    </div>
    <input type="range" min="0" max="32" v-model.number="radius">

    <!-- Выбор разметки подальбомов -->
    <div class="label-group">
      <label>Sub-albums</label>
    </div>
    <BtnRadios name="subalbums" :options="{hide: 'Hide', grid: 'Grid', lines: 'Lines'}" v-model="albumsLayout"/>

    <!-- Выбор ширины столбцов линий -->
    <template v-if="albumsLayout == 'lines'">
      <div class="label-group">
        <label>Line width</label>
        <input type="number" min="0" max="3840" v-model.number="lineWidth" class="text-box small">
      </div>
      <input type="range" min="0" max="3840" v-model.number="lineWidth">
    </template>

    <button class="btn" @click="settings.reset">Reset</button>
  </div>
</template>

<style lang="scss" scoped>
.outer {
  min-width: 0;
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
button {
  margin-top: 12px;
  background-color: var(--c-b0a);
}
h4 {
  text-align: center;
}
</style>