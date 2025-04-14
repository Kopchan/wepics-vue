<script setup>
import { useServerSetupsStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed, watch } from 'vue'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['blur-change'])

const { ageRatings } = storeToRefs(useServerSetupsStore())
const rating = computed(() => ageRatings.value?.find(r => r.id === props.id))

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

<!-- <style lang="scss" scoped>
.rating {

}
</style> -->