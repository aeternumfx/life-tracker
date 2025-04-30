<template>
    <div class="fixed top-0 right-0 w-80 h-full bg-white dark:bg-gray-900 shadow-lg z-50 flex flex-col">
      <div class="p-4 border-b border-gray-300 dark:border-gray-700">
        <h2 class="text-xl font-bold">Theme Manager</h2>
        <button @click="$emit('close')" class="mt-2 text-sm text-blue-600 dark:text-blue-400">
          Close
        </button>
      </div>
  
      <div class="p-4 flex-1 overflow-y-auto">
        <div
          v-for="theme in availableThemes"
          :key="theme"
          class="p-3 border rounded mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
          @click="applyTheme(theme)"
        >
          {{ theme }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { loadTheme, getAvailableThemes } from '../utils/themeLoader'
  
  const props = defineProps({ visible: Boolean })
  const emit = defineEmits(['close'])
  
  const availableThemes = ref([])
  
  onMounted(() => {
    availableThemes.value = getAvailableThemes()
  })
  
  async function applyTheme(themeName) {
    try {
      const theme = await loadTheme(themeName)
      localStorage.setItem('selectedTheme', themeName)
      document.documentElement.setAttribute('data-theme', themeName)
    } catch (err) {
      console.error('Failed to load theme:', err)
    }
  }

  function hexToRgb(hex) {
  if (!hex || !hex.startsWith('#') || (hex.length !== 7 && hex.length !== 4)) return ''
  if (hex.length === 4) {
    hex = '#' + [...hex.slice(1)].map(x => x + x).join('')
  }
  const [r, g, b] = hex.match(/\w\w/g).map(c => parseInt(c, 16))
  return `${r}, ${g}, ${b}`
}
  </script>  