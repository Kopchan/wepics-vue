import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  //relative: true, // FIXME: Не работают относительные роуты, мб надо # роуты
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/album/:albumHash?',
      name: 'album',
      component: HomeView
    },
    {
      path: '/:catchAll(.*)',
      name: 'notFound',
      component: () => import('@/views/PageNotExist.vue')
    },
  ]
})

export default router
