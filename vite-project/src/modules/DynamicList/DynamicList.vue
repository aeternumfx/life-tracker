<template>
    <div class="p-4 w-full h-full overflow-y-auto bg-[color:var(--color-surface)] text-[color:var(--color-textPrimary)] rounded shadow">
      <h2 class="text-lg font-semibold mb-4">
        {{ settings.title || 'DynamicList' }}
      </h2>
  
      <!-- Add Button -->
      <div class="mb-4 flex justify-end">
        <button @click="dialogRef?.open()" class="px-3 py-1 bg-[color:var(--color-primary)] text-white rounded">
          ➕ Add Item
        </button>
      </div>
  
      <ul class="space-y-2">
        <li
          v-for="item in filteredItems"
          :key="item.id"
          class="flex items-center justify-between border-b pb-1"
          style="border-color: var(--color-borderLight)"
        >
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="item.completed" @change="updateStatus(item)" />
            <span :class="{ 'line-through opacity-60': item.completed }">{{ item.text }}</span>
          </label>
          <button @click="deleteItem(item)" class="text-red-500 hover:text-red-700 text-sm">🗑️</button>
        </li>
      </ul>
  
      <!-- AddItemDialog -->
      <AddItemDialog ref="dialogRef" @item-added="handleItemAdded" />
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, markRaw, watch } from 'vue'
  import AddItemDialog from '@/components/dialogs/AddListItemDialog.vue'
  import DynamicListSettings from './DynamicListSettings.vue'
  
  const props = defineProps({
    onSettingsClicked: Function,
    refreshKey: Number
  })
  
  const dialogRef = ref(null)
  
  const settings = ref({
    title: '',
    selectedLists: [],
    tags: []
  })
  
  const items = ref([])
  const allItems = ref([])
  const allLists = ref([])
  
  onMounted(() => {
    if (props.onSettingsClicked) {
      props.onSettingsClicked(() => markRaw(DynamicListSettings))
    }
    fetchSettings()
    fetchAllLists()
  })
  
  watch(() => props.refreshKey, () => {
    fetchSettings()
    fetchAllLists()
  })
  
  async function fetchSettings() {
    try {
      const res = await fetch('/api/modules/DynamicList/settings')
      if (res.ok) {
        const data = await res.json()
        settings.value = data
      }
    } catch (err) {
      console.warn('⚠️ Failed to fetch settings:', err)
    }
  }
  
  async function fetchAllLists() {
    const res = await fetch('/api/modules/DynamicList/lists')
    if (!res.ok) return console.error('Failed to fetch lists')
    const lists = await res.json()
    allLists.value = lists
  
    const all = []
    for (const list of lists) {
      const itemsRes = await fetch(`/api/modules/DynamicList/lists/${list.id}/items`)
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json()
        itemsData.forEach(item => all.push({ ...item, list_id: list.id }))
      }
    }
    allItems.value = all
  }
  
  const filteredItems = computed(() => {
    let filtered = [...allItems.value]
  
    if (settings.value.selectedLists?.length > 0) {
      filtered = filtered.filter(i => settings.value.selectedLists.includes(i.list_id))
    }
  
    if (settings.value.tags?.length > 0) {
      filtered = filtered.filter(i =>
        settings.value.tags.some(tag => i.tags?.split(',').map(t => t.trim()).includes(tag))
      )
    }
  
    return filtered
  })
  
  async function handleItemAdded(data) {
  if (!data.text || !data.listId) return

  const body = {
    text: data.text,
    priority: data.priority ?? 0,
    tags: data.tags?.trim() || ''
  }

  const res = await fetch(`/api/modules/DynamicList/lists/${data.listId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (res.ok) {
    await fetchAllLists()
  } else {
    console.warn('❌ Failed to add item')
  }
}

  
  async function updateStatus(item) {
    await fetch(`/api/modules/DynamicList/items/${item.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: item.completed })
    })
  }
  
  async function deleteItem(item) {
    await fetch(`/api/modules/DynamicList/items/${item.id}`, { method: 'DELETE' })
    await fetchAllLists()
  }
  </script>  