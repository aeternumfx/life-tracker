<template>
  <nav class="w-full h-16 bg-gray-800 text-white flex items-center justify-between px-4 shadow z-50">
    <h1 class="text-lg font-bold">📅 Life Tracker</h1>
    <button
      @click="$emit('toggle-resize')"
      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
    >
      {{ resizeMode ? 'Exit Resize Mode' : 'Enter Resize Mode' }}
    </button>
  </nav>
</template>

<script setup>
defineProps({ resizeMode: Boolean })
defineEmits(['toggle-resize'])
</script>