<template>
    <div class="w-full h-full flex items-start justify-start p-2"
         style="background-color: var(--color-surface); color: var(--color-textPrimary);">
      <div class="w-full h-full max-w-full max-h-full overflow-hidden">
        <!-- Form -->
        <form @submit.prevent="addEvent" class="space-x-2 mb-4">
          <input v-model="newTitle" placeholder="Event Title"
            class="border p-1 rounded"
            style="border-color: var(--color-secondary); background-color: var(--color-surface); color: var(--color-textPrimary);" />
  
          <input v-model="newDate" type="date"
            class="border p-1 rounded"
            style="border-color: var(--color-secondary); background-color: var(--color-surface); color: var(--color-textPrimary);" />
  
          <button type="submit"
            class="px-3 py-1 rounded"
            style="background-color: var(--color-primary); color: var(--color-textPrimary);">
            Add
          </button>
        </form>
  
        <!-- Calendar -->
        <FullCalendar :options="calendarOptions" ref="calendarRef" />
      </div>
    </div>
  </template>  
  
  <script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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

  let resizeObserver

onMounted(() => {
  const el = calendarRef.value?.$el
  if (!el) return

  resizeObserver = new ResizeObserver(() => {
    calendarRef.value.getApi().updateSize()
  })
  resizeObserver.observe(el)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

  
  const calendarOptions = computed(() => ({
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    eventClick: handleEventClick,
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
  
  async function handleEventClick(info) {
    const confirmed = confirm(`Delete event "${info.event.title}"?`)
    if (!confirmed) return
  
    try {
      const res = await fetch(`/api/events/${info.event.id}`, {
        method: 'DELETE'
      })
      const result = await res.json()
  
      if (result.success) {
        emit('event-added') // Trigger reload
      } else {
        console.error('Failed to delete event')
      }
    } catch (err) {
      console.error('Error deleting event:', err)
    }
  }
  
  </script>

  <style scoped>
.fc {
  width: 100% !important;
  height: 100% !important;
  font-size: 0.8rem; /* scale down font size for smaller layouts */
}

.fc .fc-scrollgrid {
  height: 100% !important;
}

.fc-view-harness {
  height: 100% !important;
}
</style>