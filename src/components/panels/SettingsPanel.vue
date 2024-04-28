<script setup>
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores'
import { BtnRadios } from '@/components/ui'

// Стор с настроками кастомизации
const settings = useSettingsStore()
const {
  size, isStrictSize, isRealSize, lines, gap, radius, orientation, theme
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

    <!-- Выбор кол-во столбцов/строк -->
    <div class="label-group">
      <label>{{ orientation == 'w' ? 'Columns' : 'Rows' }}</label>
      <input type="number" min="0" max="12" v-model.number="lines" class="text-box">
    </div>
    <input type="range" min="0" max="12" v-model.number="lines">

    <!-- Выбор размера карточек -->
    <div class="label-group">
      <label>{{ orientation == 'w' ? 'Width' : 'Height' }}</label>
      <input type="number" min="144" max="1080" v-model.number="size" class="text-box" :disabled="lines && !isStrictSize">
    </div>
    <input type="range" step="2" min="144" max="1080" v-model.number="size" :disabled="lines && !isStrictSize">
    <BtnRadios name="isRealSize" :options="['Relative', 'Absolute']" v-model="isRealSize" :disabled="lines && !isStrictSize"/>
    <BtnRadios name="isStrictSize" :options="['Fill', 'Strict']" v-model="isStrictSize"/>

    <!-- Выбор размера отступов -->
    <div class="label-group">
      <label>Gap</label>
      <input type="number" min="0" max="32" v-model.number="gap" class="text-box">
    </div>
    <input type="range" min="0" max="32" v-model.number="gap">

    <!-- Выбор размера закругления -->
    <div class="label-group">
      <label>Radius</label>
      <input type="number" min="0" max="32" v-model.number="radius" class="text-box">
    </div>
    <input type="range" min="0" max="32" v-model.number="radius">

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
.label-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}
button {
  margin-top: 12px;
  background-color: var(--c-b0a);
}
h4 {
  text-align: center;
}
</style>