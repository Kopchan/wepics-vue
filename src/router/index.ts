import { createRouter, createWebHashHistory, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { BASE_URL } from '@/config'
import PageNotExist from '@/views/PageNotExist.vue'

const routes: RouteRecordRaw[] = [
  // Основная группа с HomeView
  { component: HomeView, path: '/', name: 'home' },
  {
    path: '/@:user',  // Группа пользователя
    children: [
      { component: HomeView, path: '',                                      name: 'userRoot' },
      { component: HomeView, path: ':album',                                name: 'userAlbum' },
      { component: HomeView, path: ':album/:type(v|i|a)/:image',            name: 'userAlbumImage' },
      { component: HomeView, path: ':album/:trueAlbum/:type(v|i|a)/:image', name: 'userAlbumNestedImage' }
    ],
  }, {
    path: '/:album', // Группа общих альбомов
    children: [
      { component: HomeView, path: '',                               name: 'openAlbum' },
      { component: HomeView, path: ':type(v|i|a)/:image',            name: 'openAlbumImage' },
      { component: HomeView, path: ':trueAlbum/:type(v|i|a)/:image', name: 'openAlbumNestedImage' }
    ],
  },

  // Редиректы
  {
    path: '/album/:albumHash?',
    name: 'albumLegacy',
    redirect: to => ({ name: 'openAlbum', params: { album: to.params.albumHash }, query: to.query }),
  },
  {
    path: '/root',
    name: 'toHome',
    redirect: to => ({ name: 'home', query: to.query }),
  },

  // 404 Страница
  { path: '/:catchAll(.*)', name: 'notFound', component: PageNotExist },
]

export const router = createRouter({
  history: BASE_URL
    ? createWebHistory    (import.meta.env.VITE_BASE_URL)
    : createWebHashHistory(import.meta.env.VITE_BASE_URL),
  routes,
})

export default router
