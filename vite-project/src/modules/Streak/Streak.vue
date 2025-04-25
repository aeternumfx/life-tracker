<template>
    <div class="h-full w-full p-2 flex flex-col justify-between items-center relative streak">
      <!-- Settings Button -->
      <button
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        @click="showSettings = !showSettings"
      >
        ⋮
      </button>
  
      <div>
      <!-- Fire Emoji -->
      <div class="text-[5rem]">🔥</div>
  
      <!-- Day Counter -->
      <div class="text-4xl font-bold text-orange-600">
        {{ streakCount }}
      </div>
    </div>
  
      <!-- Settings Modal -->
      <div v-if="showSettings" class="absolute top-10 right-2 bg-white shadow p-3 border rounded z-10">
        <p class="text-sm text-gray-700">Settings coming soon...</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const showSettings = ref(false)
  const streakCount = 69 // hardcoded for now
  </script>
  
  <style scoped>
    .streak {
        border-width: 5px;
        border-color: orange;
        border-radius: 5%;
    }
  </style>  