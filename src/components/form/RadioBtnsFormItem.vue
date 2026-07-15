<script setup lang="ts">
import { SelectorRadios2 } from '../ui'
import FormItemWrap from './FormItemWrap.vue'
import type { FetchErrorPayload } from '@/helpers'
import type { SelectorOption } from '@/types'

defineProps<{
  label?: string
  error?: FetchErrorPayload | null
  name: string
  options?: SelectorOption[]
  required?: boolean
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
    <SelectorRadios2
      v-model="form[name]"
      :options="options ?? []"
      :required="required"
    />
  </FormItemWrap>
</template>