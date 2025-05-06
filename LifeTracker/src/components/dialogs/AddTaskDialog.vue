<!-- src/components/dialogs/AddTaskDialog.vue -->
<template>
    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label class="block text-sm mb-1">Task Name</label>
        <input v-model="form.title" class="w-full border rounded p-2" required />
      </div>
  
      <div class="flex justify-end">
        <button type="submit" class="px-4 py-1 rounded bg-green-600 text-white">Save</button>
      </div>
    </form>
  </template>
  
  <script setup>
  import { reactive } from 'vue'
  import { useTaskStore } from '@/stores/taskStore'
  
  const emit = defineEmits(['item-added'])
  const taskStore = useTaskStore()
  
  const form = reactive({
    title: '',
    description: '',
    due_date: null,
    due_time: null
  })
  
  async function submitForm() {
    await taskStore.addTask(form)
    emit('item-added', { ...form }) // Optionally still emit for UI close
  }
  </script>