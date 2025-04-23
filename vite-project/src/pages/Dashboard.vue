<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <!-- Top Navbar -->
    <Navbar :resizeMode="resizeMode" @toggle-resize="resizeMode = !resizeMode" />

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
import Calendar from '../components/Calendar.vue'
import TaskPanel from '../components/TaskPanel.vue'
import { ref, onMounted, markRaw } from 'vue'
import { watch } from 'vue'

const calendarEvents = ref([])
const calendarComponent = ref(null)
const eventSourceKey = ref(0)
const gridSize = ref(32)
const resizeMode = ref(false)
const maxRows = ref(Math.floor(window.innerHeight / gridSize.value))

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
    const res = await fetch('/api/save-layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(layout.value)
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
  try {
    const res = await fetch('/api/load-layout')
    const data = await res.json()

    if (Array.isArray(data) && data.length > 0) {
      layout.value = data.map(item => ({
        ...item,
        component: resolveComponent(item.i),
        props: getComponentProps(item.i)
      }))
    } else {
      console.log('No saved layout found, using default.')
      layout.value = getDefaultLayout()
    }
  } catch {
    console.log('Error loading layout, using default.')
    layout.value = getDefaultLayout()
  }

  loadEvents()
})

function getDefaultLayout() {
  return [
    {
      i: 'calendar',
      x: 0,
      y: 0,
      w: 9,
      h: 22,
      minW: 9,
      minH: 22,
      component: markRaw(Calendar),
      props: {
        events: calendarEvents,
        eventSourceKey,
        onEventAdded: loadEvents
      }
    },
    {
      i: 'tasks',
      x: 6,
      y: 0,
      w: 3,
      h: 5,
      component: markRaw(TaskPanel),
      props: {
        events: calendarEvents
      }
    }
  ]
}

function resolveComponent(id) {
  switch (id) {
    case 'calendar': return markRaw(Calendar)
    case 'tasks': return markRaw(TaskPanel)
    default: return null
  }
}

function getComponentProps(id) {
  switch (id) {
    case 'calendar':
      return {
        events: calendarEvents,
        eventSourceKey,
        onEventAdded: loadEvents
      }
    case 'tasks':
      return {
        events: calendarEvents
      }
    default:
      return {}
  }
}

onMounted(() => {
  window.addEventListener('resize', () => {
    maxRows.value = Math.floor(window.innerHeight / gridSize.value)
  })
})

const layout = ref([
  {
    i: 'calendar',
    x: 0,
    y: 0,
    w: 9,
    h: 22,
    minW: 9,
    minH: 22,
    component: markRaw(Calendar),
    props: {
      events: calendarEvents,
      eventSourceKey,
      onEventAdded: loadEvents
    }
  },
  {
    i: 'tasks',
    x: 6,
    y: 0,
    w: 3,
    h: 5,
    component: markRaw(TaskPanel),
    props: {
      events: calendarEvents
    }
  }
])

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