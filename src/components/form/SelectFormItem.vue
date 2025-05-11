<script setup>
import FormItemWrap from './FormItemWrap.vue'

defineProps({
  label: String,
  error: Object,
  name: String,
  options: Object,
  required: Boolean,
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