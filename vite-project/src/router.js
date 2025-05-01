import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './pages/Dashboard.vue'
import ProjectsPage from './pages/ProjectsPage.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/projects', component: ProjectsPage },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})