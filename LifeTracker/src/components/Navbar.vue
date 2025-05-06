<template>
  <nav class="flex justify-between items-center px-4 py-2 bg-gray-800 text-white">
    <div class="text-lg font-bold">Life Tracker</div>

    <div class="flex space-x-4">
      <RouterLink to="/" class="hover:underline">Dashboard</RouterLink>
      <RouterLink to="/projects" class="hover:underline">Projects</RouterLink>
      <RouterLink to="/events" class="hover:underline">Events</RouterLink>
      <RouterLink to="/tasks" class="hover:underline">Tasks</RouterLink>
      <RouterLink to="/lists" class="hover:underline">Lists</RouterLink>
      <RouterLink to="/goals" class="hover:underline">Goals</RouterLink>
    </div>

    <div class="relative" ref="dropdownRef">
  <button @click="toggleDropdown" class="text-xl">⚙️</button>
  <div
    v-if="dropdownOpen"
    class="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow z-50"
  >
    <RouterLink
      to="/settings"
      class="block w-full px-4 py-2 hover:bg-gray-100 text-left"
    >
      Settings
    </RouterLink>
    <button
      v-if="isDashboard"
      @click="handleEditMode"
      class="block w-full px-4 py-2 hover:bg-gray-100 text-left"
    >
      Edit Mode
    </button>
  </div>
</div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const emit = defineEmits(['toggle-edit-mode', 'show-theme-manager'])

const dropdownOpen = ref(false)
const dropdownRef = ref(null)

const route = useRoute()
const isDashboard = computed(() => route.path === '/')

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false
  }
}

function handleEditMode() {
  emit('toggle-edit-mode')
  dropdownOpen.value = false
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>