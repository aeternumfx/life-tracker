import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './pages/Dashboard.vue'
import ProjectsPage from './pages/ProjectsPage.vue'
import EventPage from './pages/EventPage.vue'
import TaskPage from './pages/TaskPage.vue'
import ListPage from './pages/ListPage.vue'
import GoalPage from './pages/GoalPage.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/projects', component: ProjectsPage },
  { path: '/events', component: EventPage },
  { path: '/tasks', component: TaskPage },
  { path: '/lists', component: ListPage },
  { path: '/goals', component: GoalPage },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})