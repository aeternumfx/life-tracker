// File: src/stores/listItemStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useListItemStore = defineStore('listItemStore', () => {
  const listItems = ref([])

  async function loadListItems() {
    const res = await fetch('/api/list-items')
    listItems.value = await res.json()
  }

  return { listItems, loadListItems }
})