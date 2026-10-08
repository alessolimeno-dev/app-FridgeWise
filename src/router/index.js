import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FoodDetail from '../views/FoodDetail.vue'
import MealPlanner from '../views/MealPlanner.vue'
import ListaSpesa from '../views/ListaSpesa.vue'
import NotFound from '../views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/alimento/:id',
      name: 'food-detail',
      component: FoodDetail,
      props: true,
    },
    {
      path: '/pianifica',
      name: 'planner',
      component: MealPlanner,
      alias: '/planner',
    },
    {
      path: '/spesa',
      name: 'shopping-list',
      component: ListaSpesa,
    },
    // Redirezioni di retrocompatibilità
    {
      path: '/aggiungi',
      redirect: '/',
    },
    {
      path: '/modifica/:id',
      redirect: (to) => `/alimento/${to.params.id}`,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
    }
  ],
})

export default router
