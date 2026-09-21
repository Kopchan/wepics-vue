import { ref } from 'vue'
import { sleep } from '@/helpers'

const MAX_MEDIA_RETRIES = 4
const mediaRetryCounts = ref<Record<string, number>>({})

export function useMediaRetry() {
  const onErrorMediaLoad = async (event: Event) => {
    const target = event.target as HTMLImageElement | HTMLVideoElement | null

    if (!target) {
      console.error('onErrorImgLoad???', event)
      return
    }

    const src = target.src
    mediaRetryCounts.value[src] = mediaRetryCounts.value[src] ?? 0

    console.warn(`onErrorImgLoad (${mediaRetryCounts.value[src]})`, src, target)

    if (mediaRetryCounts.value[src] <= MAX_MEDIA_RETRIES) {
      await sleep(1000)
      mediaRetryCounts.value[src]++
      target.src = ''
      target.src = src
    }
  }

  const resetMediaRetries = () =>
    mediaRetryCounts.value = {}

  return {
    onErrorMediaLoad,
    resetMediaRetries,
  }
}
