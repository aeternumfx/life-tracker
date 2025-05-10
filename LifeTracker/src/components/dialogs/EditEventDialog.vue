<template>
    <dialog ref="dialogRef" class="rounded-xl p-6 w-[500px] max-w-full shadow-xl bg-[--color-surface] text-[--color-textPrimary]">
      <div class="space-y-4">
        <div class="text-lg font-bold">Edit Event</div>
  
        <label class="block text-sm">Title</label>
        <input v-model="form.title" type="text" class="w-full p-2 border rounded bg-[--color-input] text-[--color-inputText]" />
  
        <label class="block text-sm">Date</label>
        <input v-model="form.date" type="date" class="w-full p-2 border rounded bg-[--color-input] text-[--color-inputText]" />
  
        <label class="block text-sm">Time</label>
        <input v-model="form.time" type="time" class="w-full p-2 border rounded bg-[--color-input] text-[--color-inputText]" />
  
        <label class="block text-sm">Duration (minutes)</label>
        <input v-model.number="form.duration_minutes" type="number" class="w-full p-2 border rounded bg-[--color-input] text-[--color-inputText]" />
  
        <div class="flex justify-end gap-2 mt-6">
          <button @click="close" class="px-4 py-1 rounded border text-sm">Close</button>
          <button @click="save" class="px-4 py-1 rounded text-sm text-white bg-[--color-primary]">Save and Exit</button>
        </div>
      </div>
    </dialog>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  
  const props = defineProps({
    event: Object
  })
  
  const emit = defineEmits(['save', 'close'])
  const dialogRef = ref(null)
  
  const form = reactive({
    id: '',
    title: '',
    date: '',
    time: '',
    duration_minutes: 0
  })
  
  function open(eventData) {
    Object.assign(form, {
      id: eventData.id,
      title: eventData.title,
      date: eventData.start?.toISOString().slice(0, 10) || '',
      time: eventData.start?.toISOString().slice(11, 16) || '',
      duration_minutes: (new Date(eventData.end) - new Date(eventData.start)) / 60000 || 0
    })
    dialogRef.value?.showModal()
  }
  
  function close() {
    dialogRef.value?.close()
    emit('close')
  }
  
  function save() {
    emit('save', { ...form })
    close()
  }
  
  defineExpose({ open })
  </script>  