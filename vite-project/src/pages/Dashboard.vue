<template>
  <div class="flex h-screen overflow-hidden relative">
    <!-- Grid Layout Area -->
    <div class="absolute inset-0 pointer-events-none z-0">
      <div class="relative w-full h-full pointer-events-auto grid-background">
        <Container
          v-for="item in layout"
          :key="item.id"
          :id="item.id"
          :position="{ x: item.x, y: item.y }"
          :size="{ w: item.w, h: item.h }"
          :minSize="{ w: 2, h: 2 }"
          :resizeMode="resizeMode"
          :gridSize="gridSize"
          @update:position="(pos) => updatePosition(item.id, pos)"
          @update:size="(size) => updateSize(item.id, size)"
        >
          <component
            :is="item.component"
            :ref="item.id === 'calendar' ? 'calendarComponent' : null"
            :events="calendarEvents"
            :event-source-key="eventSourceKey"
            @event-added="loadEvents"
          />
        </Container>
      </div>
    </div>

    <button @click="resizeMode = !resizeMode" class="fixed top-4 left-4 z-50 bg-blue-600 text-white px-2 py-1 rounded">
      {{ resizeMode ? 'Exit Resize Mode' : 'Enter Resize Mode' }}
    </button>
  </div>
</template>


<script setup>
import Container from '../components/Container.vue'
import { ref, onMounted, markRaw } from 'vue'
import Calendar from '../components/Calendar.vue'
import TaskPanel from '../components/TaskPanel.vue'

const calendarEvents = ref([])
const calendarComponent = ref(null)
const eventSourceKey = ref(0) // ✅ you need this
const gridSize = ref(32) // each grid block = 32px (can be user adjustable)
const resizeMode = ref(false) // toggle this to enable drag/resize mode

const layout = ref([
  {
    id: 'calendar',
    x: 0,
    y: 0,
    w: 6,
    h: 5,
    component: markRaw(Calendar),
  },
  {
    id: 'tasks',
    x: 6,
    y: 0,
    w: 3,
    h: 5,
    component: markRaw(TaskPanel),
  }
])

async function loadEvents() {
  const res = await fetch('/api/events')
  calendarEvents.value = await res.json()
  eventSourceKey.value++ // ✅ this works now!

  // Optional, may not even be needed anymore:
  if (calendarComponent.value?.calendarRef) {
    calendarComponent.value.calendarRef.getApi().refetchEvents()
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
  background-image: 
    repeating-linear-gradient(0deg, #e5e7eb 0px, #e5e7eb 1px, transparent 1px, transparent 32px),
    repeating-linear-gradient(90deg, #e5e7eb 0px, #e5e7eb 1px, transparent 1px, transparent 32px);
}
</style>
