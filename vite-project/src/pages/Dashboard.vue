<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Calendar wrapper with constrained size -->
    <div class="flex-1 min-w-0 overflow-y-auto p-4 max-w-[calc(100%-300px)]">
      <div class="h-full max-h-full overflow-hidden border rounded shadow">
            <Calendar
        ref="calendarComponent"
        :events="calendarEvents"
        :event-source-key="eventSourceKey"
        @event-added="loadEvents"
            />

      </div>
    </div>

    <!-- Sidebar -->
    <div class="w-[300px] shrink-0 border-l border-gray-200 bg-white shadow-lg overflow-y-auto p-4">
      <TaskPanel :events="calendarEvents" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Calendar from '../components/Calendar.vue'
import TaskPanel from '../components/TaskPanel.vue'

const calendarEvents = ref([])
const calendarComponent = ref(null)
const eventSourceKey = ref(0) // ✅ you need this

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
</script>
