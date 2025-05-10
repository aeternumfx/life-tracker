<template>
    <BaseCalendar view="timeGridWeek" ref="calendarRef" @delete="onDelete" />
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import BaseCalendar from '@/components/BaseCalendar.vue'
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