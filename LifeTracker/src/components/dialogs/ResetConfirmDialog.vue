<template>
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-[--color-surface] text-[--color-textPrimary] rounded p-6 shadow-xl max-w-md w-full">
        <h2 class="text-xl font-semibold mb-4">🗑️ Confirm Reset</h2>
        <p class="mb-4 text-sm">
          This will permanently delete all current data.
          <br />
          To confirm, type <strong>I am sure</strong> below:
        </p>
        <input
          v-model="confirmation"
          type="text"
          placeholder="I am sure"
          class="w-full mb-4 p-2 border rounded text-[--color-inputText] bg-[--color-inputBg]"
        />
  
        <div class="flex justify-end space-x-2">
          <button @click="$emit('cancel')" class="btn">Cancel</button>
          <button @click="confirmReset" class="btn bg-red-600 hover:bg-red-700 text-white">Confirm</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const props = defineProps({
    show: Boolean
  })
  const emit = defineEmits(['confirm', 'cancel'])
  
  const confirmation = ref('')
  
  function confirmReset() {
    if (confirmation.value === 'I am sure') {
      confirmation.value = ''
      emit('confirm')
    } else {
      alert('Please type "I am sure" exactly to proceed.')
    }
  }
  </script>
  
  <style scoped>
  .btn {
    @apply px-3 py-2 rounded bg-[--color-primary] text-[--color-textPrimary] hover:opacity-80 transition;
  }
  </style>  