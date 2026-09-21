<script setup lang="ts">
import FormItemWrap from './FormItemWrap.vue'
import type { FetchErrorPayload } from '@/helpers'

defineProps<{
  label?: string
  error?: FetchErrorPayload | null
  name: string
  required?: boolean
  type?: string
  step?: number
  min?: number
  max?: number
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
    <input
      class="text-box"
      v-model="form[name]"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :step="step"
      :min="min"
      :max="max"
    />
  </FormItemWrap>
</template>