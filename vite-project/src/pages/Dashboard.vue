<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <!-- Top Navbar -->
    <Navbar :resizeMode="resizeMode" @toggle-resize="resizeMode = !resizeMode" @add-module="addModule" />

    <!-- Grid Layout Area -->
    <div class="flex-1 relative overflow-hidden">
      <div class="absolute inset-0 z-0">
        <div class="relative w-full h-full min-h-screen pointer-events-auto grid-background">
          <Container
            :layout="layout"
            :gridSize="32"
            :resizeMode="resizeMode"
            :cols="12"
            :maxRows="maxRows.value"
            @update:layout="(newLayout) => layout = newLayout"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
import Container from '../components/Container.vue'
import calendarModule from '../modules/Calendar'
import taskPanelModule from '../modules/TaskPanel'
import streakModule from '../modules/Streak'
import { ref, onMounted, markRaw } from 'vue'
import { watch } from 'vue'



const calendarEvents = ref([])
const calendarComponent = ref(null)
const eventSourceKey = ref(0)
const gridSize = ref(32)
const resizeMode = ref(false)
const maxRows = ref(Math.floor(window.innerHeight / gridSize.value))

function addModule(module) {
  const { i, x, y, w, h, minW, minH } = module
  if ([i, x, y, w, h].some(v => v === undefined)) {
    console.warn('Module missing layout data:', module)
    return
  }

  layout.value.push({
    i, x, y, w, h, minW, minH,
    component: module.component,
    props: module.props
  })
}

const layout = ref([
  {
    ...calendarModule.defaultLayout,
    component: calendarModule.component,
    props: calendarModule.getProps({
      events: calendarEvents,
      eventSourceKey,
      onEventAdded: loadEvents
    })
  }
])

watch(resizeMode, async (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    const confirmSave = window.confirm('Do you want to save layout changes?')
    if (confirmSave) {
      await saveLayoutToFile()
    }
  }
})

async function saveLayoutToFile() {
  try {
    const layoutToSave = layout.value.map(({ i, x, y, w, h, minW, minH }) => ({
      i, x, y, w, h, minW, minH
    }))

    const res = await fetch('/api/save-layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(layoutToSave)
    })

    const data = await res.json()
    if (data.success) {
      console.log('Layout saved.')
    } else {
      console.error('Failed to save layout (server returned error)')
    }
  } catch (err) {
    console.error('Failed to save layout:', err)
  }
}

onMounted(async () => {
  const tryLoadLayout = async (url) => {
    const res = await fetch(url)
    const data = await res.json()

    if (Array.isArray(data) && data.length > 0) {
      layout.value = data.map(item => ({
        ...item,
        component: resolveComponent(item.i),
        props: getComponentProps(item.i)
      }))
      return true
    }

    return false
  }

  const loaded = await tryLoadLayout('/api/load-layout')

  if (!loaded) {
    console.log('Falling back to default layout.')
    await tryLoadLayout('/api/default-layout')
  }

  loadEvents()
})


function resolveComponent(id) {
  switch (id) {
    case 'calendar': return calendarModule.component
    case 'tasks': return taskPanelModule.component
    case 'streak': return streakModule.component
    default: return null
  }
}

function getComponentProps(id) {
  switch (id) {
    case 'calendar':
      return calendarModule.getProps({
        events: calendarEvents,
        eventSourceKey,
        onEventAdded: loadEvents
      })
    case 'tasks':
      return taskPanelModule.getProps({ events: calendarEvents })
    case 'streak':
      return streakModule.getProps()
    default:
      return {}
  }
}

onMounted(() => {
  window.addEventListener('resize', () => {
    maxRows.value = Math.floor(window.innerHeight / gridSize.value)
  })
})

async function loadEvents() {
  const res = await fetch('/api/events')
  calendarEvents.value = await res.json()
  eventSourceKey.value++

  if (calendarComponent.value?.calendarRef) {
    const calendarApi = calendarComponent.value.calendarRef.getApi()
    calendarApi.removeAllEventSources()
    calendarApi.addEventSource({
      id: `source-${eventSourceKey.value}`,
      events: calendarEvents.value
    })
  }
}

onMounted(() => {
  loadEvents()
})

function updatePosition(id, pos) {
  const item = layout.value.find(i => i.id === id)
  if (item) {
    item.x = pos.x
    item.y = pos.y
  }
}

function updateSize(id, size) {
  const item = layout.value.find(i => i.id === id)
  if (item) {
    item.w = size.w
    item.h = size.h
  }
}
</script>

<style scoped>
.grid-background {
  min-height: 100%;
  height: 100%;
  max-height: 100%;
  overflow: visible;
  position: relative;
}
</style>