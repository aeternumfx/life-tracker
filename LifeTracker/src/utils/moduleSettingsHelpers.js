// src/utils/moduleSettingsHelpers.js
export function hydrateSettings(store, moduleId, defaults) {
    const existing = store.getSettings(moduleId)
    return Object.assign({}, defaults, existing)
  }
  
  export async function saveAndCloseSettings(store, moduleId, settings, emit) {
    try {
      store.setSettings(moduleId, settings)
      await store.saveSettings(moduleId)
      emit('refresh')
      emit('close')
    } catch (err) {
      console.error(`❌ Failed to save settings for ${moduleId}:`, err)
    }
  }  