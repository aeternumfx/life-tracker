<template>
    <vue3-draggable-resizable
      :x="gridX * gridSize"
      :y="gridY * gridSize"
      :w="alignedWidth"
      :h="alignedHeight"
      :draggable="resizeMode"
      :resizable="resizeMode"
      :minw="minSize.w * gridSize"
      :minh="minSize.h * gridSize"
      :grid="[gridSize, gridSize]"
      :dragSnap="resizeMode"
      :active="resizeMode"
      @dragstop="onDragStop"
      @resizestop="onResizeStop"
      class="component-container"
      :class="{ 'resize-active': resizeMode }"
    >
      <slot />
    </vue3-draggable-resizable>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import Vue3DraggableResizable from 'vue3-draggable-resizable'
  import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'
  
  const props = defineProps({
    id: String,
    position: Object,
    size: Object,
    minSize: Object,
    resizeMode: Boolean,
    gridSize: { type: Number, default: 32 }
  })
  
  const emit = defineEmits(['update:position', 'update:size'])
  
  const gridX = computed(() => props.position.x)
  const gridY = computed(() => props.position.y)
  const width = computed(() => props.size.w)
  const height = computed(() => props.size.h)
  
  const alignedWidth = computed(() => width.value * props.gridSize)
  const alignedHeight = computed(() => height.value * props.gridSize)
  
  function onDragStop(left, top) {
    emit('update:position', {
      x: Math.round(left / props.gridSize),
      y: Math.round(top / props.gridSize)
    })
  }
  
  function onResizeStop(left, top, w, h) {
    emit('update:position', {
      x: Math.round(left / props.gridSize),
      y: Math.round(top / props.gridSize)
    })
  
    emit('update:size', {
      w: Math.round(w / props.gridSize),
      h: Math.round(h / props.gridSize)
    })
  }
  </script>
  
  <style scoped>
  .component-container.resize-active {
    outline: 2px solid #3b82f6;
    background-color: rgba(59, 130, 246, 0.1);
  }
  </style>  