import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTagStore = defineStore('tagStore', () => {
  const tags = ref([])

  async function loadTags() {
    const res = await fetch('/api/tags')
    tags.value = await res.json()
  }

  return { tags, loadTags }
})