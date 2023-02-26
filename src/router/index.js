import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'

import TopPage from '../views/TopPage.vue'
import CustomerListPage from '../views/CustomerListPage.vue'
import ExpenceItemListPage from '../views/ExpenceItemListPage.vue'
import IncomeListPage from '../views/IncomeListPage.vue'
import ExpenceListPage from '../views/ExpenceListPage.vue'
import PreviewDocumentPage from '../views/PreviewDocumentPage.vue'
import SettingsPage from '../views/SettingsPage.vue'

const routes = [
  {
    path: '/',
    name: 'TopPage',
    component: TopPage
  },
  {
    path: '/customer',
    name: 'CustomerListPage',
    component: CustomerListPage
  },
  {
    path: '/expenceItem',
    name: 'ExpenceItemListPage',
    component: ExpenceItemListPage
  },
  {
    path: '/income',
    name: 'IncomeListPage',
    component: IncomeListPage
  },
  {
    path: '/expence',
    name: 'ExpenceListPage',
    component: ExpenceListPage
  },
  {
    path: '/previewDocument',
    name: 'PreviewDocumentPage',
    component: PreviewDocumentPage
  },
  {
    path: '/settings',
    name: 'SettingsPage',
    component: SettingsPage
  },
]

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: process.env.IS_ELECTRON ? createWebHashHistory() : createWebHistory(),
  routes
})

export default router
