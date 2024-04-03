import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchWrapper, storageWrapper } from '@/helpers'

export const useAuthStore = defineStore('auth', () => {
  const user = storageWrapper('user')
  
  async function registrate({ nickname, email, password }) {
    const response = await fetchWrapper
      .post('/signup', { nickname, email, password })
      
    user.token = response.token
    user.isAdmin = response.isAdmin
  }
  async function login({ email, password }) {
    const response = await fetchWrapper
      .post('/login', { email, password })
      
    user.token = response.token
    user.isAdmin = response.isAdmin
  }
  async function logout() {
    fetchWrapper.post('/logout')
    user.length = 0
  }
  return { user, token: user.token, registrate, login, logout }
})
