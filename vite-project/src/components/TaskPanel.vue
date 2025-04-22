<template>
  <div class="p-4 bg-white shadow rounded w-full max-w-sm h-full overflow-y-auto">
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
import { format } from 'date-fns'

const props = defineProps({
  events: Array
})

const sortedEvents = computed(() => {
  return [...props.events].sort((a, b) => new Date(a.date) - new Date(b.date))
})

function formatDate(dateStr) {
  return format(new Date(dateStr), 'EEE, MMM d')
}
</script>