<script setup>
import { toRefs } from 'vue'

// Параметры компонента
const props = defineProps({
  name: String,
  options: Object,
  disabled: {
    required: false,
    default: false
  }
})
// v-model компонента
const value = defineModel()

// Параметры компонента в переменные
const { name, options, disabled } = toRefs(props)

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
        :disabled="disabled"
      >
      <label :for="name +'_'+ index" class="btn">{{ option }}</label>
    </template >
  </div>
</template>

<style lang="scss" scoped>
.btn {
  height: unset;
  white-space: pre-line;
}
.line {
  background-color: var(--c-b0a);
  padding: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  border-radius: var(--border-r);
  input[type="radio"] {
    display: none;
    & + label {
      min-height: 24px;
      flex: 1;
    }
    &:checked + label {
      background-color: var(--c-t0);
      color: var(--c-b0);
      &:hover {
        background-color: var(--c-t2);
      }
      &:active {
        background-color: var(--c-t2a);
      }
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
