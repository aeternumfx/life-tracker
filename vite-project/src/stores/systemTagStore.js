// File: src/stores/systemTagStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSystemTagStore = defineStore('systemTagStore', () => {
  const systemTags = ref([])

  async function loadSystemTags() {
    const res = await fetch('/api/system-tags')
    systemTags.value = await res.json()
  }

  return { systemTags, loadSystemTags }
})