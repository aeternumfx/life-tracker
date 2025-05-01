<template>
    <div class="p-4 bg-[color:var(--color-surfaceSecondary)] text-[color:var(--color-textPrimary)] border rounded shadow">
      <h3 class="text-lg font-semibold mb-3">Dynamic List Settings</h3>
  
      <!-- Title -->
      <div class="mb-4">
        <label class="text-sm font-medium block mb-1">Module Title</label>
        <input
          v-model="settings.title"
          class="w-full px-2 py-1 rounded border border-[color:var(--color-inputBorder)] bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)]"
          placeholder="Custom title"
        />
      </div>
  
      <!-- List selector -->
<div class="mb-4">
  <label class="text-sm font-medium block mb-1">Lists to Show</label>
  <select v-model="settings.selectedLists" multiple class="w-full border rounded p-2 h-28">
    <option
      v-for="list in displayableLists"
      :key="list.id"
      :value="list.id"
    >
      {{ list.name }}
    </option>
  </select>
</div>

  
      <!-- Tag filter -->
      <div class="mb-4">
        <label class="text-sm font-medium block mb-1">Filter Tags</label>
        <div class="flex flex-wrap gap-2 mb-2">
          <span
            v-for="tag in settings.tags"
            :key="tag"
            class="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center gap-1"
          >
            {{ tag }}
            <button @click="removeTag(tag)" class="text-red-500">×</button>
          </span>
        </div>
        <input
          v-model="tagInput"
          @keydown.enter.prevent="addTagFromInput"
          @keydown.prevent="commaToTag"
          class="w-full px-2 py-1 rounded border border-[color:var(--color-inputBorder)]"
          placeholder="Type tag and press enter or comma"
        />
        <button
          @click="showTagPicker = !showTagPicker"
          class="mt-1 text-xs text-blue-600 hover:underline"
        >
          + Choose from existing tags
        </button>
  
        <div v-if="showTagPicker" class="mt-2 border rounded p-2 bg-white shadow text-black">
          <input
            v-model="tagSearch"
            class="w-full mb-2 px-2 py-1 border rounded"
            placeholder="Search tags..."
          />
          <div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            <span
              v-for="tag in filteredTagOptions"
              :key="tag"
              class="px-2 py-1 rounded-full bg-gray-200 text-sm cursor-pointer hover:bg-blue-200"
              @click="addTag(tag)"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
  
      <!-- Buttons -->
      <div class="mt-6 flex justify-end gap-2">
        <button @click="$emit('close')" class="text-sm px-4 py-1 rounded border">
          Cancel
        </button>
        <button @click="saveAndClose" class="text-sm px-4 py-1 rounded text-white" style="background-color: var(--color-primary)">
          Save & Close
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue'
  
  defineProps()
  const emit = defineEmits(['close', 'refresh'])
  
  const settings = reactive({
    title: 'My Dynamic List',
    selectedLists: [],
    tags: []
  })
  
  const displayableLists = computed(() =>
  availableLists.value.filter(
    list => list?.name && !list.name.toLowerCase().includes('listless')
  )
)

  const availableLists = ref([])
  const tagInput = ref('')
  const tagSearch = ref('')
  const showTagPicker = ref(false)
  const allTags = ref([])
  
  const filteredTagOptions = computed(() =>
    allTags.value.filter(t => t.toLowerCase().includes(tagSearch.value.toLowerCase()) && !settings.tags.includes(t))
  )
  
  function addTagFromInput() {
    const tag = tagInput.value.trim()
    if (tag && !settings.tags.includes(tag)) {
      settings.tags.push(tag)
    }
    tagInput.value = ''
  }
  
  function commaToTag(e) {
    if (e.key === ',') {
      e.preventDefault()
      addTagFromInput()
    }
  }
  
  function addTag(tag) {
    if (!settings.tags.includes(tag)) settings.tags.push(tag)
    tagSearch.value = ''
    showTagPicker.value = false
  }
  
  function removeTag(tag) {
    settings.tags = settings.tags.filter(t => t !== tag)
  }
  
  onMounted(async () => {
  try {
    // Load persisted settings
    const res = await fetch('/api/modules/DynamicList/settings')
    if (res.ok) {
      const data = await res.json()
      Object.assign(settings, data) // ← merge into reactive object
    }
  } catch (err) {
    console.warn('⚠️ Failed to load saved settings')
  }

  // Load available lists
  const listRes = await fetch('/api/lists')
  if (listRes.ok) {
    availableLists.value = await listRes.json()
  }

  // Gather all tags from items
  try {
    const tagRes = await fetch('/api/lists')
    if (tagRes.ok) {
      const lists = await tagRes.json()
      const tags = new Set()
      for (const list of lists) {
        const itemsRes = await fetch(`/api/modules/DynamicList/lists/${list.id}/items`)
        if (itemsRes.ok) {
          const items = await itemsRes.json()
          items.forEach(item => {
            item.tags?.split(',').forEach(tag => {
              if (tag.trim()) tags.add(tag.trim())
            })
          })
        }
      }
      allTags.value = [...tags]
    }
  } catch (err) {
    console.warn('⚠️ Failed to gather tags:', err)
  }
})

  
  async function saveAndClose() {
  try {
    await fetch('/api/modules/DynamicList/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
    emit('refresh')
    emit('close')
  } catch (err) {
    console.error('❌ Failed to save DynamicList settings:', err)
  }
}
  </script>  