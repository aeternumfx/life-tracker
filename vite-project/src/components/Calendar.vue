<template>
  <div class="w-full h-full flex items-start justify-start p-2">
    <div class="w-[90%] h-[90%] max-w-full max-h-full">
      <!-- your form and calendar -->
      <form @submit.prevent="addEvent" class="space-x-2 mb-4">
        <input v-model="newTitle" placeholder="Event Title" class="border p-1 rounded" />
        <input v-model="newDate" type="date" class="border p-1 rounded" />
        <button type="submit" class="bg-blue-600 text-white px-3 py-1 rounded">Add</button>
      </form>

      <FullCalendar :options="calendarOptions" ref="calendarRef" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'

// ⬇️ Props and emits
const props = defineProps({
  events: Array,
  eventSourceKey: Number
})
const emit = defineEmits(['event-added'])

const newTitle = ref('')
const newDate = ref('')
const calendarRef = ref(null)
defineExpose({ calendarRef })

// 👇 Computed calendar options with dynamic event source ID
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  eventSources: [
    {
      id: `source-${props.eventSourceKey}`,
      events: (fetchInfo, successCallback) => {
        successCallback(props.events || [])
      }
    }
  ]
}))

// ➕ Add new event to backend
async function addEvent() {
  if (!newTitle.value || !newDate.value) return

  const res = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: newTitle.value,
      date: newDate.value,
      is_all_day: true
    })
  })

  const result = await res.json()
  if (result.success) {
    emit('event-added') // Tell the parent to reload events
  }

  newTitle.value = ''
  newDate.value = ''
}
</script>