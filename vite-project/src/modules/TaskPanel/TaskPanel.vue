<template>
  <div class="taskpanel p-4 bg-white shadow rounded w-full max-w-sm h-full overflow-y-auto">
    <h2 class="text-lg font-semibold mb-4">Upcoming Events</h2>
    <ul class="space-y-2">
      <li v-for="event in sortedEvents" :key="event.id" class="border-b pb-1">
        <strong>{{ event.title }}</strong>
        <div class="text-sm text-gray-600">{{ formatDate(event.date) }}</div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { format, isAfter, startOfToday } from 'date-fns'

const props = defineProps({
  events: {
    type: Array,
    default: () => []
  }
})

const sortedEvents = computed(() => {
  const today = startOfToday()
  return [...props.events]
    .filter(event => isAfter(new Date(event.date), today) || isSameDay(new Date(event.date), today))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
})

function formatDate(dateStr) {
  return format(new Date(dateStr), 'EEE, MMM d')
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate()
}
</script>

<style scoped>
  .taskpanel{
    border-style: solid;
    border-width: 5px;
    border-radius: 2%;
    border-color: #2062A3;
  }
</style>