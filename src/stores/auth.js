import { defineStore } from 'pinia'
import { fetchWrapper, storageWrapper } from '@/helpers'
import { urls } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  // Инфа об юзере в localStorage
  const user = storageWrapper('user')
 
  // Регистрация
  async function signup({ nickname, login, password }) {
    const response = await fetchWrapper
      .post(urls.authSignUp(), { nickname, login, password })
     
    user.token = response.token
    user.isAdmin = false
    user.nickname = nickname
  }

  // Вход
  async function login({ login, password }) {
    const res = await fetchWrapper
      .post(urls.authLogIn(), { login, password })
     
    user.token = res.token
    user.isAdmin = res.isAdmin ?? false
    user.nickname = res.nickname
  }

  // Выход
  async function logout() {
    await fetch(urls.authLogOut(), {
      headers: { Authorization: `Bearer ${user.token}` }
    }).catch()
   
    for (const key in user)
      delete user[key]
  }

  return { user, signup, login, logout }
})
