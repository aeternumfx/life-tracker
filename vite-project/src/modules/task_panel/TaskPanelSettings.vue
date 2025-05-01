<template>
    <div
      class="p-4 bg-[color:var(--color-surfaceSecondary)] text-[color:var(--color-textPrimary)] border rounded shadow"
    >
      <h3 class="text-lg font-semibold mb-3">Task Panel Settings</h3>
  
      <!-- Toggle Switch -->
<div class="mb-4 flex items-center justify-between">
  <label class="text-sm font-medium">Limit number of events:</label>
  <label class="relative inline-block w-12 h-6 cursor-pointer">
    <input
      type="checkbox"
      v-model="settings.limitEvents"
      class="sr-only peer"
    />
    <div
      class="w-full h-full rounded-full transition-colors duration-300
             peer-checked:bg-[color:var(--color-primary)]
             bg-gray-400"
    ></div>
    <div
      class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300
             peer-checked:translate-x-6"
    ></div>
  </label>
</div>

  
      <!-- Max events input -->
      <div class="mb-2">
        <label class="text-sm font-medium block">Number of events to show:</label>
        <input
          type="number"
          min="1"
          v-model.number="settings.maxEvents"
          :disabled="!settings.limitEvents"
          class="w-full mt-1 p-1 rounded border border-[color:var(--color-inputBorder)] bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)]"
          :class="{ 'opacity-50': !settings.limitEvents }"
        />
      </div>
    </div>

    <div class="mt-6 flex justify-end gap-2">
  <button
    @click="$emit('close')"
    class="text-sm px-4 py-1 rounded border border-[color:var(--color-borderLight)]"
  >
    Cancel
  </button>
  <button
    @click="saveAndClose"
    class="text-sm px-4 py-1 rounded text-white"
    style="background-color: var(--color-primary);"
  >
    Save & Close
  </button>
</div>

  </template>
  
  <script setup>
  import { reactive } from 'vue'
  
  defineProps()
  const emit = defineEmits(['close', 'refresh'])

  
  const settings = reactive({
    limitEvents: true,
    maxEvents: 5
  })

  async function saveAndClose() {
  try {
    await fetch('/api/modules/TaskPanel/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
    emit('refresh')  // 👈 trigger refresh
    emit('close')
  } catch (err) {
    console.error('Failed to save settings:', err)
  }
}


  </script>  