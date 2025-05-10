// src/stores/listStore.js
import { defineStore } from 'pinia'
import { useModuleSettingsStore } from '@/stores/moduleSettingsStore'

// Helper to choose correct API path based on module usage
function getListApiBasePath(listId) {
  const settingsStore = useModuleSettingsStore()
  const dynamicSettings = settingsStore.getSettings('dynamic_list') || {}

  if ((dynamicSettings.selectedLists || []).includes(listId)) {
    return `/api/modules/dynamic-list/lists/${listId}/items`
  }

  return `/api/lists/${listId}/items`
}

export const useListStore = defineStore('lists', {
  state: () => ({
    lists: [],
    itemsByListId: {} // { [list_id]: [items] }
  }),

  actions: {
    async loadLists() {
      const res = await fetch('/api/lists')
      this.lists = await res.json()
    },

    setLists(lists) {
      this.lists = lists
    },

    async loadItems(listId) {
      const res = await fetch(getListApiBasePath(listId))
      const items = await res.json()
      this.itemsByListId[listId] = items
    },

    async addList({ name, project_id = null, type = 'general' }) {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, project_id, type })
      })
      const { id } = await res.json()
      this.lists.unshift({ id, name, project_id, type })
      return id
    },

    async renameList(id, name) {
      await fetch(`/api/lists/${id}/rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      const list = this.lists.find(l => l.id === id)
      if (list) list.name = name
    },

    async deleteList(id) {
      await fetch(`/api/lists/${id}`, { method: 'DELETE' })
      this.lists = this.lists.filter(l => l.id !== id)
      delete this.itemsByListId[id]

      const settingsStore = useModuleSettingsStore()
      const settings = settingsStore.getSettings('dynamic_list')
      if (settings?.selectedLists) {
        settingsStore.setSetting(
          'dynamic_list',
          'selectedLists',
          settings.selectedLists.filter(lid => lid !== id)
        )
      }
    },

    async addItem({ list_id, text, priority = 0, tags = '' }) {
      const res = await fetch(getListApiBasePath(list_id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ list_id, text, priority, tags })
      })
      const { id } = await res.json()
      this.itemsByListId[list_id] ??= []
      this.itemsByListId[list_id].push({ id, text, priority, tags, completed: 0 })
    },

    async updateItemStatus(id, completed) {
      await fetch(`/api/lists/items/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      })

      for (const items of Object.values(this.itemsByListId)) {
        const item = items.find(i => i.id === id)
        if (item) item.completed = completed
      }
    },

    async deleteItem(id) {
      await fetch(`/api/lists/items/${id}`, { method: 'DELETE' })
      for (const listId in this.itemsByListId) {
        const index = this.itemsByListId[listId].findIndex(i => i.id === id)
        if (index !== -1) this.itemsByListId[listId].splice(index, 1)
      }
    },

    async updateItemOrder(id, sort_order) {
      await fetch(`/api/lists/items/${id}/order`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order })
      })

      for (const listItems of Object.values(this.itemsByListId)) {
        const item = listItems.find(i => i.id === id)
        if (item) item.sort_order = sort_order
      }
    }
  }
})