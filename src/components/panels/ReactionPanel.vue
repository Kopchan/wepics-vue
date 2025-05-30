<script setup>
import { ref } from 'vue'
import { toggleReaction } from '@/helpers'
import { storeToRefs } from 'pinia'
import { useServerSetupsStore } from '@/stores'
// Параметры компонента
/*const props =*/ defineProps({
  albumHash: String,
  image: Object,
})

// Параметры компонента в переменные
//const { image } = toRefs(props)

// v-model компонента
//const value = defineModel()

const error = ref()

// Получение разрешённых реакций 
const { allowedReactions } = storeToRefs(useServerSetupsStore())

</script>

<template>
  <div class="outer">
    <div class="options">
      <button class="btn btn--quad option"
        v-for="option in allowedReactions"
        :key="option"
        :class="{'btn--inverse': image?.reactions?.[option.value]?.isYouSet}"
        @click.stop="toggleReaction(image?.album?.hash ?? albumHash, image, option.value)">
        {{ option.value }}
      </button>
    </div>
    <div v-if="error" class="error">
      <p v-if="error?.message">{{ error.message }}</p>
      <p v-else>Something going wrong</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.outer {
  width: 256px;
  padding: 8px;
}
h4 {
  text-align: center;
}
.error {
  background-color: var(--red-bg);
  padding: 10px;
  border-radius: var(--border-r);
}
.options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
  overflow-x: auto;
}
</style>
