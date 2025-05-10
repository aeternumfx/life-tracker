<!-- src/components/BaseCalendar.vue -->
<template>
    <div class="w-full h-full p-2" style="background-color: var(--color-surface); color: var(--color-textPrimary);">
      <FullCalendar :options="calendarOptions" ref="calendarRef" />
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
  import FullCalendar from '@fullcalendar/vue3'
  import dayGridPlugin from '@fullcalendar/daygrid'
  import timeGridPlugin from '@fullcalendar/timegrid'
  import { useEventStore } from '@/stores/eventStore'
  
  const props = defineProps({
    view: { type: String, default: 'dayGridMonth' } // e.g. 'timeGridWeek'
  })
  const emit = defineEmits(['edit'])
  
  const eventStore = useEventStore()
  const calendarRef = ref(null)
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
    plugins: [dayGridPlugin, timeGridPlugin],
    initialView: props.view,
    eventClick: handleEventClick,
    displayEventEnd: true,
    eventDisplay: 'block',
    eventContent({ event }) {
      if (event.extendedProps?.type === 'task') {
        return {
          html: `<div style="border-radius: 4px; padding: 2px 4px;">${event.title}</div>`
        }
      }
  
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
  
      return { html: `<div style="${gradientStyle}">${event.title}</div>` }
    },
  
    eventSources: [
      {
        id: 'eventStoreSource',
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
      allDay: e.is_all_day === 1 || e.is_all_day === true, // ✅ use correct field
      extendedProps: { type: e.type }
    }
  })
  .filter(Boolean)
            // console.log('[BaseCalendar] Loaded events:', parsed)
          successCallback(parsed)
        }
      }
    ]
  }))
  
  function handleEventClick(info) {
  const rawEvent = info.event
  emit('edit', {
    id: rawEvent.id,
    title: rawEvent.title,
    start: rawEvent.start,
    end: rawEvent.end,
    allDay: rawEvent.allDay,
    extendedProps: rawEvent.extendedProps
  })
}
  </script>
  
  <style scoped>
  .fc {
    width: 100% !important;
    height: 100% !important;
    font-size: 0.8rem;
  }
  .fc .fc-scrollgrid,
  .fc-view-harness {
    height: 100% !important;
  }
  </style>  