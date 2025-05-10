import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { loadTheme } from './utils/themeLoader'
import { pinia } from './stores/index.js' // your shared instance

const app = createApp(App)

app.use(router)
app.use(pinia) // ✅ Only this
app.mount('#app')

// Load theme
const savedTheme = localStorage.getItem('selectedTheme') || 'dark-mode'
loadTheme(savedTheme).then(() => {
  document.documentElement.setAttribute('data-theme', savedTheme)
})