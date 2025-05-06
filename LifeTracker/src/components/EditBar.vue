<template>
    <div class="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
      <div class="space-x-2">
        <button @click="$emit('show-module-browser')" class="btn">Add Modules</button>
        <button @click="$emit('show-theme-manager')" class="btn">Theme Manager</button>
      </div>
  
      <div class="space-x-2">
        <button @click="$emit('save-layout')" class="btn">Save Layout</button>
        <button @click="$emit('exit-edit')" class="btn bg-red-500 text-white">Don't Save</button>
      </div>
    </div>
  </template>
  
  <script setup>
  const emit = defineEmits(['show-module-browser', 'save-layout', 'exit-edit', 'show-theme-manager'])
  </script>

  <style scoped>
  .btn {
    @apply px-3 py-1 rounded border text-sm hover:bg-gray-200 dark:hover:bg-gray-700;
  }
  </style>