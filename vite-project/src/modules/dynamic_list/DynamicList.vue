<template>
    <div class="p-4 w-full h-full overflow-y-auto bg-[color:var(--color-surface)] text-[color:var(--color-textPrimary)] rounded shadow">
      <h2 class="text-lg font-semibold mb-4">
        {{ settings.title || 'DynamicList' }}
      </h2>
  
      <!-- Add Button -->
      <div class="mb-4 flex justify-end">
        <button @click="itemDialogRef?.open()" class="px-3 py-1 bg-[color:var(--color-primary)] text-white rounded">
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
      <AddItemDialog ref="itemDialogRef" @item-added="handleItemAdded" />
    </div>
  </template>
  
  <script setup>
import { ref, computed, onMounted, markRaw, watch } from 'vue'
import AddItemDialog from '@/components/dialogs/AddListItemDialog.vue'
import DynamicListSettings from './DynamicListSettings.vue'
import { useListStore } from '@/stores/listStore'
import { useModuleSettingsStore } from '@/stores/moduleSettingsStore'

const props = defineProps({
  onSettingsClicked: Function,
  refreshKey: Number
})

const itemDialogRef = ref(null)
const moduleId = 'dynamic_list'

const listStore = useListStore()
const settingsStore = useModuleSettingsStore()
const settings = computed(() => settingsStore.getSettings(moduleId))

onMounted(() => {
  settingsStore.loadSettings(moduleId)
  if (props.onSettingsClicked) {
    props.onSettingsClicked(() => markRaw(DynamicListSettings))
  }
  fetchAllLists()
})

watch(() => props.refreshKey, () => {
  settingsStore.loadSettings(moduleId)
  fetchAllLists()
})

async function fetchAllLists() {
  await listStore.loadLists()
  await Promise.all(listStore.lists.map(l => listStore.loadItems(l.id)))
}

const filteredItems = computed(() => {
  let all = Object.values(listStore.itemsByListId).flat()

  if (settings.value.selectedLists?.length > 0) {
    all = all.filter(i => settings.value.selectedLists.includes(i.list_id))
  }

  if (settings.value.tags?.length > 0) {
    all = all.filter(i =>
      settings.value.tags.some(tag => i.tags?.split(',').map(t => t.trim()).includes(tag))
    )
  }

  return all
})

async function handleItemAdded(data) {
  if (!data.text || !data.listId) return

  await listStore.addItem({
    list_id: data.listId,
    text: data.text,
    priority: data.priority ?? 0,
    tags: data.tags?.trim() || ''
  })

  await listStore.loadItems(data.listId)
}

async function updateStatus(item) {
  await listStore.updateItemStatus(item.id, item.completed)
}

async function deleteItem(item) {
  await listStore.deleteItem(item.id)
}
</script>