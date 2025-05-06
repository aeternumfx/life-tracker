<template>
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-[--color-surface] text-[--color-textPrimary] rounded p-6 shadow-xl max-w-md w-full">
        <h2 class="text-xl font-semibold mb-4">⚠️ Import Warning</h2>
        <p class="mb-4 text-sm">
          Importing data into an existing instance may cause unexpected behavior.
          <br />
          <strong>It's recommended to only import into a fresh install.</strong>
        </p>
        <p class="mb-4 text-sm">
          You may choose to <em>reset this instance</em> before importing.
        </p>
  
        <div class="flex justify-end space-x-2">
          <button @click="$emit('request-reset')" class="btn bg-red-600 hover:bg-red-700 text-white">🗑️ Reset Instance</button>
          <button @click="$emit('cancel')" class="btn">Cancel</button>
          <button @click="$emit('confirm')" class="btn">Proceed</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useImportExportStore } from '@/stores/importExportStore'
  import { ref } from 'vue'
  
  defineProps({
    show: Boolean
  })
  
  const importExport = useImportExportStore()
  const importedJson = ref(null)
  
  async function doImport() {
    if (!importedJson.value) return
    try {
      await importExport.importData(importedJson.value)
      alert('✅ Import successful!')
    } catch (err) {
      console.error('❌ Import failed:', err)
      alert('❌ Failed to import.')
    }
  }
  
  // This method should be called via @confirm from parent
  defineExpose({ doImport, setJson: json => (importedJson.value = json) })
  </script>  
  
  <style scoped>
  .btn {
    @apply px-3 py-2 rounded bg-[--color-primary] text-[--color-textPrimary] hover:opacity-80 transition;
  }
  </style>  