<template>
  <div class="w-full h-full flex items-start justify-start p-2"
       style="background-color: var(--color-surface); color: var(--color-textPrimary);">
    <div class="w-full h-full max-w-full max-h-full overflow-hidden">
      
      <!-- Add Button -->
      <button @click="dialog?.open()"
              class="px-3 py-1 rounded mb-4"
              style="background-color: var(--color-primary); color: var(--color-textPrimary);">
        Add
      </button>

      <!-- Calendar -->
      <FullCalendar :options="calendarOptions" ref="calendarRef" />

      <!-- Add Dialog -->
      <CalendarAddItemDialog ref="dialog" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import CalendarAddItemDialog from './CalendarAddItemDialog.vue'
import { useEventStore } from '@/stores/eventStore'

const eventStore = useEventStore()

watch(
  () => eventStore.events,
  () => {
    calendarRef.value?.getApi()?.refetchEvents()
  },
  { deep: true }
)

onMounted(async () => {
  await eventStore.loadEvents()
  calendarRef.value?.getApi()?.refetchEvents()
})

onMounted(() => {
  eventStore.loadEvents()
})

const calendarRef = ref(null)
const dialog = ref(null)
defineExpose({ calendarRef })

let resizeObserver
onMounted(() => {
  const el = calendarRef.value?.$el
  if (el) {
    resizeObserver = new ResizeObserver(() => {
      calendarRef.value.getApi().updateSize()
    })
    resizeObserver.observe(el)
  }
})
onBeforeUnmount(() => resizeObserver?.disconnect())

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  eventClick: handleEventClick,
  displayEventEnd: true,
  eventDisplay: 'block',

  eventContent({ event }) {
  const start = new Date(event.start)
  const end = new Date(event.end)

  const startMinutes = start.getHours() * 60 + start.getMinutes()
  const endMinutes = end.getHours() * 60 + end.getMinutes()

  const startPercent = (startMinutes / 1440) * 100
  const endPercent = (endMinutes / 1440) * 100

  const fadeSize = 10
  const gradientStart = Math.max(0, startPercent - fadeSize)
  const gradientFadeStart = startPercent
  const gradientFadeEnd = endPercent
  const gradientEnd = Math.min(100, endPercent + fadeSize)

  // Use CSS var for secondary color
  const gradientStyle = `
    background: linear-gradient(
      to right,
      rgba(var(--color-secondary-rgb), 0) ${gradientStart}%,
      rgba(var(--color-secondary-rgb), 0.8) ${gradientFadeStart}%,
      rgba(var(--color-secondary-rgb), 0.8) ${gradientFadeEnd}%,
      rgba(var(--color-secondary-rgb), 0) ${gradientEnd}%
    );
    border-radius: 4px;
    padding: 2px 4px;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  `

  return {
    html: `<div style="${gradientStyle}">${event.title}</div>`
  }
},

  eventSources: [
    {
      id: 'eventStoreSource',
 events: (fetchInfo, successCallback) => {
   const parsedEvents = (eventStore.events || [])
          .filter(e => !!e.date)
          .map(e => {
            const start = new Date(`${e.date}T${e.time || '00:00'}`)
            if (isNaN(start)) return null
            const end = e.duration_minutes ? new Date(start.getTime() + e.duration_minutes * 60000) : null
            return {
              id: e.id,
              title: e.title,
              start: start.toISOString(),
              end: end?.toISOString(),
              allDay: !!e.is_all_day,
            }
          })
          .filter(Boolean)
        successCallback(parsedEvents)
      }
    }
  ]
}))

async function handleEventClick(info) {
  const confirmed = confirm(`Delete event "${info.event.title}"?`)
  if (!confirmed) return

  try {
    await eventStore.softDeleteEvent(info.event.id)
 await eventStore.loadEvents()
 calendarRef.value?.getApi().refetchEvents()
  } catch (err) {
    console.error('Error deleting event:', err)
  }
}
</script>

<style scoped>
.fc {
  width: 100% !important;
  height: 100% !important;
  font-size: 0.8rem;
}
.fc .fc-scrollgrid {
  height: 100% !important;
}
.fc-view-harness {
  height: 100% !important;
}
</style>