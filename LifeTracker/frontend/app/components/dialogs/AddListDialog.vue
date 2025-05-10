<template>
    <dialog ref="dialogRef" class="rounded-xl p-6 w-[400px] max-w-full shadow-xl bg-[color:var(--color-surface)] text-[color:var(--color-textPrimary)]">
      <form @submit.prevent="submitForm" class="space-y-4">
        <h2 class="text-lg font-semibold">Add New List</h2>
  
        <div>
          <label class="block text-sm mb-1">List Name</label>
          <input v-model="form.name" class="w-full p-2 rounded border border-[color:var(--color-inputBorder)] bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)]" required />
        </div>
  
        <!-- Optional: Add dropdown for type or project_id if needed -->
  
        <div class="flex justify-end gap-2">
          <button type="button" @click="dialogRef?.close()" class="px-4 py-1 bg-gray-400 text-white rounded">Cancel</button>
          <button type="submit" class="px-4 py-1 bg-green-600 text-white rounded">Create</button>
        </div>
      </form>
    </dialog>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  const emit = defineEmits(['list-added'])
  
  const dialogRef = ref(null)
  const form = reactive({
    name: ''
  })
  
  function open() {
    form.name = ''
    dialogRef.value?.showModal()
  }
  
  async function submitForm() {
    const res = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name })
    })
  
    if (res.ok) {
      const { id } = await res.json()
      emit('list-added', { id, name: form.name })
      dialogRef.value?.close()
    } else {
      console.error('❌ Failed to create list')
    }
  }
  
  defineExpose({ open })
  </script>  