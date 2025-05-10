<template>
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-[--color-surface] text-[--color-textPrimary] rounded p-6 shadow-xl max-w-xl w-full">
        <h2 class="text-xl font-semibold mb-4">🧪 Generate Dummy Data</h2>
        <p class="mb-4 text-sm">
          Generating dummy data may <strong>pollute your system</strong> with placeholder entries.
          <br />
          It is recommended to only use this on a fresh or test instance.
        </p>
  
        <div v-if="output" class="bg-black text-green-400 font-mono text-xs p-3 rounded overflow-auto max-h-60 whitespace-pre-wrap mb-4">
          {{ output }}
        </div>
  
        <div class="flex justify-end space-x-2">
          <button @click="$emit('cancel')" class="btn">Cancel</button>
          <button :disabled="loading" @click="runDummySeed" class="btn bg-blue-600 hover:bg-blue-700 text-white">
            {{ loading ? 'Running...' : 'Run Seed Script' }}
          </button>
        </div>
      </div>
    </div>
  </template>  
  
  <script setup>
  import { ref } from 'vue'
  
  const props = defineProps({ show: Boolean })
  const emit = defineEmits(['cancel', 'done'])
  
  const output = ref('')
  const loading = ref(false)
  
  async function runDummySeed() {
    loading.value = true
    output.value = ''
  
    try {
      const res = await fetch('/api/generate-dummy', { method: 'POST' })
      const result = await res.json()
  
      if (result.error) {
        output.value = `❌ ${result.error}`
      } else {
        output.value = result.output || '✅ Dummy data generated.'
        emit('done') // optional
      }
    } catch (err) {
      output.value = `❌ Request failed: ${err.message}`
    }
  
    loading.value = false
  }
  </script>
  
  <style scoped>
  .btn {
    @apply px-3 py-2 rounded bg-[--color-primary] text-[--color-textPrimary] hover:opacity-80 transition;
  }
  </style>  