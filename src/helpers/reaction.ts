import { urls } from "@/api"
import fetchWrapper from "./fetchWrapper"
import type { ImageItem } from "@/types"

export const toggleReaction = (albumHash: string | undefined, image: ImageItem, reaction: string): void => {
  const isYouSetted = image.reactions?.[reaction]?.isYouSet || false

  fetchWrapper[isYouSetted ? 'delete' : 'post'](
    urls.imageReaction(
      image?.album?.hash ?? albumHash ?? '',
      image.hash, 
      reaction
    )
  ).then(() => {
    if (!image.reactions)
      image.reactions = {}
    
    if (!image.reactions[reaction])
      image.reactions[reaction] = {
        isYouSet: !isYouSetted,
        count: isYouSetted ? -1 : 1,
      }
    else {
      image.reactions[reaction].isYouSet = !isYouSetted
      image.reactions[reaction].count += isYouSetted ? -1 : 1
    }
  })
}