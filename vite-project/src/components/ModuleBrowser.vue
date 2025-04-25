<!-- src/components/ModuleBrowser.vue -->
<template>
    <div
      v-if="visible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white w-3/4 max-h-[90vh] overflow-y-auto p-4 rounded shadow">
        <h2 class="text-xl font-bold mb-4">Module Browser</h2>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="mod in modules"
            :key="mod.id"
            class="border rounded p-4 flex flex-col justify-between"
          >
            <div>
              <h3 class="font-semibold mb-2">{{ mod.title }}</h3>
              <component
                :is="mod.component"
                v-bind="mod.props"
                class="pointer-events-none opacity-50"
              />
            </div>
            <button
              class="mt-2 bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
              @click="$emit('add-module', mod)"
            >
              ＋ Add
            </button>
          </div>
        </div>
        <button
          class="mt-6 block ml-auto bg-gray-200 px-4 py-2 rounded"
          @click="$emit('close')"
        >
          Close
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    visible: Boolean,
    modules: Array
  })
  
  defineEmits(['close', 'add-module'])
  </script>  