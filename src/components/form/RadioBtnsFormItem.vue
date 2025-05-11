<script setup>
import { SelectorRadios2 } from '../ui'
import FormItemWrap from './FormItemWrap.vue'

defineProps({
  label: String,
  error: Object,
  name: String,
  options: Object,
  required: Boolean,
})

const form = defineModel()
</script>

<template>
  <FormItemWrap
    :name="name"
    :label="label" 
    :error="error">
    <template #label-extra>
      <slot name="label-extra" />
    </template>
    <SelectorRadios2 
      v-model="form[name]" 
      :options="options" 
      :required="required"
    />
  </FormItemWrap>
</template>