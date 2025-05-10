<template>
    <div class="flex h-screen overflow-hidden">
      <!-- Sidebar: Event Filters + List -->
      <div class="w-[300px] shrink-0 border-r border-gray-200 bg-[--color-surface] p-4 overflow-y-auto">
        <h2 class="text-lg font-semibold mb-2" style="color: var(--color-textPrimary)">Event Browser</h2>
  
        <!-- Search -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search events..."
          class="mb-3 w-full p-2 border rounded bg-[--color-input] text-[--color-inputText]"
        />
  
        <!-- Tag Filters -->
<div class="mb-3">
  <div class="flex items-center justify-between mb-1">
    <h3 class="text-sm font-medium">Tags:</h3>
    <button
      v-if="selectedTags.length"
      @click="selectedTags = []"
      class="text-xs text-[--color-primary] hover:underline"
    >
      Clear
    </button>
  </div>
  <div class="flex flex-wrap gap-1">
    <button
      v-for="tag in allTags"
      :key="tag.id"
      @click="toggleTag(tag.id)"
      :class="[ 'px-2 py-1 text-sm rounded', selectedTags.includes(tag.id) ? 'bg-[--color-primary] text-white' : 'bg-[--color-surfaceAlt] text-[--color-textPrimary]' ]"
    >
      {{ tag.emoji_icon }} {{ tag.label }}
    </button>
  </div>
</div>

  
        <!-- Time Filter + Sync Toggle -->
        <div class="mb-3">
          <label class="block text-sm mb-1">Time Range:</label>
          <select v-model="timeFilter" class="w-full p-2 border rounded bg-[--color-input] text-[--color-inputText]">
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="all">All</option>
          </select>
        </div>
  
        <div class="mb-3 flex items-center justify-between">
          <label for="syncCalendar" class="text-sm">Sync Calendar</label>
          <input id="syncCalendar" type="checkbox" v-model="syncCalendar" />
        </div>
  
        <button @click="showAddDialog = true" class="w-full bg-[--color-primary] text-white py-2 px-4 rounded hover:opacity-90 mb-4">
          ➕ Add Event
        </button>
  
        <div v-if="groupedEvents.length === 0" class="text-[--color-mutedText]">No matching events.</div>
        <div v-else>
          <div v-for="(group, date) in groupedEvents" :key="date" class="mb-4">
            <div class="text-sm font-semibold text-[--color-mutedText] mb-1">{{ date }}</div>
            <ul class="space-y-2">
              <li v-for="event in group" :key="event.id" class="p-2 border rounded bg-[--color-surfaceAlt] text-[--color-textPrimary]">
                <div class="flex items-center gap-2">
                  <span v-if="event.icon">{{ event.icon }}</span>
                  <span class="font-semibold">{{ event.title }}</span>
                </div>
                <div class="text-xs text-[--color-mutedText]">
                  {{ event.time || 'All Day' }}<span v-if="event.duration_minutes"> — {{ event.duration_minutes }} mins</span>
                </div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span
                    v-for="tag in event.tags"
                    :key="tag"
                    class="text-xs px-1 py-0.5 rounded bg-[--color-surface] text-[--color-textSecondary] border"
                  >
                    {{ tagMap[tag]?.emoji_icon || '' }} {{ tagMap[tag]?.label || tag }}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
  
      <!-- Main: Calendar View -->
      <div class="flex-1 overflow-y-auto p-4 bg-[--color-surfaceAlt]">
        <BaseCalendar :events="syncCalendar ? filteredEvents.value : allEvents.value" @delete="handleDeleteEvent" />
      </div>
  
      <!-- Add Event Dialog -->
      <AddEventDialog v-if="showAddDialog" @close="showAddDialog = false" />
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useEventStore } from '@/stores/eventStore'
  import { useTagStore } from '@/stores/tagStore'
  import BaseCalendar from '@/components/common/BaseCalendar.vue'
  import AddEventDialog from '@/components/dialogs/AddEventDialog.vue'
  
  const eventStore = useEventStore()
  const tagStore = useTagStore()
  
  const showAddDialog = ref(false)
  const searchQuery = ref('')
  const selectedTags = ref([])
  const timeFilter = ref('upcoming')
  const syncCalendar = ref(true)
  
  const allEvents = computed(() => eventStore.events)
  const allTags = computed(() => tagStore.tags)

  onMounted(() => {
  eventStore.loadEvents()
  tagStore.loadTags()
})
  
  const tagMap = computed(() => {
    const map = {}
    for (const tag of allTags.value) map[tag.id] = tag
    return map
  })

  async function handleDeleteEvent(id) {
  await eventStore.softDeleteEvent(id)
  await eventStore.loadEvents()
}
  
  function toggleTag(id) {
    const i = selectedTags.value.indexOf(id)
    if (i >= 0) selectedTags.value.splice(i, 1)
    else selectedTags.value.push(id)
  }
  
  function filterByTime(events) {
    const now = new Date()
    return events.filter(e => {
      const eventDate = new Date(e.date)
      if (timeFilter.value === 'upcoming') return eventDate >= now
      if (timeFilter.value === 'past') return eventDate < now
      return true
    })
  }
  
  const filteredEvents = computed(() => {
    let events = [...allEvents.value]
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      events = events.filter(e =>
        e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
      )
    }
    if (selectedTags.value.length > 0) {
      events = events.filter(e =>
        e.tags?.some(t => selectedTags.value.includes(t))
      )
    }
    return filterByTime(events)
  })
  
  const groupedEvents = computed(() => {
    const groups = {}
    for (const e of filteredEvents.value) {
      if (!groups[e.date]) groups[e.date] = []
      groups[e.date].push(e)
    }
    return groups
  })
  </script>