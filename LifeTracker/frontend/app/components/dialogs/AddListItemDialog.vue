<!-- src/modules/DynamicList/AddListItemDialog.vue -->
<template>
    <dialog ref="dialogRef" class="rounded-xl p-6 w-[500px] max-w-full shadow-xl bg-[color:var(--color-surface)] text-[color:var(--color-textPrimary)]">
      <form @submit.prevent="submitForm" class="space-y-4">
  
        <div class="text-lg font-bold">Add List Item</div>

        <!-- Type selector -->
<div>
  <label class="block text-sm mb-1">Type</label>
  <select v-model="form.type" class="w-full p-2 rounded border bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)] border-[color:var(--color-inputBorder)]">
    <option value="item">List Item</option>
    <option value="task">Task</option>
  </select>
</div>
        
  
        <!-- Name -->
        <div>
          <label class="block text-sm mb-1">Item Name</label>
          <div class="flex gap-2">
            <input v-model="form.text" required class="flex-1 p-2 rounded border bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)] border-[color:var(--color-inputBorder)]" />
            <button type="button" @click="form.text = ''" class="text-[color:var(--color-warning)]">🗑</button>
          </div>
        </div>

        <label class="block text-sm mb-1">List</label>
<select v-model="form.listId" class="w-full p-2 rounded border bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)] border-[color:var(--color-inputBorder)]">
  <option v-for="list in availableLists" :key="list.id" :value="list.id">
    {{ list.name }}
  </option>
</select>

  
        <!-- Priority -->
        <div>
          <label class="block text-sm mb-1">Priority</label>
          <select v-model="form.priority" class="w-full p-2 rounded border bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)] border-[color:var(--color-inputBorder)]">
            <option value="0">Low</option>
            <option value="1">Medium</option>
            <option value="2">High</option>
          </select>
        </div>
  
        <!-- Tags -->
        <div>
          <label class="text-sm font-medium block mb-1">Tags</label>
  
          <!-- Tag pills -->
          <div class="flex flex-wrap gap-2 mb-2">
            <span
              v-for="tag in form.tags"
              :key="tag"
              class="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center gap-1"
            >
              {{ tag }}
              <button @click.prevent="removeTag(tag)" class="text-red-500">×</button>
            </span>
          </div>
  
          <!-- Tag input -->
          <input
            v-model="tagInput"
            @keydown.enter.prevent="addTagFromInput"
            @keydown.prevent="commaToTag"
            class="w-full px-2 py-1 rounded border border-[color:var(--color-inputBorder)] bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)]"
            placeholder="Type tag and press enter or comma"
          />
  
          <!-- Picker -->
          <button
            @click.prevent="showTagPicker = !showTagPicker"
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
        <div class="flex justify-end gap-2 pt-4">
          <button type="submit" class="px-4 py-1 rounded bg-[color:var(--color-primary)] text-white">Add</button>
          <button type="button" @click="close" class="px-4 py-1 rounded border border-[color:var(--color-borderLight)]">Cancel</button>
        </div>
      </form>
    </dialog>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue'

  const availableLists = ref([])
  
  const emit = defineEmits(['item-added'])
  const dialogRef = ref(null)
  
  const form = reactive({
  type: 'item', // ✅ add this default
  text: '',
  priority: 0,
  tags: [],
  listId: null
})


  onMounted(async () => {
  const res = await fetch('/api/lists')
  if (res.ok) {
    availableLists.value = await res.json()
    // Default selection to 'listless' if nothing is chosen
    if (!form.listId && availableLists.value.length > 0) {
  const listless = availableLists.value.find(l => l.name.toLowerCase().includes('listless'))
  form.listId = listless?.id || availableLists.value[0].id
}
  } else {
    console.warn('⚠️ Failed to load available lists')
  }
})
  
  const tagInput = ref('')
  const tagSearch = ref('')
  const showTagPicker = ref(false)
  const allTags = ref([])
  
  onMounted(fetchAllTags)
  
  async function fetchAllTags() {
    const res = await fetch('/api/lists')
    if (res.ok) {
      const lists = await res.json()
      const tagSet = new Set()
      for (const list of lists) {
        const itemsRes = await fetch(`/api/modules/dynamic-list/lists/${list.id}/items`)
        if (itemsRes.ok) {
          const items = await itemsRes.json()
          items.forEach(item =>
            item.tags?.split(',').forEach(tag => tagSet.add(tag.trim()))
          )
        }
      }
      allTags.value = [...tagSet].filter(Boolean)
    }
  }
  
  const filteredTagOptions = computed(() =>
    allTags.value.filter(t =>
      t.toLowerCase().includes(tagSearch.value.toLowerCase()) &&
      !form.tags.includes(t)
    )
  )
  
  function addTagFromInput() {
    const tag = tagInput.value.trim()
    if (tag && !form.tags.includes(tag)) {
      form.tags.push(tag)
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
    if (!form.tags.includes(tag)) form.tags.push(tag)
    tagSearch.value = ''
    showTagPicker.value = false
  }
  
  function removeTag(tag) {
    form.tags = form.tags.filter(t => t !== tag)
  }
  
  function resetForm() {
    form.text = ''
    form.priority = 0
    form.tags = []
    tagInput.value = ''
    tagSearch.value = ''
    showTagPicker.value = false
  }
  
function open() {
  resetForm()
  // Set listId again here to ensure it’s populated before submit
  const listless = availableLists.value.find(l => l.name.toLowerCase().includes('listless'))
  form.listId = listless?.id || availableLists.value[0]?.id || null

  console.log('[open] Setting listId to:', form.listId)
  dialogRef.value?.showModal()
}
  
  function close() {
    dialogRef.value?.close()
  }
  
  defineExpose({ open })
  
  async function submitForm() {
  if (!form.text.trim()) return;
  if (!form.listId) {
  console.warn('[submitForm] Missing listId. Abort.')
  return
}

  const payload = {
  type: form.type, // "item" or "task"
  text: form.text.trim(),
  priority: form.priority,
  tags: form.tags.join(','),
  list_id: form.listId,
};

  console.log('[AddItemDialog] Submitting:', payload); // ✅ Add this
  emit('item-added', payload);

  close();
}

  </script>