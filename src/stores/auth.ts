import { defineStore } from 'pinia'
import { fetchWrapper, storageWrapper } from '@/helpers'
import { urls } from '@/api'
import type { AuthUser } from '@/types'

interface SignupPayload {
  nickname: string
  login: string
  password: string
}

interface LoginPayload {
  login: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  // Инфа об юзере в localStorage
  const user = storageWrapper<AuthUser>('user')

  // Регистрация
  async function signup({ nickname, login, password }: SignupPayload): Promise<void> {
    const response = await fetchWrapper
      .post<AuthUser>(urls.authSignUp(), { nickname, login, password })

    user.token = response.token
    user.isAdmin = false
    user.nickname = nickname
  }

  // Вход
  async function login({ login, password }: LoginPayload): Promise<void> {
    const res = await fetchWrapper
      .post<AuthUser>(urls.authLogIn(), { login, password })

    user.token = res.token
    user.isAdmin = res.isAdmin ?? false
    user.nickname = res.nickname
  }

  // Выход
  async function logout(): Promise<void> {
    await fetch(urls.authLogOut(), {
      headers: { Authorization: `Bearer ${user.token}` }
    }).catch()
   
    for (const key in user)
      delete user[key]
  }

  return { user, signup, login, logout }
})
