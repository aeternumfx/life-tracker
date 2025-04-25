<template>
  <GridLayout
    :layout="layout"
    :col-num="cols"
    :row-height="gridSize"
    :max-rows="maxRows"
    :is-draggable="resizeMode"
    :is-resizable="resizeMode"
    :vertical-compact="true"
    :use-css-transforms="true"
    @layout-updated="(l) => emit('update:layout', l)"
  >
    <template v-for="item in layout" :key="item.i">
      <GridItem
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        :min-w="item.minW"
        :min-h="item.minH"
      >
        <div class="relative h-full w-full border rounded overflow-hidden">
          <!-- Delete + Settings buttons -->
          <div
            v-if="resizeMode"
            class="absolute top-1 right-1 flex gap-1 z-10"
          >
            <button
              @click="emit('delete-module', item.i)"
              class="text-white bg-red-600 hover:bg-red-700 rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
              title="Remove"
            >
              ✕
            </button>
            <button
              class="text-gray-600 bg-white border rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
              title="Settings"
            >
              ⋮
            </button>
          </div>

          <!-- Module component -->
          <component :is="item.component" v-bind="item.props" class="h-full w-full" />
        </div>
      </GridItem>
    </template>
  </GridLayout>
</template>

  
  
  <script setup>
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
  const emit = defineEmits(['update:layout', 'delete-module'])
  
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
  