<template>
    <BaseCalendar view="timeGridDay" ref="calendarRef" @delete="onDelete" />
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import BaseCalendar from '@/components/common/BaseCalendar.vue'
  import { useEventStore } from '@/stores/eventStore'
  
  const eventStore = useEventStore()
  const calendarRef = ref(null)
  
  onMounted(() => {
    eventStore.loadEvents()
  })
  
  function onDelete(id) {
    eventStore.deleteEvent(id)
  }
  </script>  