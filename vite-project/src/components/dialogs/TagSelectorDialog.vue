<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-[--color-surface] text-[--color-textPrimary] p-6 rounded-xl w-full max-w-md shadow-lg">
        <h2 class="text-xl font-semibold mb-4">Pick Tags</h2>
  
        <div class="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto mb-4">
          <label
            v-for="tag in tags"
            :key="tag.id"
            class="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-[--color-surfaceAlt]"
          >
            <input
              type="checkbox"
              :value="tag.id"
              v-model="selected"
              class="accent-[--color-primary]"
            />
            <span>{{ tag.emoji_icon || tag.label }}</span>
            <span class="text-sm text-[--color-mutedText]">({{ tag.label }})</span>
          </label>
        </div>
  
        <div class="flex justify-end gap-2">
          <button
            @click="emit('close')"
            class="px-4 py-1 rounded bg-gray-300 hover:bg-gray-400 text-black"
          >
            Cancel
          </button>
          <button
            @click="emit('confirm', selected)"
            class="px-4 py-1 rounded bg-[--color-primary] text-white hover:opacity-90"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import { useTagStore } from '@/stores/tagStore'
  
  const props = defineProps({
    modelValue: Array
  })
  
  const emit = defineEmits(['close', 'confirm'])
  
  const tagStore = useTagStore()
  const tags = tagStore.tags
  
  const selected = ref([])
  
  watch(
    () => props.modelValue,
    (val) => {
      selected.value = [...val]
    },
    { immediate: true }
  )
  </script>  