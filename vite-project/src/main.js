import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { loadTheme } from './utils/themeLoader'

const app = createApp(App)

app.use(router) // 🔥 CRITICAL: this must be before mount
app.mount('#app')

// Load theme after mounting
const savedTheme = localStorage.getItem('selectedTheme') || 'dark-mode'
loadTheme(savedTheme).then(() => {
  document.documentElement.setAttribute('data-theme', savedTheme)
})
