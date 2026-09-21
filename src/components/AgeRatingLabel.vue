<script setup lang="ts">
import { useServerSetupsStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed, watch } from 'vue'
import type { AgeRating } from '@/types'

const props = defineProps<{
  ratingId?: string | number
  rating?: AgeRating
}>()

//const emit = defineEmits(['blur-change'])

const { ageRatings } = storeToRefs(useServerSetupsStore())

const rating = props.rating ?? computed(() => ageRatings.value?.find(r => r.id === props.ratingId))

// Возвращаем blur наружу (для родителя)

//watch(rating, (newVal) => {
//  emit('blur-change', newVal?.preset === 'blur')
//})
</script>

<template>
  <p 
    class="rating"
    :style="{ color: rating?.color }"
    :title="rating?.description">
    {{ rating?.code }}
  </p>
</template>

<style lang="scss" scoped>
.rating {
  text-shadow: 1px 1px 0px black;
  font-weight: 600;
  font-size: 18px;
}
</style>