import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { loadTheme } from './utils/themeLoader'

createApp(App).mount('#app')

const savedTheme = localStorage.getItem('selectedTheme') || 'dark-mode'
await loadTheme(savedTheme)
document.documentElement.setAttribute('data-theme', savedTheme)