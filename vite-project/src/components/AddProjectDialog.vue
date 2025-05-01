<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div class="bg-[color:var(--color-surface)] p-6 rounded shadow-xl max-w-md w-full">
        <h3 class="text-xl font-semibold mb-4 text-[color:var(--color-textPrimary)]">Add New Project</h3>
  
        <div class="mb-4">
          <label class="block text-sm font-medium text-[color:var(--color-textSecondary)]">Name</label>
          <input
            v-model="project.name"
            type="text"
            class="w-full mt-1 p-2 rounded border border-[color:var(--color-inputBorder)] bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)]"
          />
        </div>
  
        <div class="mb-4">
          <label class="block text-sm font-medium text-[color:var(--color-textSecondary)]">Description</label>
          <textarea
            v-model="project.description"
            rows="3"
            class="w-full mt-1 p-2 rounded border border-[color:var(--color-inputBorder)] bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)]"
          ></textarea>
        </div>
  
        <div class="flex justify-end gap-2">
          <button
            @click="$emit('close')"
            class="px-4 py-1 rounded border text-sm border-[color:var(--color-borderLight)]"
          >
            Cancel
          </button>
          <button
            @click="saveProject"
            class="px-4 py-1 rounded text-sm text-white bg-[color:var(--color-primary)]"
          >
            Save Project
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useProjectStore } from '@/stores/projectStore'
  
  const emit = defineEmits(['close'])
  const project = ref({ name: '', description: '' })
  const projectStore = useProjectStore()
  
  async function saveProject() {
    if (!project.value.name.trim()) return alert('Project name is required')
  
    try {
      await projectStore.addProject(project.value)
      emit('close')
    } catch (err) {
      console.error('Failed to save project:', err)
      alert('Failed to add project')
    }
  }
  </script>  