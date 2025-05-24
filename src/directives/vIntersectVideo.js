// intersectVideo.js

import { useAlbumParamsStore } from "@/stores"
import { watch } from "vue"


export default {
  mounted(el) {
    const store = useAlbumParamsStore()
    
    const state = {
      entry: null,
    }

    const checkVisibilityAndState = (entry) => {
      state.entry = entry

      if (store.fullImage) {
        el.pause?.()
        return
      }

      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        el.play?.().catch(() => {})
      } else {
        el.pause?.()
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => checkVisibilityAndState(entry),
      { threshold: [0, 0.5, 1] }
    )

    observer.observe(el)
    el._observer = observer

    // Watch for fullImage changes
    el._unwatchFullImage = watch(
      () => store.fullImage,
      (val) => {
        if (val) {
          el.pause?.()
        } else if (
          state.entry?.isIntersecting &&
          state.entry?.intersectionRatio > 0.5
        ) {
          el.play?.().catch(() => {})
        }
      },
      { immediate: true }
    )
  },

  unmounted(el) {
    el._observer?.unobserve(el)
    el._observer?.disconnect()
    delete el._observer

    el._unwatchFullImage?.()
    delete el._unwatchFullImage
  }
}