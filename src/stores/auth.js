import { defineStore } from 'pinia'
import { fetchWrapper, storageWrapper } from '@/helpers'

export const useAuthStore = defineStore('auth', () => {
  const user = storageWrapper('user')
 
  async function signup({ nickname, login, password }) {
    const response = await fetchWrapper
      .post('/users/reg', { nickname, login, password })
     
    user.token = response.token
    user.isAdmin = false
    user.nickname = nickname
  }

  async function login({ login, password }) {
    const res = await fetchWrapper
      .post('/users/login', { login, password })
     
    user.token = res.token
    user.isAdmin = res.isAdmin ?? false
    user.nickname = res.nickname
  }

  async function logout() {
    await fetch('/users/logout', {
      headers: { Authorization: `Bearer ${user.token}` }
    }).catch()
   
    for (const key in user)
      delete user[key]
  }

  return { user, signup, login, logout }
})
