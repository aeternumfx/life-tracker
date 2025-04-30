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
      <AddItemDialog ref="dialog" @item-added="emit('event-added')" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import AddItemDialog from './AddItemDialog.vue'

// Props and emits
const props = defineProps({
  events: Array,
  eventSourceKey: Number
})
const emit = defineEmits(['event-added'])

// Calendar ref
const calendarRef = ref(null)
defineExpose({ calendarRef })

const dialog = ref(null)

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

// FullCalendar config
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

// Delete event logic
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
  font-size: 0.8rem;
}
.fc .fc-scrollgrid {
  height: 100% !important;
}
.fc-view-harness {
  height: 100% !important;
}
</style>