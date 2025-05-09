import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { BASE_URL } from '@/config'

export const router = createRouter({
  history: BASE_URL 
    ? createWebHistory    (import.meta.env.VITE_BASE_URL) 
    : createWebHashHistory(import.meta.env.VITE_BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/album/:albumHash?',
      name: 'albumLegacy',
      redirect: to => ({ 
        name: 'openAlbum', 
        params: { album: to.params.albumHash },
        query: to.query,
      })
    },
    {
      path: '/:album?',
      name: 'openAlbum',
      component: HomeView
    },
    //{
    //  path: '/:user/:album?',
    //  name: 'userAlbum',
    //  component: HomeView
    //},
    {
      path: '/:catchAll(.*)',
      name: 'notFound',
      component: () => import('@/views/PageNotExist.vue')
    },
  ]
})

export default router
