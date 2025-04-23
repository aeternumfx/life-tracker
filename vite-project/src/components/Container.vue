<template>
    <div class="grow-layout relative">
      <!-- Grid Overlay applied behind everything with ripple animation -->
      <div
        v-if="resizeMode"
        class="grid-overlay ripple-enter pointer-events-none z-0"
      />
  
      <grid-layout
        class="full-grid z-10"
        :layout="layout"
        :col-num="cols"
        :row-height="gridSize"
        :is-draggable="resizeMode"
        :is-resizable="resizeMode"
        :margin="[0, 0]"
        :use-css-transforms="true"
        :responsive="false"
        :max-rows="maxRows"
        @layout-updated="onLayoutUpdated"
      >
        <grid-item
          v-for="item in layout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :static="item.static || false"
          :min-w="item.minW || 2"
          :min-h="item.minH || 2"
          v-show="!item.hidden"
          :class="{ 'resize-border': resizeMode }"
        >
          <div class="relative w-full h-full">
            <component
              v-if="!item.hidden"
              :is="item.component"
              v-bind="item.props"
            />
          </div>
        </grid-item>
      </grid-layout>
    </div>
  </template>  
  
  
  <script setup>
  import { ref } from 'vue'
  import { GridLayout, GridItem } from 'vue3-grid-layout'
  
  // props
  const props = defineProps({
  layout: Array,
  gridSize: { type: Number, default: 32 },
  resizeMode: Boolean,
  cols: { type: Number, default: 12 },
  maxRows: Number
})

  
  // emits layout update
  const emit = defineEmits(['update:layout'])
  
  function onLayoutUpdated(newLayout) {
    emit('update:layout', newLayout)
  }
  </script>
  
  <style>
@keyframes ripple-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.grid-overlay.ripple-enter {
  animation: ripple-in 0.6s ease-out forwards;
}

.grid-overlay {
  background-image:
    linear-gradient(to right, rgba(203, 213, 225, 0.4) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(203, 213, 225, 0.4) 1px, transparent 1px);
  background-size: 32px 32px;
  background-position: 0 0;
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 0;
}


.full-grid {
  position: relative;
  height: 100%;
  width: 100%;
}

.grow-layout {
  height: 100%;
  width: 100%;
  position: relative;
  z-index: 0;
}

.resize-border {
  outline: 2px dashed #3b82f6;
  outline-offset: -4px;
  border-radius: 0.5rem;
}

  </style>
  