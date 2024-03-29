import router from "@/router/index.js"
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchWrapper } from '@/helpers/fetchWrapper.js'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  
  async function registrate({ last_name, first_name, email, password }) {
    const response = await fetchWrapper
      .post('/signup', { last_name, first_name, email, password },)
    localStorage.setItem('token', response.token)
    token.value = response.token
  }
  async function login({ email, password }) {
    const response = await fetchWrapper
      .post('/login', { email, password },)
    localStorage.setItem('token', response.token)
    token.value = response.token
  }
  async function logout() {
    await fetchWrapper.post('/logout')
    token.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }
  return { token, registrate, login, logout }
})
