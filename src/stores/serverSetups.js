import { urls } from '@/api'
import { fetchWrapper, storageWrapper } from '@/helpers'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useServerSetupsStore = defineStore('serverSetups', () => {
  const ratingsStorage = storageWrapper('ratings')

  const allowedReactions        = ref([])
  const ageRatings              = ref([])
  const allowedImageExtensions  = ref(['jpg', 'png'])
  const allowedVideoExtensions  = ref([])
  const allowedAudioExtensions  = ref([])
  const allowedPreviewSizes     = ref([144, 240, 360, 480, 720, 1080])
  const isUploadDisabled        = ref(false)

  const preLoad = () => fetchWrapper.get(urls.setups()).then(data => {

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

  const getAllowedSize = (size) => {
    const result = allowedPreviewSizes.value.find(s => size <= s) ?? allowedPreviewSizes.value.at(-1)
    console.log(`getAllowedSize(${size}) => ${result} (allowedPreviewSizes = ${allowedPreviewSizes.value})`)
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
