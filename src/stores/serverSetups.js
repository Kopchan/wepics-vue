import { urls } from '@/api'
import { fetchWrapper, storageWrapper } from '@/helpers'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useServerSetupsStore = defineStore('serverSetups', () => {
  const allowedReactions = ref()
  const ageRatings       = ref()

  fetchWrapper.get(urls.setups()).then(data => {
    allowedReactions.value = data.setups.reactions
    ageRatings      .value = data.setups.age_ratings
  })
  
  return { allowedReactions, ageRatings }
})
