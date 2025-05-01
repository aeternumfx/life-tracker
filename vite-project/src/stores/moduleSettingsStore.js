// src/stores/moduleSettingsStore.js
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useModuleSettingsStore = defineStore('moduleSettings', () => {
  const settings = reactive({})

  async function loadSettings(id) {
    if (settings[id]) return
    try {
      const baseId = id.split('-')[0]  // ⬅️ Strip timestamp or suffix
      const res = await fetch(`/api/modules/${baseId}/settings`)
if (!res.ok) {
  console.warn(`⚠️ Settings file not found for ${baseId}`)
  return
}
const data = await res.json()
settings[id] = data
    } catch (err) {
      console.warn(`⚠️ Failed to load settings for ${id}`, err)
    }
  }
  
  

  async function preloadSettings(ids) {
    await Promise.all(ids.map(loadSettings))
  }

  function getSettings(id) {
    return settings[id] || {}
  }

  function setSettings(id, newSettings) {
    settings[id] = { ...newSettings }
  }

  return {
    settings,
    getSettings,
    setSettings,
    loadSettings,
    preloadSettings  // ✅ MAKE SURE THIS IS RETURNED
  }
})