<script setup>
/**
 * @typedef {Object} Option
 * @property {string} icon
 * @property {string} name
 */

import { toRefs } from 'vue'

// Параметры компонента
const props = defineProps({
  name: {
    type: String,
    required: false,
    default: Math.random().toString(),
  },
  /** @type {import('vue').PropType<Option[]>} */
  options: {
    type: Object,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  squared: {
    type: Boolean,
    required: false,
    default: false,
  },
  background: {
    type: Boolean,
    required: false,
    default: true,
  },
  point: {
    type: String,
    required: false,
    default: null,
  },
})
// v-model компонента
const value = defineModel()

// Параметры компонента в переменные
const { name, options, disabled, squared, background, point } = toRefs(props)

// Установка по умолчанию
value.value ??= Object.keys(options.value)[0]
</script>

<template>
  <div class="line">
    <template v-for="(option, index) in options" :key="index">
      <input
        type="radio"
        v-model="value"
        :name  ="name"
        :value ="index"
        :id    ="name +'_'+ index"
        :disabled="disabled || option?.disabled"
      >
      <label class="btn"
        :for="name +'_'+ index"
        :title="option?.name"
        :class="{
          'btn--quad': squared, 
          'point': index === point
        }"
        :style="{
          '--selectColor':   option?.color,
          '--selectColorFg': option?.color ? 'white' : null,
        }"
      >
        <component :is="option?.icon" /> 
        {{ squared ? null : option?.name }}
      </label>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.btn {
  height: unset;
  white-space: pre-line;
}
.line {
  background-color: v-bind('background ? "var(--c-b0a)" : "transparent"');
  padding: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: v-bind('squared ? "0" : "6px"');
  border-radius: var(--border-r);
  --selectColor: var(--c-t0);
  --selectColorFg: var(--c-b0);
  input[type="radio"] {
    display: none;
    & + label {
      min-height: 24px;
      min-width: unset;
      height: v-bind('squared ? "30px" : "none"');
      width:  v-bind('squared ? "30px" : "none"');
      flex: 1;
      &.point {
        color: var(--selectColor);
      }
    }
    &:checked + label {
      background-color: var(--selectColor);
      color: var(--selectColorFg);
    }
    &:disabled + label {
      background-color: transparent;
      cursor: not-allowed;
      color: var(--c-t2a);
    }
    &:disabled:checked + label {
      background-color: var(--c-t2a);
      cursor: not-allowed;
      color: var(--c-b2);
    }
  }
}
</style>
