<script setup>

defineProps({
  label: String,
  name: String,
  error: Object,
})
</script>

<template>
  <div class="form-item-wrap">
    <div class="label-group" v-if="label">
      <label>{{ label }}</label>
      <slot name="label-extra" />
    </div>

    <div class="slot">
      <slot />
    </div>
    
    <div class="errors">
      <p v-for="(err, index) in error?.errors?.[name]" :key="index">
        {{ err }}
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.slot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  margin-bottom: 4px;
  ::v-deep(> *) {
    flex: 1;
  }
}
.errors {
  min-height: 14px;
  font-size: 12px;
  color: var(--red);
}
</style>