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
import { ref } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'

const newTitle = ref('')
const newDate = ref('')
const calendarRef = ref(null)

const calendarEvents = ref([
  { title: 'Example Event', date: '2025-04-24' }
])

function addEvent() {
  if (!newTitle.value || !newDate.value) return

  calendarEvents.value.push({
    title: newTitle.value,
    date: newDate.value
  })

  newTitle.value = ''
  newDate.value = ''

  const calendarApi = calendarRef.value.getApi()
  calendarApi.refetchEvents()
}

// 👇 This object is passed directly to <FullCalendar :options="...">
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