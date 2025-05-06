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
const props = {} // optional: keep props empty if needed


const emit = defineEmits(['delete'])

const calendarRef = ref(null)
const dialog = ref(null)
defineExpose({ calendarRef })

watch(
  () => eventStore.events,
  () => {
    const api = calendarRef.value?.getApi()
    if (api) {
      api.removeAllEventSources()
      api.addEventSource(calendarOptions.value.eventSources[0])
    }
  },
  { deep: true }
)


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
  if (event.extendedProps?.type === 'task') {
    return {
      html: `<div style=" border-radius: 4px; padding: 2px 4px;">${event.title}</div>`
    }
  }

  // Normal gradient for events
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
}
,

eventSources: [
  {
    id: 'propSource',
    events: (fetchInfo, successCallback) => {
      const parsed = (eventStore.events || [])
        .map(e => {
          const baseDate = e.date || e.due_date || e.start
          const start = new Date(`${baseDate}T${e.time || '00:00'}`)
          if (isNaN(start)) return null

          const end = e.duration_minutes
            ? new Date(start.getTime() + e.duration_minutes * 60000)
            : null

          return {
            id: e.id,
            title: e.title,
            start: start.toISOString(),
            end: end?.toISOString(),
            allDay: e.allDay ?? true,
            extendedProps: {
              type: e.type // 👈 fix: pass this through!
            }
          }
        })
        .filter(Boolean)

      successCallback(parsed)
      console.log('[Calendar.vue] incoming props.events:', props.events)
      console.log('[Calendar.vue] Parsed events to render:', parsed)
    }
  }
]
}))

function handleEventClick(info) {
  const confirmed = confirm(`Delete event "${info.event.title}"?`)
  if (confirmed) emit('delete', info.event.id)
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