import { createRouter, createWebHashHistory, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { BASE_URL } from '@/config'
import PageNotExist from '@/views/PageNotExist.vue'

const routes: RouteRecordRaw[] = [
  // Основная группа с HomeView
  {
    path: '',
    component: HomeView,
    children: [
      { path: '/', name: 'home' },
      {
        path: '/@:user',  // Группа пользователя
        children: [
          { path: '',                                      name: 'userRoot' },
          { path: ':album',                                name: 'userAlbum' },
          { path: ':album/:type(v|i|a)/:image',            name: 'userAlbumImage' },
          { path: ':album/:trueAlbum/:type(v|i|a)/:image', name: 'userAlbumNestedImage' }
        ]
      }, {
        path: '/:album', // Группа общих альбомов
        children: [
          { path: '',                               name: 'openAlbum' },
          { path: ':type(v|i|a)/:image',            name: 'openAlbumImage' },
          { path: ':trueAlbum/:type(v|i|a)/:image', name: 'openAlbumNestedImage' }
        ]
      }
    ]
  },

  // Редиректы
  {
    path: '/album/:albumHash?',
    name: 'albumLegacy',
    redirect: to => ({ name: 'openAlbum', params: { album: to.params.albumHash }, query: to.query })
  },
  { path: '/root', name: 'toHome', redirect: to => ({ name: 'home', query: to.query }) },

  // 404 Страница
  { path: '/:catchAll(.*)', name: 'notFound', component: PageNotExist }
]

export const router = createRouter({
  history: BASE_URL
    ? createWebHistory    (import.meta.env.VITE_BASE_URL)
    : createWebHashHistory(import.meta.env.VITE_BASE_URL),
  routes,
})

export default router
