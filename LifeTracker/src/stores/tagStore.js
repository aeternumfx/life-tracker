import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTagStore = defineStore('tagStore', () => {
  const tags = ref([])

  async function loadTags() {
    const res = await fetch('/api/tags')
    tags.value = await res.json()
  }

  const tagLinks = ref([])

function setTags(newTags) {
  tags.value = newTags
}

function setTagLinks(links) {
  tagLinks.value = links
}


  return { tags, loadTags, setTags, setTagLinks }
})