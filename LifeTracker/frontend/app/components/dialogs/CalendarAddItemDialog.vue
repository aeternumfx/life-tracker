<template>
    <dialog
      ref="dialogRef"
      class="rounded-xl p-6 w-[500px] max-w-full shadow-xl bg-[color:var(--color-surface)] text-[color:var(--color-textPrimary)]"
    >
      <div class="space-y-4">
        <div class="text-lg font-bold">Add New Item</div>
  
        <!-- Type Selector -->
        <label class="block text-sm mb-1">Type</label>
        <select v-model="selectedType" class="w-full p-2 border rounded">
          <option value="event">Event</option>
          <option value="task">Task</option>
        </select>
  
        <!-- Dynamic Form -->
        <AddEventDialog
          v-if="selectedType === 'event'"
          @item-added="submitEvent"
          @close="close"
        />
        <AddTaskDialog
          v-if="selectedType === 'task'"
          @item-added="submitTask"
          @close="close"
        />
      </div>
    </dialog>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import AddEventDialog from '@/components/dialogs/AddEventDialog.vue'
  import AddTaskDialog from '@/components/dialogs/AddTaskDialog.vue'
  import { useEventStore } from '@/stores/eventStore'
  // Task submission will eventually use the task store
  // import { useTaskStore } from '@/stores/taskStore'
  
  const emit = defineEmits(['item-added'])
  const dialogRef = ref(null)
  const selectedType = ref('event')
  
  function open() {
    selectedType.value = 'event'
    dialogRef.value?.showModal()
  }
  
  function close() {
    dialogRef.value?.close()
  }
  
  const eventStore = useEventStore()
  // const taskStore = useTaskStore()
  
  async function submitEvent(data) {
    await eventStore.addEvent(data)
    await eventStore.loadEvents()
    emit('item-added', data)
    close()
  }
  
  function submitTask(data) {
    // TODO: Replace with real task store logic
    console.warn('Task submission not yet implemented:', data)
    emit('item-added', data)
    close()
  }
  
  defineExpose({ open })
  </script>  