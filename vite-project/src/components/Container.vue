//HELLO CHATGPT

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
        <div class="relative h-full w-full rounded overflow-hidden">
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

const props = defineProps({
  layout: Array,
  gridSize: { type: Number, default: 32 },
  resizeMode: Boolean,
  cols: { type: Number, default: 12 },
  maxRows: Number
})

const emit = defineEmits(['update:layout', 'delete-module'])

function onLayoutUpdated(newLayout) {
  emit('update:layout', newLayout)
}
</script>

<style>

.resize-border {
  outline: 2px dashed #3b82f6;
  outline-offset: -4px;
  border-radius: 0.5rem;
}
</style>