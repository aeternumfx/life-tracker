import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import ProjectsPage from './views/ProjectsPage.vue'
import EventPage from './views/EventPage.vue'
import TaskPage from './views/TaskPage.vue'
import ListPage from './views/ListPage.vue'
import GoalPage from './views/GoalPage.vue'
import Settings from './views/Settings.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/projects', component: ProjectsPage },
  { path: '/events', component: EventPage },
  { path: '/tasks', component: TaskPage },
  { path: '/lists', component: ListPage },
  { path: '/goals', component: GoalPage },
  { path: '/settings', component: Settings },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})