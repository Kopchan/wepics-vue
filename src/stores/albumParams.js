import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'

export const useAlbumParamsStore = defineStore('albumParams', () => {
  const router = useRoute()

  const targetAlbum = computed(() => router.params?.albumHash || 'root')
  const perPage     = computed(() => router.query ?.perPage   ||    30 )
  const sort        = computed(() => router.query ?.sort      || 'name')
  const isReverse   = computed(() => router.query ?.reverse   === null )
  
  return { targetAlbum, perPage, sort, isReverse }
})
