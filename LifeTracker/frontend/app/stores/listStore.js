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
  const res = await fetch(`/api/lists/${listId}/items`)
  const rawItems = await res.json()

  const taskRes = await fetch(`/api/tasks`)
  const allTasks = await taskRes.json()

  // Fetch list_contents to find task IDs linked to this list
  const contentsRes = await fetch(`/api/list-contents/${listId}`)
  const listContents = await contentsRes.json()

  const taskIds = listContents
    .filter(entry => entry.entity_type === 'task')
    .map(entry => entry.entity_id)

  const tasksForList = allTasks
    .filter(t => taskIds.includes(t.id))
    .map(task => ({
      ...task,
      text: task.title,
      type: 'task'
    }))

  const listItems = rawItems.map(i => ({
    ...i,
    type: 'list_item'
  }))

  this.itemsByListId[listId] = [...tasksForList, ...listItems]
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

    async addItem(payload) {
      const listId = payload.list_id || payload.listId
      if (!listId) {
        console.warn('[addItem] Missing list ID in payload:', payload)
        return
      }

      console.log('[addItem] Submitting to API for list:', listId)

      const res = await fetch(getListApiBasePath(listId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          list_id: listId,
          text: payload.text,
          priority: payload.priority ?? 0,
          tags: payload.tags ?? ''
        })
      })

      const { id } = await res.json()
      this.itemsByListId[listId] ??= []
      this.itemsByListId[listId].push({
        id,
        text: payload.text,
        priority: payload.priority,
        tags: payload.tags,
        completed: 0,
        type: 'list_item'
      })
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