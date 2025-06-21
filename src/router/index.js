import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { BASE_URL } from '@/config'
import PageNotExist from '@/views/PageNotExist.vue'

export const router = createRouter({
  history: BASE_URL 
    ? createWebHistory    (import.meta.env.VITE_BASE_URL) 
    : createWebHashHistory(import.meta.env.VITE_BASE_URL),
  routes: [
    {
      path: '/', // Главная
      name: 'home',
      component: HomeView
    },
    {
      path: '/album/:albumHash?', // Поддержка старого маршрута
      name: 'albumLegacy',
      redirect: to => ({ 
        name: 'openAlbum', 
        params: { album: to.params.albumHash },
        query: to.query,
      })
    },
    {
      path: '/root', // Корневой серверный альбом отображается на главной 
      name: 'toHome',
      redirect: to => ({ 
        name: 'home', 
        query: to.query,
      })
    },
    {
      path: '/@:user', // Корневой альбом пользователя 
      name: 'userRoot',
      component: HomeView
    },
    {
      path: '/@:user/:album?',
      name: 'userAlbum',
      component: HomeView
    },
    {
      path: '/@:user/:album/:type/:image',
      name: 'userAlbumImage',
      component: HomeView
    },
    {
      path: '/@:user/:album/:trueAlbum/:type/:image',
      name: 'userAlbumNestedImage',
      component: HomeView
    },
    {
      path: '/:album',
      name: 'openAlbum',
      component: HomeView
    },
    {
      path: '/:album/:type/:image', // Просмотр медиа 
      name: 'openAlbumImage',
      component: HomeView
    },
    {
      path: '/:album/:trueAlbum/:type/:image', // Просмотр медиа во вложенном альбоме
      name: 'openAlbumNestedImage',
      component: HomeView
    },
    {
      path: '/:catchAll(.*)', // Неизвестный путь
      name: 'notFound',
      component: PageNotExist
    },
  ]
})

export default router
