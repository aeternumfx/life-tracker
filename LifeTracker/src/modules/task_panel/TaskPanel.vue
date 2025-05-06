<template>
  <div
    class="taskpanel p-4 shadow rounded w-full max-w-sm h-full overflow-y-auto"
    style="background-color: var(--color-surface); color: var(--color-textPrimary); border-color: var(--color-primary);"
  >
    <h2 class="text-lg font-semibold mb-4">Upcoming Events</h2>

    <!-- Event List -->
    <ul class="space-y-2">
      <li
        v-for="event in sortedEvents"
        :key="event.id"
        class="border-b pb-1"
        style="border-color: var(--color-secondary);"
      >
        <strong>{{ event.title }}</strong>
        <div class="text-sm" style="color: var(--color-textSecondary);">
          {{ formatEventDate(event) }}
        </div>
      </li>
    </ul>

  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, markRaw } from 'vue'
import { format, isAfter, startOfToday, addMinutes, isSameDay } from 'date-fns'
import TaskPanelSettings from './TaskPanelSettings.vue'

const props = defineProps({
  refreshKey: Number,
  onSettingsClicked: Function,
  events: {
    type: Array,
    default: () => []
  }
})

onMounted(() => {
  //console.log('🚀 Mounted with refreshKey:', props.refreshKey)

  if (props.onSettingsClicked) {
    props.onSettingsClicked(() => markRaw(TaskPanelSettings))
  }
})


import { useModuleSettingsStore } from '@/stores/moduleSettingsStore'

const settingsStore = useModuleSettingsStore()
const moduleId = 'task_panel'
const settings = computed(() => settingsStore.getSettings(moduleId))

onMounted(() => {
  settingsStore.loadSettings(moduleId)
  if (props.onSettingsClicked) {
    props.onSettingsClicked(() => markRaw(TaskPanelSettings))
  }
})

watch(() => props.refreshKey, () => {
  settingsStore.loadSettings(moduleId)
})


const sortedEvents = computed(() => {
  const today = startOfToday()
  let filtered = [...props.events]
    .filter(event => isAfter(new Date(event.date), today) || isSameDay(new Date(event.date), today))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  if (settings.value.limitEvents) {
    filtered = filtered.slice(0, settings.value.maxEvents)
  }

  return filtered
})

function formatDate(dateStr) {
  return format(new Date(dateStr), 'EEE, MMM d')
}

function formatEventDate(event) {
  const start = new Date(`${event.date}T${event.time || '00:00'}`)
  let end = null

  if (event.duration_minutes) {
    end = addMinutes(start, event.duration_minutes)
  }

  if (!end || isSameDay(start, end)) {
    return formatDate(event.date)
  } else {
    return `${formatDate(start)} - ${formatDate(end)}`
  }
}
</script>


<style scoped>
.taskpanel {
  border-width: 5px;
  border-style: solid;
  border-radius: 2%;
}
</style>