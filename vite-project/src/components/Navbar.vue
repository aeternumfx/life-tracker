<template>
  <nav class="flex justify-between items-center px-4 py-2 bg-gray-800 text-white">
    <!-- App Title -->
    <div class="text-lg font-bold">Life Tracker</div>

    <!-- Settings Dropdown -->
    <div class="relative" ref="dropdownRef">
      <button @click="toggleDropdown" class="text-xl">⚙️</button>
      <div
        v-if="dropdownOpen"
        class="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow z-50"
      >
        <button
          @click="$emit('toggle-resize')"
          class="block w-full px-4 py-2 hover:bg-gray-100 text-left"
        >
          Toggle Resize Mode
        </button>
        <button
          @click="openModuleModal"
          class="block w-full px-4 py-2 hover:bg-gray-100 text-left"
        >
          Add Modules
        </button>
      </div>
    </div>

    <!-- Module Browser Modal -->
    <ModuleBrowser
      :visible="showModuleModal"
      :modules="availableModules"
      @close="showModuleModal = false"
      @add-module="$emit('add-module', $event)"
    />
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import modules from '../modules/_allModules'
import ModuleBrowser from './ModuleBrowser.vue'

const dropdownOpen = ref(false)
const showModuleModal = ref(false)
const dropdownRef = ref(null)

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function openModuleModal() {
  dropdownOpen.value = false
  showModuleModal.value = true
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

const availableModules = computed(() =>
  modules
    .filter(mod => mod?.defaultLayout && mod?.component)
    .map(mod => ({
      ...mod.defaultLayout,
      component: mod.component,
      props: mod.getProps ? mod.getProps({}) : {},
      title: mod.title || mod.id,
      id: mod.id
    }))
)
</script>