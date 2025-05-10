// src/stores/layoutStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
  const layout = ref([])

  function setLayout(newLayout) {
    layout.value = newLayout
  }

  return {
    layout,
    setLayout,
  }
})