import { useRouterHandlerStore } from "@/stores"
import { watch, type Directive } from "vue"

interface VideoElement extends HTMLElement {
  play?: () => Promise<void>
  pause?: () => void
  _observer?: IntersectionObserver
  _unwatchFullImage?: () => void
}

const vIntersectVideo: Directive<VideoElement> = {
  mounted(el) {
    const store = useRouterHandlerStore()

    const state: { entry: IntersectionObserverEntry | null } = {
      entry: null,
    }

    const checkVisibilityAndState = (entry: IntersectionObserverEntry) => {
      state.entry = entry

      if (store.viewerOpened) {
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

    // Watch for viewerOpened changes
    el._unwatchFullImage = watch(
      () => store.viewerOpened,
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
  },
}

export default vIntersectVideo
