<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <!-- Top Navbar -->
    <Navbar :resizeMode="resizeMode" @toggle-edit-mode="enableEditMode" />
    <EditBar
  v-if="isEditMode"
  @show-module-browser="showModuleBrowser = true"
  @save-layout="saveLayoutToFile"
  @exit-edit="exitEditMode"
/>

    <!-- Main Area with optional module browser -->
    <div class="flex flex-1 relative overflow-hidden">
      <!-- Grid layout area -->
      <div :class="['transition-all duration-300', showModuleBrowser ? 'w-[calc(100%-20rem)]' : 'w-full']">
        <!-- Wrap the Container in a div that handles drop events -->
        <div
  class="relative w-full h-full min-h-screen pointer-events-auto"
  :class="{ 'grid-background': resizeMode }"
  @dragover.prevent
  @drop="handleDrop"
>
  <Container
    :layout="layout"
    :gridSize="32"
    :resizeMode="resizeMode"
    :cols="12"
    :maxRows="maxRows.value"
    @update:layout="(newLayout) => layout = newLayout"
    @delete-module="handleDeleteModule"
  />
</div>
      </div>

      <ModuleBrowser
  :visible="showModuleBrowser"
  :modules="availableModules"
  @close="handleModuleBrowserClose"
/>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, markRaw } from 'vue'
import Navbar from '../components/Navbar.vue'
import EditBar from '../components/EditBar.vue'
import Container from '../components/Container.vue'
import ModuleBrowser from '../components/ModuleBrowser.vue'
import modules from '../modules/_allModules'
import calendarModule from '../modules/Calendar'

// State refs
const layout = ref([])
const calendarEvents = ref([])
const eventSourceKey = ref(0)
const resizeMode = ref(false)
const showModuleBrowser = ref(false)
const gridSize = ref(32)
const maxRows = ref(Math.floor(window.innerHeight / gridSize.value))
const suppressResizePrompt = ref(false)
const isEditMode = ref(false)

function enableEditMode() {
  isEditMode.value = true
  resizeMode.value = true
}

function handleDeleteModule(id) {
  layout.value = layout.value.filter((item) => item.i !== id)
}

function exitEditMode(save = false) {
  if (save) {
    saveLayoutToFile()
  }

  suppressResizePrompt.value = true
  isEditMode.value = false
  resizeMode.value = false
  showModuleBrowser.value = false
}

// Utility functions
function toggleResize() {
  resizeMode.value = !resizeMode.value
}

function toggleModuleBrowser() {
  showModuleBrowser.value = !showModuleBrowser.value
  if (showModuleBrowser.value) {
    resizeMode.value = true
  }
}

function handleModuleBrowserClose() {
  showModuleBrowser.value = false
}

function handleDragStart(module) {
  draggedModule.value = module
}

function handleDrop(event) {
  let modData
  try {
    const data = event.dataTransfer.getData('application/json')
    if (!data) return
    modData = JSON.parse(data)
  } catch (err) {
    console.warn('Invalid drop payload:', err)
    return
  }

  const container = event.currentTarget.getBoundingClientRect()
  const offsetX = event.clientX - container.left
  const offsetY = event.clientY - container.top

  const gridX = Math.floor(offsetX / gridSize.value)
  const gridY = Math.floor(offsetY / gridSize.value)

  const sourceModule = availableModules.value.find(m => m.id === modData.id)
  if (!sourceModule) {
    console.warn(`No module found for ID "${modData.id}"`)
    return
  }

  layout.value.push({
    i: `${modData.id}-${Date.now()}`,
    x: gridX,
    y: gridY,
    w: modData.w || 3,
    h: modData.h || 5,
    minW: modData.minW || 3,
    minH: modData.minH || 5,
    component: sourceModule.component, // ✅ pulled from real module ref
    props: modData.props || {}
  })
}

function loadEvents() {
  fetch('/api/events')
    .then(res => res.json())
    .then(data => {
      calendarEvents.value = data
      eventSourceKey.value++
    })
}

async function saveLayoutToFile() {
  const layoutToSave = layout.value.map(({ i, x, y, w, h, minW, minH }) => ({
    i, x, y, w, h, minW, minH
  }))

  try {
    const res = await fetch('/api/save-layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(layoutToSave)
    })

    const data = await res.json()
    if (!data.success) throw new Error('Save failed')
  } catch (err) {
    console.error('Failed to save layout:', err)
  }
}

function resolveComponent(id) {
  const match = availableModules.value.find(m => id.startsWith(m.id))
  return match?.component || null
}

function getComponentProps(id) {
  const match = availableModules.value.find(m => id.startsWith(m.id))
  return match?.props || {}
}

// Dynamically import all modules and wrap their data
const availableModules = ref(
  modules.map(mod => ({
    id: mod.id,
    component: mod.component, // ensure it's raw, no proxy wrapping
    props: mod.getProps
      ? mod.getProps({
          events: calendarEvents,
          eventSourceKey,
          onEventAdded: loadEvents
        })
      : {},
    ...mod.defaultLayout
  }))
)

onMounted(() => {
  // Handle maxRows on window resize
  window.addEventListener('resize', () => {
    maxRows.value = Math.floor(window.innerHeight / gridSize.value)
  })

  // Async layout loader
  const tryLoadLayout = async (url) => {
    try {
      const res = await fetch(url)
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) return false

      layout.value = data.map(item => ({
        ...item,
        component: resolveComponent(item.i),
        props: getComponentProps(item.i)
      }))

      return true
    } catch (err) {
      console.warn(`Failed to load layout from ${url}:`, err)
      return false
    }
  }

  // Load layout, fallback to default if missing
  ;(async () => {
    const loaded = await tryLoadLayout('/api/load-layout')
    if (!loaded) {
      console.log('Falling back to default layout.')
      await tryLoadLayout('/api/default-layout')
    }

    loadEvents()
  })()
})

watch(resizeMode, async (newVal, oldVal) => {
  if (oldVal && !newVal) {
    if (suppressResizePrompt.value) {
      suppressResizePrompt.value = false
      return
    }

    const confirmSave = window.confirm('Do you want to save layout changes?')
    if (confirmSave) await saveLayoutToFile()
  }
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

/* Disable drag image in some cases */
[draggable="true"] {
  -webkit-user-drag: none;
}

</style>