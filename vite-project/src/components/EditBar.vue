<!-- EditBar.vue -->
<template>
    <div class="bg-gray-200 px-4 py-2 flex items-center justify-between border-b border-gray-300">
      <div class="space-x-4">
        <button class="bg-gray-500 text-white px-3 py-1 rounded" @click="$emit('exit-edit', false)">Don't Save</button>
        <button class="bg-blue-600 text-white px-3 py-1 rounded" @click="$emit('exit-edit', true)">Save</button>
        <button class="bg-yellow-500 text-white px-3 py-1 rounded" @click="$emit('show-module-browser')">Add Modules</button>
      </div>
      <span>Edit tools (placeholder)</span>
    </div>
  </template>
  
  
  <script setup>
  defineEmits(['show-module-browser', 'save-layout', 'exit-edit'])
  </script>  