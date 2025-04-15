import { urls } from '@/api'
import { fetchWrapper, storageWrapper } from '@/helpers'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useServerSetupsStore = defineStore('serverSetups', () => {
  const ratingsStorage = storageWrapper('ratings')

  const allowedReactions = ref()
  const ageRatings       = ref()

  const preLoad = () => fetchWrapper.get(urls.setups()).then(data => {

    allowedReactions.value = data.setups.reactions
    ageRatings      .value = data.setups.age_ratings

    ageRatings.value.forEach(rat => {
      const device = ratingsStorage?.[rat.code]
      rat.globalPreset = rat.preset
      rat.devicePreset = device
      if (device) 
        rat.preset = device 
    })
  })
  
  // TODO: получать ещё аккаунт

  return { allowedReactions, ageRatings, preLoad, ratingsStorage }
})
