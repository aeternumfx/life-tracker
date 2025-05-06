<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <!-- Top Navbar -->
    <!-- <Navbar :resizeMode="resizeMode" @toggle-edit-mode="enableEditMode" /> -->
    <EditBar
  v-if="isEditMode"
  @show-module-browser="showModuleBrowser = true"
  @show-theme-manager="showThemeManager = true"
  @save-layout="() => exitEditMode(true)"
  @exit-edit="exitEditMode"
/>
<ThemeManager
  v-if="showThemeManager"
  @close="showThemeManager = false"
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
  @open-settings="(id) => openSettingsFor.value = id"
  :onGlobalSettingsClicked="handleGlobalSettingsClicked"
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

<!-- Global Settings Panel Overlay -->
<div v-if="showSettingsPanel"
     class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <div class="bg-[color:var(--color-surface)] p-6 rounded shadow-xl max-w-md w-full">
    <component
  :is="activeSettingsComponent"
  @close="closeSettingsPanel"
  @refresh="refreshActiveModule"
/>
  </div>
</div>

</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, markRaw, computed } from 'vue'
import Navbar from '../components/Navbar.vue'
import EditBar from '../components/EditBar.vue'
import Container from '../components/Container.vue'
import ModuleBrowser from '../components/ModuleBrowser.vue'
import modules from '../modules/_allModules'
import ThemeManager from '../components/ThemeManager.vue'
import { useModuleSettingsStore } from '@/stores/moduleSettingsStore'

const layout = ref([])

const activeModuleIds = computed(() =>
  layout.value.map(l => l.i)
)

onMounted(() => {
  window.addEventListener('toggle-edit-mode', enableEditMode)
})


onBeforeUnmount(() => {
  window.removeEventListener('toggle-edit-mode', enableEditMode)
})

const settingsStore = useModuleSettingsStore()
const openSettingsFor = ref(null)
const activeSettingsComponent = ref(null)
const showSettingsPanel = ref(false)

function handleGlobalSettingsClicked(component) {
  activeSettingsComponent.value = component
  showSettingsPanel.value = true

  // 🔧 Add this line to track which module is being edited
  openSettingsFor.value = component?.__moduleId || null
}



const loadedSettings = new Set()

watch(activeModuleIds, async (newIds) => {
  const toLoad = newIds.filter(id => !loadedSettings.has(id))
  if (toLoad.length === 0) return

  await settingsStore.preloadSettings(toLoad)
  toLoad.forEach(id => loadedSettings.add(id))
})

function closeSettingsPanel() {
  showSettingsPanel.value = false
  activeSettingsComponent.value = null
}

function refreshActiveModule() {
  const timestamp = Date.now()
  layout.value = layout.value.map(item => ({
    ...item,
    props: {
      ...item.props,
      refreshKey: timestamp
    }
  }))

  //console.log('🔁 Triggered global refresh for all modules')
}

// State refs
const calendarEvents = ref([])
const eventSourceKey = ref(0)
const resizeMode = ref(false)
const showModuleBrowser = ref(false)
const gridSize = ref(32)
const maxRows = ref(Math.floor(window.innerHeight / gridSize.value))
const suppressResizePrompt = ref(false)
const isEditMode = ref(false)
const showThemeManager = ref(false)


function enableEditMode() {
  isEditMode.value = true
  resizeMode.value = true
}

function handleDeleteModule(id) {
  layout.value = layout.value.filter((item) => item.i !== id)
}

async function exitEditMode(save = false) {
  if (save) {
    await saveLayoutToFile()
  } else {
    const confirmReset = window.confirm("Discard changes?")
    if (confirmReset) {
      const res = await fetch('/api/load-layout')
      const data = await res.json()
      layout.value = data.map(item => {
        const moduleData = resolveModuleData(item.i)
        return {
          ...item,
          component: moduleData?.component || null,
          props: moduleData?.props || {},
          minW: moduleData?.minW || 2,
          minH: moduleData?.minH || 2
        }
      })
    }
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

  const moduleData = resolveModuleData(modData.id)
  if (!moduleData) {
    console.warn(`No module found for ID "${modData.id}"`)
    return
  }

  layout.value.push({
    i: `${modData.id}-${Date.now()}`,
    x: gridX,
    y: gridY,
    w: moduleData.defW,
    h: moduleData.defH,
    minW: moduleData.minW,
    minH: moduleData.minH,
    component: moduleData.component,
    props: {
      ...moduleData.props,
      refreshKey: Date.now()
    }
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

// Dynamically import all modules and wrap their data
const availableModules = ref(
  modules.map(mod => ({
    id: mod.id,
    component: markRaw(mod.component),  // 👈 critical
    props: mod.getProps
      ? mod.getProps({
          events: calendarEvents,
          eventSourceKey,
          onEventAdded: loadEvents
        })
      : {},
    ...mod.defaultLayout,
    defW: mod.defW || 3,
    defH: mod.defH || 5,
    minW: mod.minW || 2,
    minH: mod.minH || 2
  }))
)

async function loadLayoutFromFile() {
  try {
    const res = await fetch('/api/load-layout')
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) throw new Error('Layout is invalid or empty')

    layout.value = data.map(item => {
      const moduleData = resolveModuleData(item.i)
      return {
        ...item,
        component: moduleData?.component || null,
        props: moduleData?.props || {},
        minW: moduleData?.minW || 2,
        minH: moduleData?.minH || 2
      }
    })

    return true // ✅ success
  } catch (err) {
    console.warn('Failed to reload layout from file:', err)
    return false // ❌ failure
  }
}

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

      layout.value = data.map(item => {
  const moduleData = resolveModuleData(item.i)
  return {
    ...item,
    component: moduleData?.component || null,
    props: moduleData?.props || {},
    minW: moduleData?.minW || 2,
    minH: moduleData?.minH || 2
  }
})

      return true
    } catch (err) {
      console.warn(`Failed to load layout from ${url}:`, err)
      return false
    }
  }

  // Load layout, fallback to default if missing
  ;(async () => {
    const loaded = await loadLayoutFromFile()
if (!loaded) {
  console.log('Falling back to default layout.')
  await tryLoadLayout('/api/default-layout')
}

    loadEvents()
  })()
})

function resolveModuleData(id) {
  const match = availableModules.value.find(m => id.startsWith(m.id))
  if (!match) return null

  return {
    component: match.component,
    refreshKey: Date.now(),
    props: match.props || {},
    minW: match.minW || 2,
    minH: match.minH || 2,
    defW: match.defW || 3,
    defH: match.defH || 5
  }
}

watch(resizeMode, async (newVal, oldVal) => {
  if (oldVal && !newVal) {
    if (suppressResizePrompt.value) {
      suppressResizePrompt.value = false
      return
    }

    const confirmSave = window.confirm('Do you want to save layout changes?')
    if (confirmSave) {
      await saveLayoutToFile()
    } else {
      await loadLayoutFromFile() // 👈 restore previous layout
    }
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