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
  const emit = defineEmits(['item-added'])
  
  const form = reactive({
    title: ''
  })
  
  function submitForm() {
    emit('item-added', { ...form, type: 'task' })
  }
  </script>  