<template>
    <div
      v-if="visible"
      class="fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-50 flex flex-col"
    >
      <div class="p-4 border-b">
        <h2 class="text-xl font-bold">Add Modules</h2>
        <button @click="$emit('close')" class="mt-2 text-sm text-blue-600">
          Close
        </button>
      </div>
  
      <div class="flex-1 overflow-y-auto p-4 space-y-4 grid-background">
        <div
  v-for="mod in modules"
  :key="mod.id"
  draggable="true"
  @dragstart="(e) => onDragStart(e, mod)"
  class="bg-gray-100 border rounded shadow p-2 cursor-grab hover:shadow-md transition"
>
  <p class="text-xs text-gray-500">{{ mod.id }}</p>
  <component
    :is="mod.component"
    v-bind="mod.props"
    class="pointer-events-none opacity-70"
  />
</div>

      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue'
  const props = defineProps({
    visible: Boolean,
    modules: Array
  })
  const emit = defineEmits(['close', 'drag-start'])
  
  function onDragStart(e, mod) {
    const ghost = document.createElement('div')
    ghost.style.width = '80px'
    ghost.style.height = '80px'
    ghost.style.background = '#ccc'
    ghost.style.opacity = '0'
    document.body.appendChild(ghost)
  
    e.dataTransfer.setDragImage(ghost, 40, 40)
    e.dataTransfer.setData('application/json', JSON.stringify(mod))
    e.dataTransfer.effectAllowed = 'copy'
  
    setTimeout(() => document.body.removeChild(ghost), 0)
    emit('drag-start', mod)
  }

  onMounted(() => {
  console.log('Module browser received modules:', props.modules)
})

  </script>
  
  <style scoped>
  .grid-background {
    background: repeating-linear-gradient(
        to right,
        #eee,
        #eee 1px,
        transparent 1px,
        transparent 25px
      ),
      repeating-linear-gradient(
        to bottom,
        #eee,
        #eee 1px,
        transparent 1px,
        transparent 25px
      );
  }
  </style>  