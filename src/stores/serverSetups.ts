import { urls } from '@/api'
import { fetchWrapper, storageWrapper } from '@/helpers'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AgeRating, RatingPreset } from '@/types'

interface ServerSetupsResponse {
  setups: {
    reactions?: string[]
    age_ratings?: AgeRating[]
    allowed_image_extensions?: string[]
    allowed_video_extensions?: string[]
    allowed_audio_extensions?: string[]
    allowed_preview_sizes?: number[]
    is_upload_disabled?: boolean
  }
}

export const useServerSetupsStore = defineStore('serverSetups', () => {
  const ratingsStorage = storageWrapper<Record<string, RatingPreset>>('ratings')

  const allowedReactions        = ref<string[]>([])
  const ageRatings              = ref<AgeRating[]>([])
  const allowedImageExtensions  = ref<string[]>(['jpg', 'png'])
  const allowedVideoExtensions  = ref<string[]>([])
  const allowedAudioExtensions  = ref<string[]>([])
  const allowedPreviewSizes     = ref<number[]>([144, 240, 360, 480, 720, 1080])
  const isUploadDisabled        = ref(false)

  const preLoad = () => fetchWrapper.get<ServerSetupsResponse>(urls.setups()).then(data => {

    if (data.setups.reactions                != null) allowedReactions      .value = data.setups.reactions
    if (data.setups.age_ratings              != null) ageRatings            .value = data.setups.age_ratings
    if (data.setups.allowed_image_extensions != null) allowedImageExtensions.value = data.setups.allowed_image_extensions
    if (data.setups.allowed_video_extensions != null) allowedVideoExtensions.value = data.setups.allowed_video_extensions
    if (data.setups.allowed_audio_extensions != null) allowedAudioExtensions.value = data.setups.allowed_audio_extensions
    if (data.setups.allowed_preview_sizes    != null) allowedPreviewSizes   .value = data.setups.allowed_preview_sizes
    if (data.setups.is_upload_disabled       != null) isUploadDisabled      .value = data.setups.is_upload_disabled

    ageRatings.value.forEach(rat => {
      const device = ratingsStorage?.[rat.code]
      rat.globalPreset = rat.preset
      rat.devicePreset = device
      if (device) rat.preset = device
    })
  })

  const getAllowedSize = (size: number): number => {
    const result = allowedPreviewSizes.value.find(s => size <= s) ?? allowedPreviewSizes.value.at(-1) ?? size
    return result
  }
  
  // TODO: получать ещё аккаунт

  return {
    preLoad, 
    allowedReactions,
    allowedImageExtensions, allowedVideoExtensions, allowedAudioExtensions, 
    allowedPreviewSizes, getAllowedSize,
    isUploadDisabled, 
    ageRatings, ratingsStorage,
  }
})
