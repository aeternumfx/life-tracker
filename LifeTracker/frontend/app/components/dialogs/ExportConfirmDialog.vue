<template>
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-[--color-surface] text-[--color-textPrimary] p-6 rounded-lg max-w-md shadow-lg">
        <h2 class="text-lg font-semibold mb-2">⚠️ Confirm Export</h2>
        <p class="mb-4">
          This export file will be at least <strong>{{ dbSize }} MB</strong>.<br />
          This creates a copy of current data. <strong>No data will be lost</strong> with this action.
        </p>
        <div class="flex justify-end space-x-3">
          <button @click="$emit('cancel')" class="btn bg-gray-400 text-black hover:bg-gray-500">Cancel</button>
          <button @click="$emit('confirm')" class="btn">Proceed</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({ show: Boolean, dbSize: String })
  defineEmits(['confirm', 'cancel'])
  </script>
  
  <style scoped>
  .btn {
    @apply px-4 py-2 rounded bg-[--color-primary] text-[--color-textPrimary] hover:opacity-80 transition;
  }
  </style>  