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
          <div v-if="resizeMode" class="absolute top-1 right-1 flex gap-1 z-10">
            <button
              @click="emit('delete-module', item.i)"
              class="text-white bg-red-600 hover:bg-red-700 rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
              title="Remove"
            >
              ✕
            </button>

            <div class="relative">
              <button
                @click="toggleDropdown(item.i)"
                class="text-gray-600 bg-white border rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                title="Settings"
              >
                ⋮
              </button>

              <div
                v-if="activeDropdown === item.i"
                class="absolute right-0 mt-1 bg-white shadow rounded text-sm z-20"
              >
                <button
                  @click="emitToComponent(item.i, 'settings-clicked')"
                  class="block w-full px-3 py-1 hover:bg-gray-100 text-left"
                >
                  Module Settings
                </button>
              </div>
            </div>
          </div>

          <!-- Module component -->
          <component
  :is="item.component"
  v-bind="item.props"
  :onSettingsClicked="(cb) => registerSettingsHandler(item.i, cb)"
  @open-settings="$emit('open-settings', item.i)"
  class="h-full w-full"
/>


        </div>
      </GridItem>
    </template>
  </GridLayout>
</template>

<script setup>
import { ref } from 'vue'
import { GridLayout, GridItem } from 'vue3-grid-layout'

const props = defineProps({
  layout: Array,
  gridSize: { type: Number, default: 32 },
  resizeMode: Boolean,
  cols: { type: Number, default: 12 },
  maxRows: Number,
  onGlobalSettingsClicked: Function
})

const emit = defineEmits(['update:layout', 'delete-module', 'open-settings'])

const settingsHandlers = {}

function registerSettingsHandler(id, callback) {
  // console.log('📬 Registering handler for', id)
  settingsHandlers[id] = callback
}


function onLayoutUpdated(newLayout) {
  emit('update:layout', newLayout)
}

const activeDropdown = ref(null)

function toggleDropdown(id) {
  activeDropdown.value = activeDropdown.value === id ? null : id
}

function emitToComponent(id, eventName) {
  // console.log('⚙️ Triggering', eventName, 'for', id)
  if (eventName === 'settings-clicked' && settingsHandlers[id]) {
    const panelComponent = settingsHandlers[id]()
    if (panelComponent && props.onGlobalSettingsClicked) {
      panelComponent.__moduleId = id
      props.onGlobalSettingsClicked(panelComponent)
    }
  }
  activeDropdown.value = null
}
</script>

<style>
.resize-border {
  outline: 2px dashed #3b82f6;
  outline-offset: -4px;
  border-radius: 0.5rem;
}
</style>