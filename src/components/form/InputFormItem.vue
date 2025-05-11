<script setup>
import FormItemWrap from './FormItemWrap.vue'

defineProps({
  label: String,
  error: Object,
  name: String,
  required: Boolean,
  type: String,
  step: Number,
  min: Number,
  max: Number,
  placeholder: String,
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