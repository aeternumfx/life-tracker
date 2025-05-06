<!-- File: src/pages/ListPage.vue -->
<template>
    <div class="flex h-screen overflow-hidden">
      <!-- Sidebar: Lists -->
      <div class="w-[300px] shrink-0 border-r border-gray-200 bg-[--color-surface] p-4 overflow-y-auto">
        <h2 class="text-lg font-semibold mb-3 text-[--color-textPrimary]">Your Lists</h2>
  
        <!-- Search -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search lists..."
          class="mb-3 w-full p-2 border rounded bg-[--color-input] text-[--color-inputText]"
        />
  
        <!-- Tag Filters -->
        <div class="mb-3">
          <h3 class="text-sm font-medium mb-1">Filter by Tags</h3>
          <div class="flex flex-wrap gap-1 mb-1">
            <button
              v-for="tag in allTags"
              :key="tag.id"
              @click="toggleTag(tag.id)"
              :class="[
                'px-2 py-1 text-sm rounded',
                selectedTags.includes(tag.id)
                  ? 'bg-[--color-primary] text-white'
                  : 'bg-[--color-surfaceAlt] text-[--color-textPrimary]'
              ]"
            >
              {{ tag.emoji_icon }} {{ tag.label }}
            </button>
          </div>
          <button v-if="selectedTags.length" @click="selectedTags = []" class="text-xs text-[--color-mutedText] hover:underline">
            Clear tags
          </button>
        </div>
  
        <button @click="showAddListDialog = true"
          class="w-full bg-[--color-primary] text-white py-2 px-4 rounded hover:opacity-90 mt-2">
          ➕ Add List
        </button>
      </div>
  
      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto p-6 bg-[--color-surfaceAlt]">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-xl font-bold text-[--color-textPrimary]">
            {{ currentList?.name || 'Select a list' }}
          </h1>
          <div class="flex gap-2">
            <select v-model="selectedListId" class="p-2 border rounded bg-[--color-input] text-[--color-inputText]">
              <option v-for="list in filteredLists" :key="list.id" :value="list.id">
                {{ list.name }}
              </option>
            </select>
            <button @click="showAddItemDialog = true" class="bg-[--color-primary] text-white px-4 py-2 rounded">
              ➕ Add Item
            </button>
          </div>
        </div>
  
        <!-- Item List -->
        <div v-if="currentItems.length === 0" class="text-[--color-mutedText]">No items found.</div>
        <ul v-else class="space-y-3">
          <li
            v-for="item in currentItems"
            :key="item.id"
            class="p-3 border rounded bg-[--color-surface] text-[--color-textPrimary] flex justify-between items-center"
          >
            <div>
              <div class="font-medium">{{ item.text }}</div>
              <div class="text-xs text-[--color-mutedText] flex gap-2 mt-1">
                <span v-if="item.priority">Priority: {{ item.priority }}</span>
                <span v-for="tag in item.tags" :key="tag" class="px-2 py-0.5 bg-[--color-surfaceAlt] rounded">
                  {{ tag }}
                </span>
              </div>
            </div>
            <input type="checkbox" v-model="item.completed" @change="toggleItemStatus(item.id, item.completed)" />
          </li>
        </ul>
      </div>
    </div>
  
    <!-- Dialog stubs -->
    <AddListDialog v-if="showAddListDialog" @close="showAddListDialog = false" />
    <AddListItemDialog v-if="showAddItemDialog" :list-id="selectedListId" @close="showAddItemDialog = false" />
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useListStore } from '@/stores/listStore'
  import { useTagStore } from '@/stores/tagStore'
  import AddListDialog from '@/components/dialogs/AddListDialog.vue'
  import AddListItemDialog from '@/components/dialogs/AddListItemDialog.vue'
  
  const listStore = useListStore()
  const tagStore = useTagStore()
  
  const searchQuery = ref('')
  const selectedTags = ref([])
  const selectedListId = ref(null)
  const showAddListDialog = ref(false)
  const showAddItemDialog = ref(false)
  
  onMounted(() => {
    listStore.loadLists()
    tagStore.loadTags()
  })
  
  const allTags = computed(() => tagStore.tags)
  const allLists = computed(() => listStore.lists)
  
  function toggleTag(id) {
    const i = selectedTags.value.indexOf(id)
    if (i >= 0) selectedTags.value.splice(i, 1)
    else selectedTags.value.push(id)
  }
  
  const filteredLists = computed(() => {
    let lists = allLists.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      lists = lists.filter(l => l.name.toLowerCase().includes(q))
    }
    if (selectedTags.value.length > 0) {
      lists = lists.filter(list =>
        list.tags?.some(tag => selectedTags.value.includes(tag))
      )
    }
    return lists
  })
  
  const currentList = computed(() =>
    filteredLists.value.find(l => l.id === selectedListId.value)
  )
  
  const currentItems = computed(() => {
    if (!currentList.value || !currentList.value.items) return []
    return currentList.value.items
  })
    
  function toggleItemStatus(id, completed) {
    listStore.updateItemStatus(id, completed)
  }
  </script>
  
  <style scoped>
  button:focus {
    outline: none;
  }
  </style>  