<template>
  <div class="space-y-4">
    <form @submit.prevent="addEvent" class="space-x-2">
      <input v-model="newTitle" placeholder="Event Title" class="border p-1 rounded" />
      <input v-model="newDate" type="date" class="border p-1 rounded" />
      <button type="submit" class="bg-blue-600 text-white px-3 py-1 rounded">Add</button>
    </form>

    <FullCalendar :options="calendarOptions" ref="calendarRef" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'

// form input fields
const newTitle = ref('')
const newDate = ref('')

// ref to the FullCalendar instance
const calendarRef = ref(null)

// local reactive event list (loaded from backend)
const calendarEvents = ref([])

// 🔁 Fetch events from the backend on mount
onMounted(async () => {
  const res = await fetch('/api/events')
  calendarEvents.value = await res.json()

  // refresh the calendar after loading
  const calendarApi = calendarRef.value.getApi()
  calendarApi.refetchEvents()
})

// ➕ Add a new event and send it to the backend
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
    calendarEvents.value.push({
      id: result.id,
      title: newTitle.value,
      date: newDate.value,
      is_all_day: true
    })

    const calendarApi = calendarRef.value.getApi()
    calendarApi.refetchEvents()
  }

  newTitle.value = ''
  newDate.value = ''
}

// ⬇️ Calendar options, using eventSources (re-fetches data reactively)
const calendarOptions = {
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  eventSources: [
    {
      events: (fetchInfo, successCallback) => {
        successCallback(calendarEvents.value)
      }
    }
  ]
}
</script>