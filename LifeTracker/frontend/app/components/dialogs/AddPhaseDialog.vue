<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
    <div class="bg-[color:var(--color-surface)] p-6 rounded shadow-xl max-w-md w-full">
      <h3 class="text-xl font-semibold mb-4 text-[color:var(--color-textPrimary)]">Add New Phase</h3>

      <div class="mb-4">
                <!-- Change this label + input block -->
        <label class="block text-sm font-medium text-[color:var(--color-textSecondary)]">Title</label>
        <input
        v-model="phase.title"
        type="text"
        class="w-full mt-1 p-2 rounded border border-[color:var(--color-inputBorder)] bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)]"
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-[color:var(--color-textSecondary)]">position</label>
        <input
          v-model.number="phase.position"
          type="number"
          min="0"
          class="w-full mt-1 p-2 rounded border border-[color:var(--color-inputBorder)] bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)]"
        />
      </div>

      <div class="flex justify-end gap-2">
        <button
          @click="$emit('close')"
          class="px-4 py-1 rounded border text-sm border-[color:var(--color-borderLight)]"
        >
          Cancel
        </button>
        <button
          @click="submit"
          class="px-4 py-1 rounded text-sm text-white bg-[color:var(--color-primary)]"
        >
          Add Phase
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePhaseStore } from '@/stores/phaseStore'

const props = defineProps({
  projectId: String // ✅ keep as String since it's a UUID
})

const emit = defineEmits(['close', 'added'])

const phase = ref({
  title: '',
  order_index: 0,
})

const phaseStore = usePhaseStore()

async function submit() {
  if (!phase.value.title.trim()) return alert('Phase title is required')

  try {
    const newPhase = {
  title: phase.value.title,
  order_index: phase.value.order_index,
  project_id: props.projectId,
}
    await phaseStore.addPhase(newPhase)
    emit('added', newPhase)
    emit('close')
  } catch (err) {
    console.error('Failed to add phase:', err)
    alert('Failed to create phase')
  }
}
</script>