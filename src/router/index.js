import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  relative: true, // FIXME: Не работают относительные роуты, мб надо # роуты
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

/*
router.beforeEach((to, from) => {
  const newQuery = {...from.query, 'test': Math.random(1)}
  to.query = newQuery
})
*/

export default router
