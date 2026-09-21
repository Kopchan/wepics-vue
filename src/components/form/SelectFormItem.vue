<script setup lang="ts">
import FormItemWrap from './FormItemWrap.vue'
import type { FetchErrorPayload } from '@/helpers'

defineProps<{
  label?: string
  error?: FetchErrorPayload | null
  name: string
  options?: Record<string, unknown>
  required?: boolean
  placeholder?: string
}>()

const form = defineModel<Record<string, unknown>>({ required: true })
</script>

<template>
  <FormItemWrap
    :name="name"
    :label="label"
    :error="error">
    <template #label-extra>
      <slot name="label-extra" />
    </template>
    <select
      class="text-box"
      v-model="form[name]"
      :placeholder="placeholder"
      :required="required"
    >
      <option v-for="(value, name) in options" 
        :key="name" 
        :value="value"
      >
        {{ name }}
      </option>
    </select>
  </FormItemWrap>
</template>