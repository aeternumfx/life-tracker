// File: src/stores/templateStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTemplateStore = defineStore('templateStore', () => {
  const templates = ref([])

  async function loadTemplates() {
    const res = await fetch('/api/templates')
    templates.value = await res.json()
  }

  function setTemplates(tpls) {
    templates.value = tpls
  }  

  return { templates, loadTemplates, setTemplates }
})