<template>
  <nav class="flex justify-between items-center px-4 py-2 bg-gray-800 text-white">
    <div class="text-lg font-bold">Life Tracker</div>

    <div class="relative" ref="dropdownRef">
      <button @click="toggleDropdown" class="text-xl">⚙️</button>
      <div
        v-if="dropdownOpen"
        class="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow z-50"
      >
        <button
          @click="$emit('toggle-edit-mode')"
          class="block w-full px-4 py-2 hover:bg-gray-100 text-left"
        >
          Edit Mode
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const dropdownOpen = ref(false)
const dropdownRef = ref(null)

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>