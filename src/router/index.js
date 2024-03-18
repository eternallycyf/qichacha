import { createRouter, createWebHistory } from 'vue-router'
// import Relation from '../views/Relation.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '',
      component:() => import('../views/Relation.vue')
    },
    {
      path: '/company-chart',
      name: 'company-chart',
      component: () => import('../views/CompanyChart.vue')
    },
    {
      path: '/beneficiary-person',
      name: 'beneficiary-person',
      component: () => import('../views/BeneficiaryPerson.vue')
    },
    {
      path: '/equity-chart',
      name: 'equity-chart',
      component: () => import('../views/EquityChart.vue')
    },
    {
      path: '/exploration',
      name: 'exploration',
      component: () => import('../views/Exploration.vue')
    },
    {
      path: '/glf',
      name: 'glf',
      component: () => import('../views/glf.vue')
    },
    {
      path: '/kzr',
      name: 'kzr',
      component: () => import('../views/kzr.vue')
    },
    {
      path: '/structure-chart',
      name: 'structure-chart',
      component: () => import('../views/StructureChart.vue')
    }
  ]
})

export default router
